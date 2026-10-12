import {withProject} from './project-session.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
// One-time reviewed launch polish. Re-inspect nodes before running on later dates.
if(new Date().toISOString().slice(0,10)!=='2026-10-12')throw Error('Re-review launch edits before running on another date');
const q=JSON.stringify;
await withProject(async f=>{
 const results=[],backup=`backups/friday-design-${Date.now()}`;await mkdir(backup,{recursive:true,mode:0o700});
 const apply=async(id,path,commands)=>{const before=await f.agent.serialize({id,depth:16},{pagePath:path});await writeFile(`${backup}/${id}.json`,JSON.stringify(before,null,2),{mode:0o600});const flat=n=>[n,...(n.children||[]).flatMap(flat)];
 if(path==='/explore'||path==='/'){
 const list=path==='/explore'?'J2aYs8mcl':'IpKJ_IoYg';const filters=flat(before).find(x=>x.id===list).attributes.collectionList.filters;
 filters.push({variableId:path==='/explore'?'CWTFP3e5o':'hg2trSkq5',transforms:[{name:'contains',value:path==='/explore'?'var(--variable-friday_city)':'Organizer source'}]});
 commands=commands.replace(/SET (J2aYs8mcl|IpKJ_IoYg) collectionList\.filters\.\d+[^;]+;/,`SET ${list} collectionList.filters=${q(JSON.stringify(filters))};`);
 }
 const result=await f.agent.applyChanges(commands,{pagePath:path});results.push({path,result});if((result.errors&&Object.keys(result.errors).length)||result.parseErrors?.length)throw Error(JSON.stringify(result));return result;};
 await apply('U3ge4GVfE','/explore',`+Variable friday_city type="string" scope="U3ge4GVfE" name="City" queryParam="city";
 +FormPlainTextInputNode friday_city_input parent="LVK4UrEBA" name="Find opportunities by city" formInputPlaceholder="City, e.g. Hollywood" variableBinding="var(--variable-friday_city)" formTextInputType="text" fontName="Alumni Sans" fontSize="20px" fill="#FFFFFF" textColor="#0C3E2E" padding="12px" radius="10px" width="1fr" minWidth="180px" height="48px";
 SET J2aYs8mcl collectionList.filters.6.variableId="CWTFP3e5o" collectionList.filters.6.transforms.0.name="contains" collectionList.filters.6.transforms.0.value="var(--variable-friday_city)";
 `);
 const image=(id,parent,height)=>`+ComponentInstanceNode ${id} parent=${q(parent)} name="Guide photograph" component="codeFile/y9wTPDP:default" width="1fr" height="${height}px" $control__image="var(--variable-QR9GXe3Y1)" $control__treatment="Photo" $control__background="Light"; MOVE ${id} parent=${q(parent)} index="0";${height===180?` +RichTextNode ${id}_credit parent=${q(parent)} name="Guide photograph credit" text="var(--variable-YoWWNEKZc)" link.href="var(--variable-ThlG711BE)" fontName="Alumni Sans" fontSize="16px" fontWeight="500" textColor="#446758" width="1fr" height="auto"; MOVE ${id}_credit parent=${q(parent)} index="1";`:""}`;
 await apply('augiA20Il','/',`SET rBx3e9lWs text="Find your next step in Florida soccer.";
 SET jd_ZVNUv8 text="Local clubs, tryouts, training and soccer careers. Find a place to play, learn or contribute.";
 SET XISCZ8by2 text="Local opportunities to explore";
 SET IpKJ_IoYg collectionList.filters.2.variableId="hg2trSkq5" collectionList.filters.2.transforms.0.name="contains" collectionList.filters.2.transforms.0.value="Organizer source";
 SET WUIHCrbF4 text="Practical guides to choosing opportunities, finding support and exploring careers beyond the pitch.";
 ${image('friday_home_guide_photo','uMDdLBFDh',180)}`);
 await apply('OogsDn6ap','/stories',image('friday_index_guide_photo','M6ueob1i9',180));
 await apply('NXTOKTcYh','/stories/:Stories',`${image('friday_detail_guide_photo','DjSSPacgh',280)} MOVE friday_detail_guide_photo parent="DjSSPacgh" index="2";`);
 await writeFile('private-data/friday-design-result.json',JSON.stringify({backup,results},null,2),{mode:0o600});console.log(JSON.stringify({backup,results}));
});
