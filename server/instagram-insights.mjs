const metrics=['reach','saved','shares','likes','comments','total_interactions'];
// Preserve actionable permission names, never Meta's raw error text, URLs,
// trace IDs, account details or token values.
export function insightPermissionDiagnostic(error){
 const names=['instagram_manage_insights','instagram_basic','instagram_content_publish','pages_read_engagement','pages_show_list','ads_management','ads_read','business_management'];
 const message=typeof error?.message==='string'?error.message:'';
 const mentionedPermissions=names.filter(name=>new RegExp('\\b'+name+'\\b','i').test(message));
 return{code:Number.isInteger(error?.code)?error.code:null,subcode:Number.isInteger(error?.error_subcode)?error.error_subcode:null,
  category:mentionedPermissions.some(name=>name==='ads_management'||name==='ads_read')?'business_manager_permission':mentionedPermissions.includes('instagram_manage_insights')?'insights_permission':/advanced access|app review|approved|access level/i.test(message)?'app_access_level':'permission_denied',mentionedPermissions};
}
// Keep only the age window used by comparisons in durable state. The private
// report artifact retains the full read; daily snapshots must not grow forever.
export function learningSnapshot(report){return{...report,posts:(report.posts||[]).filter(p=>{const age=(Date.parse(report.collectedAt)-Date.parse(p.publishedAt))/3600000;return age>=48&&age<192}),unavailableMetrics:[],recommendations:[]};}
export function instagramLearning(reports){
 const first=new Map();for(const r of [...reports].sort((a,b)=>Date.parse(a.collectedAt)-Date.parse(b.collectedAt)))for(const p of r.posts||[]){const age=(Date.parse(r.collectedAt)-Date.parse(p.publishedAt))/3600000;if(age<48||age>=192||!Number.isFinite(age)||!(p.metrics.reach>=20)||!Number.isFinite(p.metrics.saved)||!Number.isFinite(p.metrics.shares))continue;const cohort=Math.floor(age/48),key=p.id+':'+cohort;if(!first.has(key))first.set(key,{...p,cohort});}
 const candidates=[];for(const cohort of[1,2,3]){const topics={};for(const p of first.values())if(p.cohort===cohort)(topics[p.topic]||=[]).push((p.metrics.saved+p.metrics.shares)/p.metrics.reach*100);const comparison=Object.entries(topics).filter(([,v])=>v.length>=5).map(([topic,v])=>({topic,posts:v.length,savesAndSharesPer100Reached:v.reduce((a,b)=>a+b,0)/v.length})).sort((a,b)=>b.savesAndSharesPer100Reached-a.savesAndSharesPer100Reached);if(comparison.length>=2)candidates.push({ageCohortHours:[cohort*48,(cohort+1)*48],topicComparison:comparison});}
 return candidates.sort((a,b)=>b.topicComparison.reduce((n,t)=>n+t.posts,0)-a.topicComparison.reduce((n,t)=>n+t.posts,0))[0]||{ageCohortHours:null,topicComparison:[],note:'Insufficient comparable samples: need five posts per topic in two topics, captured in the same 48-hour age cohort between 2 and 8 days after publishing.'};
}
export async function collectInstagramInsights(connection,published,{fetchImpl=fetch,now=new Date()}={}){
 const result={collectedAt:now.toISOString(),readOnly:true,status:'available',posts:[],unavailableMetrics:[],recommendations:[],requiredPermission:null};
 const version=/^v\d+\.\d+$/.test(connection.version||'')?connection.version:'v26.0';
 for(const row of published.slice(-30)){
  if(!/^\d+$/.test(row.published_id||''))continue;let content;try{content=JSON.parse(row.content)}catch{continue}
  const post={id:row.id,mediaId:row.published_id,publishedAt:row.published_at||row.scheduled_at,topic:content.topic||content.sourceType,format:content.format,technique:content.creativeTechnique||null,metrics:{}};
  for(const metric of metrics){
   const url=new URL(`https://graph.facebook.com/${version}/${row.published_id}/insights`);url.searchParams.set('metric',metric);
   let response,data;try{response=await fetchImpl(url,{headers:{Authorization:'Bearer '+connection.pageToken},redirect:'error',signal:AbortSignal.timeout(20000)});data=await response.json()}catch{result.unavailableMetrics.push({post:row.id,metric,reason:'Network or invalid response'});continue}
   if(!response.ok||data.error){const code=data.error?.code;if([10,200].includes(code)){result.status='permission_required';result.requiredPermission='instagram_manage_insights';result.permissionDiagnostic=insightPermissionDiagnostic(data.error);result.posts.push(post);result.recommendations.push('Enable Instagram read-only insights access in the Meta app and reconnect securely. Publishing access does not imply insights access.');return result}if(code===190){result.status='connection_needs_attention';result.recommendations.push('The Meta connection needs a secure renewal. No publishing was attempted.');return result}result.unavailableMetrics.push({post:row.id,metric,reason:'Metric unavailable',code:code||response.status});continue}
   const point=data.data?.find(x=>x.name===metric),value=point?.total_value?.value??point?.values?.at(-1)?.value;if(typeof value==='number'&&Number.isFinite(value))post.metrics[metric]=value;else result.unavailableMetrics.push({post:row.id,metric,reason:'No metric value'});
  }
  result.posts.push(post);
 }
 result.recommendations.push('A single collection is not enough evidence to select a winning topic. Compare accumulated snapshots at similar post ages before changing the mix.');
 if(!result.posts.length)result.status='no_published_posts';else if(result.posts.every(p=>!Object.keys(p.metrics).length))result.status='metrics_unavailable';return result;
}

export function techniqueLearning(reports){
 const snapshots=new Map();
 for(const report of [...reports].sort((a,b)=>Date.parse(a.collectedAt)-Date.parse(b.collectedAt)))for(const p of report.posts||[]){
  const age=(Date.parse(report.collectedAt)-Date.parse(p.publishedAt))/3600000;
  if(age<48||age>=96||!p.technique||!(p.metrics?.reach>=20)||!Number.isFinite(p.metrics.saved)||!Number.isFinite(p.metrics.shares))continue;
  if(!snapshots.has(p.id))snapshots.set(p.id,p);
 }
 const groups={};for(const p of snapshots.values())(groups[p.technique]||=[]).push((p.metrics.saved+p.metrics.shares)/p.metrics.reach*100);
 const comparisons=Object.entries(groups).filter(([,posts])=>posts.length>=5).map(([technique,values])=>({technique,posts:values.length,savesAndSharesPer100Reached:values.reduce((a,b)=>a+b,0)/values.length})).sort((a,b)=>b.savesAndSharesPer100Reached-a.savesAndSharesPer100Reached);
 return{comparisons:comparisons.length>=2?comparisons:[],metric:'saves + shares per 100 reached',ageWindowHours:[48,96],minimumIndependentPostsPerTechnique:5,status:comparisons.length>=2?'comparable-samples':'insufficient-evidence'};
}
