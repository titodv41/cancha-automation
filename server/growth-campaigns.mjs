export const CANCHA_ORIGIN='https://pioneering-friday-005497.framer.app';
const sources=new Set(['instagram','facebook','community']);
export function campaignLink(campaign,{source='instagram',content='bio',near=''}={}){
 if(!sources.has(source)||!/^\/[a-z/]*$/.test(campaign.path)||!/^[a-z0-9-]{1,60}$/.test(campaign.id)||!/^[a-z0-9_-]{1,100}$/.test(content))throw Error('Invalid campaign link');
 const u=new URL(campaign.path,CANCHA_ORIGIN);for(const[k,v]of Object.entries(campaign.filters||{}))if(['age','level','activity','region','view'].includes(k)&&typeof v==='string')u.searchParams.set(k,v);
 if(near){if(!/^(?:\d{5}|[a-z .'-]{2,50})$/i.test(near))throw Error('Use a ZIP or city only');u.searchParams.set('near',near)}
 u.searchParams.set('utm_source',source);u.searchParams.set('utm_medium',source==='instagram'?'organic_social':'community');u.searchParams.set('utm_campaign',campaign.id);u.searchParams.set('utm_content',content);return u.href;
}
