import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {parseArgs} from 'node:util';
import {withProject} from './project-session.mjs';
import {sourceSession} from './source-session.mjs';
import {localStoryDescriptor} from '../server/local-story-source.mjs';
import {narrativeSocialFields} from '../server/narrative-social.mjs';

const {values} = parseArgs({options: {
  story: {type: 'string', default: 'content/instagram/story-narration.json'},
  media: {type: 'string', default: 'content/instagram/single-story.json'},
  social: {type: 'string', default: 'content/instagram/narrative-social.json'},
  audio: {type: 'string'}, timing: {type: 'string'}, revision: {type: 'string'},
}});
if (!values.audio || !values.timing || !values.revision) {
  throw Error('Supply --audio, --timing and --revision for the accepted narration; no voice will be generated.');
}
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const story = JSON.parse(await readFile(values.story));
const media = JSON.parse(await readFile(values.media));
const social = JSON.parse(await readFile(values.social));
const recipe = {id: story.id, sourceId: story.editorialSourceId};
narrativeSocialFields(recipe, social, localStoryDescriptor(recipe.sourceId));
if (media.editorialSourceId !== recipe.sourceId) throw Error('Media does not match this story source');
const audio = await readFile(values.audio);
const timing = JSON.parse(await readFile(values.timing));
if (timing.voice !== 'Chris' || timing.provider !== 'elevenlabs' || timing.script !== story.script || timing.audioSha256 !== sha(audio)) {
  throw Error('Accepted cached Chris narration does not match this story');
}

const registryPath = 'content/instagram/narrative-recipes.json';
const recipes = JSON.parse(await readFile(registryPath));
const session = sourceSession();
const assets = {};
try {
  await withProject(async framer => {
    for (const [name, bytes, mimeType] of [
      ['audio', audio, 'audio/mpeg'],
      ['timing', Buffer.from(JSON.stringify(timing)), 'application/json'],
    ]) {
      const asset = await framer.uploadFile({
        name: 'cancha-' + story.id + '-' + name + (name === 'audio' ? '.mp3' : '.json'),
        file: {bytes: new Uint8Array(bytes), mimeType},
      });
      if (sha(await session.html(asset.url, new RegExp(mimeType), {maxBytes: 2000000})) !== sha(bytes)) {
        throw Error('Accepted narration cache changed');
      }
      assets[name] = {url: asset.url, sha256: sha(bytes)};
    }
  });
  const entry = {
    ...recipe, revision: values.revision, storyPath: values.story, mediaPath: values.media,
    socialPath: values.social, voice: 'Chris', assets,
    ownerDirection: 'Use Chris, moving real club footage behind Cancha overlays, and automatic selection within the existing two daily feed slots.',
  };
  const index = recipes.findIndex(item => item.id === entry.id);
  if (index === -1) recipes.push(entry);
  else recipes[index] = entry;
  await writeFile(registryPath, JSON.stringify(recipes, null, 2) + '\n');
  console.log('Accepted Chris audio and exact timing packed; other recipes preserved. No TTS requested. Standing-plan eligibility remains a separate explicit setting.');
} finally {
  await session.close();
}
