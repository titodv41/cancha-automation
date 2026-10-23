import {createHash} from 'node:crypto';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {alignmentToWords, captionGroups} from './caption-timing.mjs';

export function validateVoiceBatch(text, candidates, policy, {mode='paid'}={}) {
  if(mode==='free-preview') {
    if(policy.freePreviewEnabled!==true||policy.paidGenerationEnabled!==false||policy.maxCharactersPerBatch>1500||policy.monthlyProjectCharacterBudget>1500)throw Error('Free preview needs its explicit capped policy; paid generation stays disabled');
  } else if(mode!=='paid'||policy.paidGenerationEnabled!==true)throw Error('Paid narration is disabled; the owner chose free options');
  if (typeof text !== 'string' || !text.trim() || text.length > policy.maxCharactersPerRequest || /[<>\[\]]/.test(text)) throw Error('Use a short plain spoken script, without production instructions');
  if (!candidates.length || candidates.length > 2 || candidates.some(v => !policy.candidates.some(c => c.id === v.id))) throw Error('Choose one or two configured stock voices');
  if (text.length * candidates.length > policy.maxCharactersPerBatch) throw Error('Voice batch exceeds the character cap');
  if (policy.model !== 'eleven_v3' || policy.outputFormat !== 'mp3_44100_128') throw Error('Unreviewed voice model or format');
  return text.length * candidates.length;
}

export function validateFreePreviewAccount(account, characters) {
  if(account?.subscription?.tier!=='free')throw Error('Free-only auditions require a Free account; no paid-plan credits will be used');
  const {characterLimit,characterCount}=account.subscription;
  if(!Number.isInteger(characters)||characters<1||characters>1500||!Number.isFinite(characterLimit)||!Number.isFinite(characterCount)||characterLimit-characterCount<characters)throw Error('Insufficient confirmed free credits for this audition');
  if(account.voices?.some(v=>!v.available))throw Error('A selected stock voice is unavailable on this account');
  return true;
}

// Injected transport is used by tests. Production allows this one HTTPS origin only.
export function elevenClient({key, fetchImpl}) {
  if (!key?.trim()) throw Error('Configure ELEVENLABS_API_KEY as a secret first');
  key=key.trim();
  return async (path, body) => {
    if (!/^\/v1\/(voices|models|user\/subscription|text-to-speech\/[A-Za-z0-9]+\/with-timestamps)(\?|$)/.test(path)) throw Error('Unapproved voice endpoint');
    if (body && !path.startsWith('/v1/text-to-speech/')) throw Error('Only speech generation may use POST');
    let response;
    try { response = await fetchImpl('https://api.elevenlabs.io' + path, {method: body ? 'POST' : 'GET', headers: {'xi-api-key': key, ...(body ? {'content-type': 'application/json'} : {})}, ...(body ? {body: JSON.stringify(body)} : {}), redirect: 'error', signal: AbortSignal.timeout(body ? 120000 : 25000)}); }
    catch { throw Error('Voice request did not complete. Do not automatically retry a generation.'); }
    if (!response.ok) {
      // Never log a provider message/body: it can echo submitted values. Only
      // known machine error codes and the fixed API path are safe diagnostics.
      const codes=new Set(['invalid_api_key','missing_permission','missing_permissions','insufficient_permissions','quota_exceeded','invalid_request','invalid_value','unauthorized','user_not_found','resource_not_found','detected_unusual_activity','payment_required']);
      let code;try{const value=await response.json(),status=value?.detail?.status||value?.error?.code;if(codes.has(status))code=status}catch{}
      throw Error('Voice service returned HTTP '+response.status+' at '+path.split('?')[0]+(code?' ('+code+')':'')+'. Provider error bodies are withheld to protect credentials.');
    }
    try { return await response.json(); } catch { throw Error('Voice service returned invalid JSON; no automatic generation retry.'); }
  };
}

