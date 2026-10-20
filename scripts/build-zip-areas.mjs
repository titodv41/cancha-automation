import{readFile,writeFile}from'node:fs/promises';
// Rebuild only from the reviewed, source-recorded public snapshot. Refreshing
// that snapshot is a separate research step; no geocoding calls or API keys.
const data=JSON.parse(await readFile('config/discovery-zip-areas.json'));
if(Object.keys(data.areas).length<800||!data.source.sha256)throw Error('Reviewed ZIP-area snapshot required');
for(const[zip,xy]of Object.entries(data.areas))if(!/^3[234]\d{3}$/.test(zip)||xy.length!==2||!xy.every(Number.isFinite))throw Error('Invalid Florida ZIP area');
const path='framer/DiscoveryModel.tsx',source=await readFile(path,'utf8'),marker='export const ZIP_AREAS:Record<string,number[]>=';
if(!source.includes(marker))throw Error('ZIP area module marker missing');
const start=source.indexOf(marker),end=source.indexOf('\n',start);if(end<0)throw Error('ZIP data end marker missing');await writeFile(path,source.slice(0,start)+marker+JSON.stringify(data.areas)+source.slice(end));
console.log(JSON.stringify({zipAreas:Object.keys(data.areas).length,source:data.source.url}));
