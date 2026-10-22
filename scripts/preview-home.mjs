// Local layout preview only. Native Framer forms and CMS routes are tested live.
import {build} from '../video/node_modules/esbuild/lib/main.js';
import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {createServer} from 'node:http';
import {catalogModule} from '../server/discovery-catalog.mjs';
const port=Number(process.env.CANCHA_PREVIEW_PORT||4179);
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Choose a local preview port between 1024 and 65535');
const catalog=JSON.parse(await readFile('private-data/discovery-catalog.json'));
const dir=await mkdtemp(join(tmpdir(),'cancha-home-preview-')),entry=join(dir,'entry.tsx'),root=process.cwd();
await writeFile(entry,`import React from ${JSON.stringify(resolve(root,'video/node_modules/react/index.js'))};import{createRoot}from ${JSON.stringify(resolve(root,'video/node_modules/react-dom/client.js'))};import Home from ${JSON.stringify(resolve(root,'framer/CanchaHome.tsx'))};import Nav from ${JSON.stringify(resolve(root,'framer/CanchaNavigation.tsx'))};import Footer from ${JSON.stringify(resolve(root,'framer/CanchaFooter.tsx'))};createRoot(document.getElementById('app')).render(<><Nav/><Home/><Footer/></>);`);
await build({entryPoints:[entry],outfile:join(dir,'app.js'),bundle:true,jsx:'automatic',alias:{react:resolve('video/node_modules/react'),'react-dom':resolve('video/node_modules/react-dom')},plugins:[{name:'public-catalog',setup(b){b.onResolve({filter:/CanchaDiscoveryData\.tsx$/},()=>({path:'catalog',namespace:'cancha-preview'}));b.onLoad({filter:/.*/,namespace:'cancha-preview'},()=>({contents:catalogModule(catalog),loader:'tsx'}))}}]});
const index='<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cancha home layout preview</title><style>body{margin:0}</style><div id="app"></div><script src="/app.js"></script>';
const server=createServer(async(req,res)=>{if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return}const path=new URL(req.url,'http://localhost').pathname;if(!['/','/app.js'].includes(path)){res.writeHead(404);res.end('Home layout preview only; use production for CMS routes.');return}res.writeHead(200,{'Content-Type':path==='/'?'text/html; charset=utf-8':'text/javascript; charset=utf-8','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:path==='/'?index:await readFile(join(dir,'app.js')))});
server.listen(port,'127.0.0.1',()=>console.log('Home layout preview: http://127.0.0.1:'+port));
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>server.close(async()=>{await rm(dir,{recursive:true,force:true});process.exit(0)}));
