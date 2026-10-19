const fs=require('fs'),path=require('path'),crypto=require('crypto');
const dir=__dirname,root=path.resolve(dir,'../..'),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function apply(){
 const plan=JSON.parse(fs.readFileSync(path.join(dir,'全季混合道具引用修订计划V20.json'),'utf8')),ledgers=new Map(),prompts=new Map();
 if(plan.entries.length!==88||new Set(plan.entries.map(e=>e.segment)).size!==47)throw Error('V20范围不符');
 for(const e of plan.entries){
  if(!ledgers.has(e.ledger))ledgers.set(e.ledger,JSON.parse(fs.readFileSync(path.join(root,e.ledger),'utf8')));
  const s=ledgers.get(e.ledger).segments.find(s=>e.segment.endsWith('-'+String(s.n).padStart(2,'0'))),refs=s.refs.filter(r=>r.source===e.source&&r.file===e.file);
  if(refs.length!==1)throw Error('引用不唯一 '+e.segment);const r=refs[0];
  if(![e.oldLedgerPurpose,e.newPurpose].includes(r.purpose)||r.sha256!==e.sourceSha256)throw Error('用途或SHA已分歧 '+e.segment);
  if(hash(fs.readFileSync(path.join(root,e.source)))!==e.sourceSha256||hash(fs.readFileSync(path.join(path.dirname(path.join(root,e.prompt)),e.file)))!==e.sourceSha256)throw Error('原图或副本改变 '+e.segment);
  let body=prompts.has(e.prompt)?prompts.get(e.prompt):fs.readFileSync(path.join(root,e.prompt),'utf8');
  const marker=e.file+'：',lines=body.split('\n'),ii=lines.map((line,i)=>line.includes(marker)&&/^[ \t]*(?:\d+[.)、]\s*|[-*]\s*)?$/.test(line.slice(0,line.indexOf(marker)))?i:-1).filter(i=>i>=0);
  if(ii.length!==1)throw Error('用途行不唯一 '+e.segment);
  const line=lines[ii[0]],at=line.indexOf(marker)+marker.length,old=line.slice(at).trim();
  if(![e.oldPurpose,e.newPurpose].includes(old))throw Error('用途正文已分歧 '+e.segment);
  lines[ii[0]]=line.slice(0,at)+e.newPurpose;prompts.set(e.prompt,lines.join('\n'));r.purpose=e.newPurpose;
 }
 const generators=['二','三','四','六','八','十一','十二'].map(x=>path.join(dir,'生成第'+x+'集执行包V1.cjs'));
 const hook="require('./应用全季混合道具引用V20.cjs')();";
 const hooks=generators.map(file=>{let body=fs.readFileSync(file,'utf8');if(!body.includes(hook))body=body.trimEnd()+'\n\n// 既有混合道具图只取当前剧情允许的部分，后置于原图采用钩子。\n'+hook+'\n';return{file,body};});
 for(const [file,body]of prompts)fs.writeFileSync(path.join(root,file),body);
 for(const [file,value]of ledgers)fs.writeFileSync(path.join(root,file),JSON.stringify(value,null,2)+'\n');
 for(const h of hooks)fs.writeFileSync(h.file,h.body);
 const result={date:'2026-10-19',purposeRowsApplied:88,promptSegments:47,episodeLedgers:7,generatorHooks:7,newImageFiles:0,imageBytesChanged:false,newReferenceCopies:0,actualVideoGenerated:false,actualAudioGenerated:false};
 fs.writeFileSync(path.join(dir,'全季混合道具引用采用检查V20.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
 return result;
}
module.exports=apply;
if(require.main===module)apply();

