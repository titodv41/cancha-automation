import {chromium} from 'playwright';
import {ProxyAgent,fetch} from 'undici';
import fs from 'node:fs';
const dispatcher=process.env.HTTPS_PROXY?new ProxyAgent({uri:process.env.HTTPS_PROXY,...(process.env.SSL_CERT_FILE?{requestTls:{ca:fs.readFileSync(process.env.SSL_CERT_FILE)}}:{})}):undefined;
export async function openBrowser(viewport={width:1440,height:1000}){
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport,timezoneId:'America/New_York',serviceWorkers:'block'});
 await context.route('**/*',async route=>{
  const req=route.request(),url=req.url();
  if(!url.startsWith('https://'))return route.continue();
  if(!['GET','HEAD'].includes(req.method()))return route.abort('blockedbyclient');
  try{
   const response=await fetch(url,{dispatcher,method:req.method(),headers:req.headers(),body:['GET','HEAD'].includes(req.method())?undefined:req.postDataBuffer(),signal:AbortSignal.timeout(30000)});
   const body=Buffer.from(await response.arrayBuffer()),headers=Object.fromEntries(response.headers);
   delete headers['content-encoding'];delete headers['content-length'];
   await route.fulfill({status:response.status,headers,body});
  }catch{await route.abort('failed')}
 });
 return {browser,context,page:await context.newPage()};
}
