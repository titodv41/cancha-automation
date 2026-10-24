import{mkdtemp,rm}from'node:fs/promises';import{join}from'node:path';import{tmpdir}from'node:os';
import{githubStateClient}from'./github-state-client.mjs';
import{openQueue}from'../server/instagram-queue.mjs';
import{restoreState,snapshotState}from'../server/github-state.mjs';
import{refreshMotionEditorial}from'../server/motion-editorial-refresh.mjs';
export async function refreshNarrativeQueue(row){
 const client=githubStateClient(),directory=await mkdtemp(join(tmpdir(),'cancha-narrative-refresh-')),db=openQueue(join(directory,'queue.sqlite'));
 try{const state=await client.load();if(!state?.plan?.enabled)throw Error('Standing plan paused during narrative refresh');restoreState(db,state);const result=refreshMotionEditorial(db,[row]);await client.save(snapshotState(db,state.connection,state));return result;}finally{db.close();await client.close();await rm(directory,{recursive:true,force:true})}
}
