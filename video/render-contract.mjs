import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
export async function motionDesignHash(root,story,brand){
 const code={};for(const path of['video/src/MotionStory.tsx','video/audio/narrate.py','video/audio/soundtrack.mjs','video/audio/model-lock.json'])code[path]=createHash('sha256').update(await readFile(root+'/'+path)).digest('hex');
 return createHash('sha256').update(JSON.stringify({story,brand,code})).digest('hex');
}
export async function explainerDesignHash(root,story,brand){
 const code={};for(const path of['video/src/NewsExplainer.tsx','video/audio/narrate.py','video/audio/soundtrack.mjs','video/audio/model-lock.json'])code[path]=createHash('sha256').update(await readFile(root+'/'+path)).digest('hex');
 return createHash('sha256').update(JSON.stringify({story,brand,code})).digest('hex');
}
