// Exercises the browser's real form-origin behavior using isolated credentials.
// Browser requests are bridged to a local fixture, never to the live service.
import assert from 'node:assert/strict';
import http from 'node:http';
import {randomBytes} from 'node:crypto';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {chromium} from 'playwright';
import {createAutomationConsole} from '../server/automation-console.mjs';
const dir=await mkdtemp(join(tmpdir(),'cancha-browser-login-'));
const origin='https://cancha-fixture.example',password=randomBytes(32).toString('base64');
const admin=createAutomationConsole({baseUrl:origin,password,encryptionKey:randomBytes(32).toString('base64'),vaultPath:join(dir,'meta.sqlite'),queuePath:join(dir,'queue.sqlite')});
const server=http.createServer((req,res)=>admin.handle(req,res));
let browser;
try{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const local='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage();let browserOrigin,loginStatus;
 await page.route('**/*',async route=>{
  const request=route.request();assert.equal(new URL(request.url()).origin,origin);
  const headers=await request.allHeaders();
  const response=await fetch(local+new URL(request.url()).pathname,{method:request.method(),headers,body:request.postDataBuffer(),redirect:'manual'});
  if(request.url().endsWith('/admin/login')){browserOrigin=headers.origin;loginStatus=response.status;}
  const responseHeaders=Object.fromEntries(response.headers);
  // Intercept the redirect so Chromium never resolves the fixture hostname.
  if(request.url().endsWith('/admin/login')&&response.status===303){delete responseHeaders.location;await route.fulfill({status:200,headers:responseHeaders,body:'<h1>Fixture login accepted</h1>'});}
  else await route.fulfill({status:response.status,headers:responseHeaders,body:Buffer.from(await response.arrayBuffer())});
 });
 await page.goto(origin+'/admin');
 await page.locator('input[name=password]').fill(password);
 await page.getByRole('button',{name:'Sign in',exact:true}).click();
 assert.equal(browserOrigin,origin);assert.equal(loginStatus,303);
 await page.getByRole('heading',{name:'Fixture login accepted',exact:true}).waitFor({timeout:5000});
 await page.goto(origin+'/admin');await page.getByRole('heading',{name:'Cancha content review',exact:true}).waitFor({timeout:5000});
 assert.equal(browserOrigin,origin);assert.equal(loginStatus,303);const cookie=(await page.context().cookies()).find(x=>x.name==='cancha_admin');assert.ok(cookie?.secure&&cookie.httpOnly&&cookie.sameSite==='Lax');
 for(const rejected of ['null','https://other.example']){
  const response=await fetch(local+'/admin/login',{method:'POST',headers:{Origin:rejected},body:new URLSearchParams({password}),redirect:'manual'});
  assert.equal(response.status,403);
 }
 console.log(JSON.stringify({fixtureOnly:true,browserFormLogin:true,secureSession:true,nullOriginRejected:true,foreignOriginRejected:true,realAccountLogin:false}));
}finally{
 if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));admin.close();await rm(dir,{recursive:true,force:true});
}
