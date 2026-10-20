import{readFile,writeFile,mkdir}from'node:fs/promises';import{campaignLink}from'../server/growth-campaigns.mjs';
const plan=JSON.parse(await readFile('config/growth-campaigns.json'));
const links={bio:'https://pioneering-friday-005497.framer.app/clubs?utm_source=instagram&utm_medium=organic_social&utm_campaign=florida_discovery&utm_content=bio',campaigns:plan.campaigns.map(c=>({id:c.id,instagram:campaignLink(c,{content:'feed'}),facebook:campaignLink(c,{source:'facebook',content:'helpful_reply'})}))};
await mkdir('content/growth',{recursive:true});await writeFile('content/growth/campaign-links.json',JSON.stringify(links,null,2)+'\n');console.log(JSON.stringify(links,null,2));
