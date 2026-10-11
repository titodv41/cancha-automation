import {createHmac,timingSafeEqual,randomUUID} from 'node:crypto';
export const formOrigins=['https://pioneering-friday-005497.framer.app','https://framer.com'];
export function intakeToken(secret,origin,now=Date.now()){
 const payload=Buffer.from(JSON.stringify({origin,expires:now+10*60000,id:randomUUID()})).toString('base64url');
 return payload+'.'+createHmac('sha256',secret).update('cancha-public-intake-v1\n'+payload).digest('base64url');
}
export function verifyIntakeToken(secret,origin,token,now=Date.now()){
 try{if(typeof token!=='string'||token.length>1024)return null;const [payload,mac,...rest]=token.split('.');if(rest.length||!payload||!mac)return null;const expected=createHmac('sha256',secret).update('cancha-public-intake-v1\n'+payload).digest('base64url');if(mac.length!==expected.length||!timingSafeEqual(Buffer.from(mac),Buffer.from(expected)))return null;const data=JSON.parse(Buffer.from(payload,'base64url').toString());return data.origin===origin&&Number.isFinite(data.expires)&&data.expires>now&&data.expires<=now+10*60000&&/^[a-f0-9-]{36}$/.test(data.id)?data:null;}catch{return null;}
}
export function createIntakeGuard(secret,origins=formOrigins){
 const allowed=new Set(origins),counts=new Map();let windowStart=Date.now(),globalCount=0;
 return {allowed(origin){return allowed.has(origin);},cors(origin){return allowed.has(origin)?{'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, X-Cancha-Intake-Token','Access-Control-Max-Age':'600'}:{};},challenge(origin){return intakeToken(secret,origin);},verify(origin,token){return verifyIntakeToken(secret,origin,token);},rate(ip){const now=Date.now();if(now-windowStart>3600000){counts.clear();globalCount=0;windowStart=now;}const n=counts.get(ip)||0;if(n>=30||globalCount>=120)return false;counts.set(ip,n+1);globalCount++;return true;}};
}
