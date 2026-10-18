const fs=require('fs'),path=require('path'),crypto=require('crypto'),sharp=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const dir=__dirname,root=path.resolve(dir,'../..'),read=f=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf8')),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const tasks=['现代雨夜原图视检任务V1.json','父女返乡原图视检任务V1.json','塔外空鞘接触原图视检任务V13.json'].flatMap(read),file='场景原图合规视检登记V1.json',previous=fs.existsSync(path.join(dir,file))?read(file):[],ledgers=[];
 for(let n=1;n<=32;n++){const id=String(n).padStart(2,'0'),v=n===1?'V2':'V1',rel='第'+id+'集/执行包'+v+'/连续性与参考校核'+v+'.json';ledgers.push({id,file:rel,data:read(rel)});}
 const entries=[];
 for(const t of tasks){const b=fs.readFileSync(path.join(root,t.path)),m=await sharp(b).metadata(),sha256=hash(b),old=previous.find(r=>r.path===t.path),targets=ledgers.flatMap(({id,data})=>data.segments.filter(s=>s.refs.some(r=>r.source===t.path)).map(s=>id+'-'+String(s.n).padStart(2,'0')));if(!t.review.startsWith('原图有限视检通过')||!targets.length)throw Error('视检/采用范围未登记 '+t.id);if(old&&(old.sha256!==sha256||JSON.stringify(old.expectedTargets)!==JSON.stringify(targets)))throw Error('已冻结原图或范围改变 '+t.id);entries.push({...t,date:t.date||old?.date||'2026-10-19',width:m.width,height:m.height,bytes:b.length,sha256,expectedTargets:targets,status:'reviewed-as-is',imageEdited:false,generatedThisBatch:false,upscaled:false});}
 // Validate all inputs before writing registry, prompts and ledgers.
 const pending=[];let copies=0;const touched=new Set();
 for(const l of ledgers){let changed=false;for(const s of l.data.segments){const prompt=path.join(root,s.prompt||s.promptFile);let body=fs.readFileSync(prompt,'utf8'),local=false;
  for(const r of s.refs){const e=entries.find(e=>e.path===r.source);if(!e)continue;if(r.sha256!==e.sha256||hash(fs.readFileSync(path.join(path.dirname(prompt),r.file)))!==e.sha256)throw Error('原图副本字节不符 '+r.file);
   const lines=body.split('\n'),marker=r.file+'：',indices=lines.map((line,i)=>{const at=line.indexOf(marker);return at>=0&&/^[ \t]*(?:\d+[.)、]\s*|[-*]\s*)?$/.test(line.slice(0,at))?i:-1;}).filter(i=>i>=0);
   if(indices.length!==1)throw Error('无法唯一定位原图用途行 '+r.file);
   const i=indices[0],at=lines[i].indexOf(marker),actual=lines[i].slice(at+marker.length).replace(/\r$/,''),base=actual.split('；新标准原图视检：')[0];
   const purpose=base.split('；旧尺度场景待按精工克制V2修订')[0]+'；新标准原图视检：'+e.review+'；本次未重绘或生成，原逐段动作/声音/数量/状态限制保留';
   lines[i]=lines[i].slice(0,at)+marker+purpose;body=lines.join('\n');r.purpose=purpose;copies++;local=true;
  }
  if(local){pending.push({file:prompt,body});touched.add(l.id+'-'+String(s.n).padStart(2,'0'));changed=true;}
 }if(changed)pending.push({file:path.join(dir,l.file),body:JSON.stringify(l.data,null,2)+'\n'});}
 fs.writeFileSync(path.join(dir,file),JSON.stringify(entries,null,2)+'\n');for(const p of pending)fs.writeFileSync(p.file,p.body);
 const result={date:'2026-10-19',reviewedUnchangedOriginals:entries.length,copiedPlacements:copies,updatedSegments:[...touched],generatedImagesThisBatch:0,editedImages:0,actualVideoGenerated:false,actualAudioGenerated:false};fs.writeFileSync(path.join(dir,'场景原图视检采用检查V1.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
})().catch(e=>{console.error(e);process.exitCode=1;});
