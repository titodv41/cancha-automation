import{createHash}from'node:crypto';
export function sceneDigest(value){
 const stable=x=>Array.isArray(x)?x.map(stable):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).filter(k=>!k.startsWith('$')).sort().map(k=>[k,stable(x[k])])):x;
 return createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');
}
export const contentDigest=value=>createHash('sha256').update(value).digest('hex');
export function validateReleaseContract(actual,expected){
 for(const[name,hash]of Object.entries(expected.codeFiles))if(actual.codeFiles[name]!==hash)throw Error('Discovery code has unreviewed changes: '+name);
 for(const[id,hash]of Object.entries(expected.textStyles||{}))if(actual.textStyles?.[id]!==hash)throw Error('Shared typography has unreviewed changes: '+id);
 for(const[id,hash]of Object.entries(expected.scenes))if(actual.scenes[id]!==hash)throw Error('Discovery page has unreviewed changes: '+id);
 return true;
}
