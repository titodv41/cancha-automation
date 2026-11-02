// Populate Framer's virtual typecheck session in dependency order, using reviewed
// sources for files in this release and live content for unchanged dependencies.
// This does not write to the editor or publish anything.
export async function typecheckReviewedCode(f,files,sources,{session,loaded=new Set()}={}){
 const visiting=new Set();
 async function check(name){
  if(loaded.has(name))return;
  if(visiting.has(name))throw Error('Circular typecheck dependency: '+name);
  const content=Object.hasOwn(sources,name)?sources[name]:files.find(x=>x.name===name)?.content;
  if(typeof content!=='string')throw Error('Missing typecheck dependency: '+name);
  visiting.add(name);
  for(const m of content.matchAll(/from\s*['"]\.\/([\w-]+\.tsx)['"]/g))await check(m[1]);
  const errors=await f.typecheckCode(name,content,undefined,session);
  if(errors.length)throw Error('Reviewed release dependency '+name+' has type errors');
  visiting.delete(name);loaded.add(name);
 }
 for(const name of Object.keys(sources))await check(name);
 return [...loaded];
}
