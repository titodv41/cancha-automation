import {githubStateClient} from './github-state-client.mjs';
import {dateInNewYork} from '../server/offer-expiry.mjs';
import {preparationNeeded} from '../server/preparation-policy.mjs';
let client;
try {
 const event=process.env.GITHUB_EVENT_NAME;
 if(event!=='schedule')console.log('needed=true');
 else {client=githubStateClient();const state=await client.load();if(!state)throw Error('State unavailable');console.log('needed='+preparationNeeded({event,today:dateInNewYork(),lastPreparation:state.dailyPreparation}));}
}catch{console.error('Preparation freshness check failed; preserve private state and inspect the connection.');process.exitCode=1}
finally{await client?.close()}