export async function inspectVoiceAccount(api, policy) {
  const [modelRows, voiceResult, subscription] = await Promise.all([api('/v1/models'), api('/v1/voices'), api('/v1/user/subscription')]);
  if (!Array.isArray(modelRows) || !modelRows.some(m => m.model_id === policy.model && m.can_do_text_to_speech)) throw Error('Selected timestamp-capable TTS model is not available');
  const voices = policy.candidates.map(v => {
    const match = voiceResult.voices?.find(x => x.voice_id === v.id);
    return {...v, available: Boolean(match), ...(match?.preview_url?.startsWith('https://') ? {previewUrl: match.preview_url} : {})};
  });
  // Explicitly select safe fields; never persist the /user response or API credentials.
  const overagesDisabled = subscription.max_credit_limit_extension === 0 || (subscription.max_credit_limit_extension === undefined && subscription.allowed_to_extend_character_limit === false);
  return {model: policy.model, voices, subscription: {tier: subscription.tier, characterCount: subscription.character_count, characterLimit: subscription.character_limit, nextReset: subscription.next_character_count_reset_unix, overagesDisabled}};
}

export async function generateVoice({api, text, candidate, policy, ledgerDir, now = new Date(), offset = 0.25, mode='paid', account=null}) {
  validateVoiceBatch(text, [candidate], policy,{mode});
  if(mode==='free-preview')validateFreePreviewAccount(account,text.length);
  if(!Number.isFinite(offset)||offset<0)throw Error('Invalid narration offset');
  await mkdir(ledgerDir, {recursive: true, mode: 0o700});
  const ledgerPath = ledgerDir + '/ledger.json';
  let ledger;
  try { ledger = JSON.parse(await readFile(ledgerPath, 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; ledger = {months: {}, requests: {}}; }
  const body = {text, model_id: policy.model, voice_settings: policy.voiceSettings, seed: 20261022, language_code: 'en'};
  const digest = createHash('sha256').update(JSON.stringify({candidate: candidate.id, format: policy.outputFormat, body})).digest('hex');
  const month = now.toISOString().slice(0, 7), existing = ledger.requests[digest];
  if (existing?.status === 'complete') {
    try {
      const bytes=await readFile(existing.file),timing=JSON.parse(await readFile(existing.timingFile,'utf8'));
      if(createHash('sha256').update(bytes).digest('hex')!==existing.audioSha256||timing.audioSha256!==existing.audioSha256||timing.script!==text)throw Error('Cache identity changed');
    } catch { throw Error('Completed voice cache is missing or changed. Recover the original artifact; do not automatically regenerate.'); }
    return {...existing, cached: true};
  }
  if (existing) throw Error('An earlier generation is pending or uncertain. Inspect provider history before requesting another take.');
  const reserved = ledger.months[month] || 0;
  if (reserved + text.length > policy.monthlyProjectCharacterBudget) throw Error('Monthly project voice budget reached');
  // Reserve before the chargeable call; failed/uncertain calls remain reserved and cannot retry.
  ledger.months[month] = reserved + text.length;
  ledger.requests[digest] = {status: 'pending', characters: text.length, voice: candidate.name, month};
  await writeFile(ledgerPath, JSON.stringify(ledger, null, 2), {mode: 0o600});
  const result = await api('/v1/text-to-speech/' + candidate.id + '/with-timestamps?output_format=' + policy.outputFormat, body);
  const words = alignmentToWords(result.normalized_alignment || result.alignment, offset);
  if (typeof result.audio_base64 !== 'string' || result.audio_base64.length < 100 || result.audio_base64.length > 15_000_000 || !/^[A-Za-z0-9+/=\r\n]+$/.test(result.audio_base64)) throw Error('Invalid voice audio; generation remains reserved');
  const file = ledgerDir + '/' + digest + '.mp3';
  const bytes=Buffer.from(result.audio_base64,'base64'),audioSha256=createHash('sha256').update(bytes).digest('hex');
  await writeFile(file, bytes, {mode: 0o600});
  const timingFile = ledgerDir + '/' + digest + '.json';
  await writeFile(timingFile, JSON.stringify({provider: 'elevenlabs', model: policy.model, voice: candidate.name, script: text, audioSha256, offset, words, groups: captionGroups(words),use:mode==='free-preview'?'private-audition':'paid-audition',automaticPublication:false}, null, 2), {mode: 0o600});
  const completed = {status: 'complete', voice: candidate.name, file, timingFile, characters: text.length, month, audioSha256};
  ledger.requests[digest] = completed;
  await writeFile(ledgerPath, JSON.stringify(ledger, null, 2), {mode: 0o600});
  return {...completed, cached: false};
}
