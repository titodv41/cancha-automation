import{githubStateClient}from'./github-state-client.mjs';
import{openQueue}from'../server/instagram-queue.mjs';
import{restoreState,snapshotState}from'../server/github-state.mjs';
import{refreshMotionEditorial}from'../server/motion-editorial-refresh.mjs';
export async function refreshNarrativeQueue(row){
 const client=githubStateClient(),db=openQueue(':memory:');
 try{const state=await client.load();if(!state?.plan?.enabled)throw Error('Standing plan paused during narrative refresh');restoreState(db,state);const result=refreshMotionEditorial(db,[row]);await client.save(snapshotState(db,state.connection,state));return result;}finally{db.close();await client.close()}
}
