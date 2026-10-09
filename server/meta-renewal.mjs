export async function renewMetaConnection(connection,token,expected,{fetchImpl=fetch}={}){
 if(!token||!/^v\d+\.\d+$/.test(connection.version||'')||!/^\d+$/.test(connection.accountId||'')||connection.accountId!==expected.instagramAccountId)throw Error('Expected Cancha connection and replacement token required');
 const url=new URL('https://graph.facebook.com/'+connection.version+'/'+connection.accountId);url.searchParams.set('fields','id,username');
 const response=await fetchImpl(url,{headers:{Authorization:'Bearer '+token},redirect:'error',signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error('Expected Cancha account could not be verified with the replacement token');const verified=await response.json();
 if(verified.id!==expected.instagramAccountId||verified.username!==expected.username)throw Error('Expected Cancha account does not match replacement token');
 return {...connection,pageToken:token,tokenRefreshedAt:new Date().toISOString()};
}
