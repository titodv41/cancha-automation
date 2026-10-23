import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {fetch, ProxyAgent} from 'undici';
import {elevenClient, inspectVoiceAccount, generateVoice, validateVoiceBatch} from '../video/audio/premium-voice.mjs';

const policy = JSON.parse(await readFile('config/premium-voice.json'));
const story = JSON.parse(await readFile('content/instagram/club-cut.json'));
const action = process.argv[2] || 'check';
if (!['check', 'audition'].includes(action)) throw Error('Use check or audition');
if(action==='audition'&&policy.paidGenerationEnabled!==true)throw Error('Paid narration is disabled; use the free voice auditions');
const out = 'private-data/premium-voice';
await mkdir(out, {recursive: true, mode: 0o700});
const dispatcher = process.env.HTTPS_PROXY ? new ProxyAgent({uri: process.env.HTTPS_PROXY, ...(process.env.SSL_CERT_FILE ? {requestTls: {ca: await readFile(process.env.SSL_CERT_FILE)}} : {})}) : undefined;
try {
  const api = elevenClient({key: process.env.ELEVENLABS_API_KEY, fetchImpl: (u, opts) => fetch(u, {...opts, dispatcher})});
  const account = await inspectVoiceAccount(api, policy);
  await writeFile(out + '/account-check.json', JSON.stringify(account, null, 2), {mode: 0o600});
  console.log('Voice account checked. Candidate availability: ' + account.voices.map(v => v.name + '=' + v.available).join(', '));
  if (action === 'audition') {
    if (account.subscription.tier === 'free') throw Error('Commercial voice requires a paid commercial plan');
    if (!account.subscription.overagesDisabled) throw Error('Set the provider usage-based credit limit to zero before generation');
    const count = validateVoiceBatch(story.script, policy.candidates, policy);
    if (!Number.isFinite(account.subscription.characterLimit) || !Number.isFinite(account.subscription.characterCount) || account.subscription.characterLimit - account.subscription.characterCount < count) throw Error('Insufficient confirmed plan credits');
    if (account.voices.some(v => !v.available)) throw Error('A configured stock voice is unavailable; select a voice after reviewing the account check');
    const results = [];
    for (const candidate of policy.candidates) results.push(await generateVoice({api, text: story.script, candidate, policy, ledgerDir: out + '/ledger', offset: story.narrationOffset}));
    await writeFile(out + '/auditions.json', JSON.stringify({storyId: story.id, results}, null, 2), {mode: 0o600});
    console.log('Two private auditions prepared. Nothing scheduled or published.');
  }
  await writeFile(out + '/status.json', JSON.stringify({action, status: 'complete', published: false}, null, 2), {mode: 0o600});
} catch (error) {
  await writeFile(out + '/status.json', JSON.stringify({action, status: 'blocked', reason: error.message, published: false}, null, 2), {mode: 0o600});
  console.error(error.message); process.exitCode = 1;
}
finally { if (dispatcher) await dispatcher.close(); }
