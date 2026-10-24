import{sharedVoiceLedger}from'./shared-voice-ledger.mjs';import{sourceSession}from'./source-session.mjs';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {fetch, ProxyAgent} from 'undici';
import {elevenClient, inspectVoiceAccount, generateVoice, validateVoiceBatch,validateFreePreviewAccount,selectVoiceCandidates} from '../video/audio/premium-voice.mjs';

const action = process.argv[2] || 'check';
if (!['check', 'audition','free-audition'].includes(action)) throw Error('Use check, audition or free-audition');
const free=action==='free-audition';
const policy = JSON.parse(await readFile(free?'config/elevenlabs-free-preview.json':'config/premium-voice.json'));
const candidates = selectVoiceCandidates(policy, process.env.CANCHA_VOICE_CANDIDATE || 'Chris');
const selectedPolicy = {...policy, candidates};
const story = JSON.parse(await readFile(free?'content/instagram/story-narration.json':'content/instagram/club-cut.json'));
if(action==='audition'&&policy.paidGenerationEnabled!==true)throw Error('Paid narration is disabled; use the free voice auditions');
const out = 'private-data/premium-voice';
await mkdir(out, {recursive: true, mode: 0o700});
const dispatcher = process.env.HTTPS_PROXY ? new ProxyAgent({uri: process.env.HTTPS_PROXY, ...(process.env.SSL_CERT_FILE ? {requestTls: {ca: await readFile(process.env.SSL_CERT_FILE)}} : {})}) : undefined;
let shared,session;
try {
  const api = elevenClient({key: process.env.ELEVENLABS_API_KEY, fetchImpl: (u, opts) => fetch(u, {...opts, dispatcher})});
  const account = await inspectVoiceAccount(api, action === 'check' ? policy : selectedPolicy);
  await writeFile(out + '/account-check.json', JSON.stringify(account, null, 2), {mode: 0o600});
  console.log('Voice account checked. Candidate availability: ' + account.voices.map(v => v.name + '=' + v.available).join(', '));
  if (action === 'audition'||free) {
    if (!free&&account.subscription.tier === 'free') throw Error('Use free-audition for private Free-tier voice tests');
    if (!free&&!account.subscription.overagesDisabled) throw Error('Set the provider usage-based credit limit to zero before generation');
    const mode=free?'free-preview':'paid';
    const count = validateVoiceBatch(story.script, candidates, policy,{mode});
    if(free)validateFreePreviewAccount(account,count);
    if (!Number.isFinite(account.subscription.characterLimit) || !Number.isFinite(account.subscription.characterCount) || account.subscription.characterLimit - account.subscription.characterCount < count) throw Error('Insufficient confirmed plan credits');
    if (account.voices.some(v => !v.available)) throw Error('A configured stock voice is unavailable; select a voice after reviewing the account check');
    const ledgerDir=out+(free?'/free-ledger':'/ledger');if(free){session=sourceSession();shared=await sharedVoiceLedger({directory:ledgerDir,session,allowLocal:true});await shared.cache();}
    const results = [];
    for (const candidate of candidates) results.push(await generateVoice({api, text: story.script, candidate, policy, ledgerDir, onLedgerSave:shared?.save, offset: story.narrationOffset,mode,account}));
    await writeFile(out + '/auditions.json', JSON.stringify({storyId: story.id, results}, null, 2), {mode: 0o600});
    console.log(results.length + ' private audition(s) prepared. Nothing scheduled or published.');
  }
  await writeFile(out + '/status.json', JSON.stringify({action, status: 'complete', published: false}, null, 2), {mode: 0o600});
} catch (error) {
  await writeFile(out + '/status.json', JSON.stringify({action, status: 'blocked', reason: error.message, published: false}, null, 2), {mode: 0o600});
  console.error(error.message); process.exitCode = 1;
}
finally {if(shared)await shared.close();if(session)await session.close(); if (dispatcher) await dispatcher.close(); }
