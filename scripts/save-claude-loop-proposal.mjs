import{readFile,writeFile}from'node:fs/promises';import{validateLoopPolicy,validateProposal}from'../server/claude-improvement-loop.mjs';
const p=validateLoopPolicy(JSON.parse(await readFile('config/claude-improvement-loop.json'))),packet=JSON.parse(await readFile('private-data/claude-loop/input/packet.json')),proposal=JSON.parse(process.env.CLAUDE_REVIEW_JSON||'null');
if(JSON.stringify(proposal).match(/sk-ant-[A-Za-z0-9_-]{12,}|github_pat_[A-Za-z0-9_]{12,}|ghp_[A-Za-z0-9]{20,}/))throw Error('Output resembles a credential; no artifact or PR will be created');
const checked=validateProposal(proposal,packet.files,{...p,allowedPaths:p.allowedPaths});for(const e of proposal.edits)if(!packet.focusPaths.includes(e.path))throw Error('Output escaped its focused input');
await writeFile('private-data/claude-loop/proposal.json',JSON.stringify(proposal,null,2),{mode:0o600});console.log(JSON.stringify({validated:true,status:proposal.status,changedFiles:checked.changes.map(c=>c.path)}));
