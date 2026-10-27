import {withProject} from './project-session.mjs';
// Read-only: prints the lines of Framer's agent command reference about page metadata, deleting nodes and collections.
await withProject(async f=>{
 const prompt=String(await f.agent.getSystemPrompt?.()??await f.getAgentSystemPrompt?.()??'');
 const lines=prompt.split('\n'),hit=/\b(DEL|DELETE|REMOVE|collection|Collection|metaTitle|metaDescription|seo|SEO|title|description|path=|WebPageNode|redirect)\b/;
 console.log('LINES '+lines.length);
 lines.forEach((l,i)=>{if(hit.test(l))console.log(String(i).padStart(5)+': '+l.slice(0,240));});
});
