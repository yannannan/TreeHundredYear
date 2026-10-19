const fs=require('fs'),path=require('path'),crypto=require('crypto');
const dir=__dirname,root=path.resolve(dir,'../..'),read=f=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf8')),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const raw=read('完整材质二次修订原图清单V23.json'),jobs=read('完整材质二次修订生成归档V23.json'),input=read('完整材质二次修订输入核对V23.json'),maps=read('精工克制场景采用映射V2.json');
if(raw.length!==2||jobs.length!==2)throw Error('必须两张真实原图');
const planFile=path.join(dir,'完整材质二次修订采用V23.json'),prior=fs.existsSync(planFile)?JSON.parse(fs.readFileSync(planFile,'utf8')):null;
const entries=input.jobs.map(i=>{const r=raw.find(r=>r.id===i.key),j=jobs.find(j=>j.key===i.key),m=maps.find(m=>m.id===i.currentMapId);if(!r||!j||!m||!j.qa.startsWith('采用')||hash(fs.readFileSync(path.join(root,r.path)))!==r.sha256||hash(fs.readFileSync(j.source))!==r.sha256||hash(fs.readFileSync(path.join(root,i.source)))!==i.sha256)throw Error('原图/输入或采用记录不符 '+i.key);
const old=prior?.entries.find(e=>e.id===i.key)?.previousMap||m;if(old.path!==i.source||old.sha256!==i.sha256||![i.source,r.path].includes(m.path))throw Error('采用基线分歧 '+i.key);
const currentMap={...old,path:r.path,width:r.width,height:r.height,bytes:r.bytes,sha256:r.sha256,upscaled:false,purpose:j.qa,review:j.qa,previousAdoptedPath:i.source,latestRevisionId:i.key,baseSourceCatalog:old.sourceCatalog,baseSourceJobs:old.sourceJobs,sourceCatalog:'完整材质二次修订原图清单V23.json',sourceJobs:'完整材质二次修订生成归档V23.json'};
return{id:i.key,status:'adopted-static-material',previousMap:old,currentMap,expectedTargets:i.expectedTargets};});
if(entries.reduce((n,e)=>n+e.expectedTargets.length,0)!==38)throw Error('必须38引用');
const writes=[],copies=[],removes=[],placements=[],operational=[],newMaps=maps.map(m=>entries.find(e=>e.currentMap.id===m.id)?.currentMap||m);
function locate(body,file){const marker=file+'：',lines=body.split('\n'),ii=lines.map((line,i)=>line.includes(marker)&&/^[ \t]*(?:\d+[.)、]\s*|[-*]\s*)?$/.test(line.slice(0,line.indexOf(marker)))?i:-1).filter(i=>i>=0);if(ii.length!==1)throw Error('用途行不唯一 '+file);return{lines,index:ii[0],marker};}
for(let n=1;n<=32;n++){const id=String(n).padStart(2,'0'),v=n===1?'V2':'V1',ledgerFile=path.join(dir,'第'+id+'集/执行包'+v+'/连续性与参考校核'+v+'.json'),l=JSON.parse(fs.readFileSync(ledgerFile,'utf8'));let changed=false;
for(const s of l.segments){const key=id+'-'+String(s.n).padStart(2,'0'),prompt=path.join(root,s.prompt||s.promptFile),folder=path.dirname(prompt);let body=fs.readFileSync(prompt,'utf8'),touch=false;
 for(const e of entries){const r=s.refs.find(r=>[e.previousMap.path,e.currentMap.path].includes(r.source||r.path));if(!r){if(e.expectedTargets.includes(key))throw Error('缺应有引用 '+key);continue;}if(!e.expectedTargets.includes(key))throw Error('超范围引用 '+key);
 const oldPath=path.join(root,e.previousMap.path),newPath=path.join(root,e.currentMap.path),newFile=path.basename(newPath),oldFile=path.basename(oldPath),dest=path.resolve(folder,newFile),old=path.resolve(folder,oldFile);if(path.dirname(dest)!==folder||path.dirname(old)!==folder)throw Error('副本越界');
 if((r.source||r.path)===e.previousMap.path){if(r.sha256.toLowerCase()!==e.previousMap.sha256||hash(fs.readFileSync(old))!==e.previousMap.sha256)throw Error('旧引用SHA分歧 '+key);const located=locate(body,oldFile),line=located.lines[located.index],at=line.indexOf(located.marker)+located.marker.length,actual=line.slice(at).replace(/\r$/,'');
 if(!actual.includes(e.previousMap.review)||!r.purpose.includes(e.previousMap.review))throw Error('旧用途不含既有有限范围 '+key);
 const tag=e.currentMap.path.match(/(R\d+)\.png$/)[1],rev=p=>p.replace(e.previousMap.review,e.currentMap.review).replace(/精工克制R\d+当前采用/g,'精工克制'+tag+'当前采用');located.lines[located.index]=line.slice(0,at)+rev(actual);body=located.lines.join('\n').replaceAll(oldFile,newFile);
 r.previousSource=e.previousMap.path;r.source=e.currentMap.path;if(r.path)r.path=e.currentMap.path;r.file=newFile;r.sha256=e.currentMap.sha256;r.purpose=rev(r.purpose);if(r.width)r.width=e.currentMap.width;if(r.height)r.height=e.currentMap.height;if(r.bytes)r.bytes=e.currentMap.bytes;
 copies.push({source:newPath,dest});removes.push({file:old,sha256:e.previousMap.sha256});touch=true;changed=true;
 }else{if(r.sha256.toLowerCase()!==e.currentMap.sha256||hash(fs.readFileSync(dest))!==e.currentMap.sha256||!body.includes(r.purpose))throw Error('当前引用不符 '+key);locate(body,newFile);}
 placements.push({segment:key,id:e.id,source:e.currentMap.path,file:newFile});
 }if(touch)writes.push({file:prompt,body});
}if(changed)writes.push({file:ledgerFile,body:JSON.stringify(l,null,2)+'\n'});}
if(placements.length!==38)throw Error('引用计数错');
function walk(folder){for(const x of fs.readdirSync(folder,{withFileTypes:true})){const file=path.join(folder,x.name);if(x.isDirectory()){walk(file);continue;}if(!x.name.endsWith('.md')||/生成记录|生成提示词与检查|普查|回执/.test(x.name))continue;const before=fs.readFileSync(file,'utf8');let body=before;for(const e of entries)body=body.replaceAll(path.basename(e.previousMap.path),path.basename(e.currentMap.path));if(body!==before)operational.push({file,body});}}
walk(path.join(root,'场景资产/第一季'));
for(const c of copies){if(fs.existsSync(c.dest)&&hash(fs.readFileSync(c.dest))!==hash(fs.readFileSync(c.source)))throw Error('新副本同名冲突');}
for(const c of copies)fs.copyFileSync(c.source,c.dest);
for(const r of removes){if(hash(fs.readFileSync(r.file))!==r.sha256)throw Error('删除重复副本前SHA不符');fs.unlinkSync(r.file);}
for(const w of [...writes,...operational])fs.writeFileSync(w.file,w.body);
fs.writeFileSync(path.join(dir,'精工克制场景采用映射V2.json'),JSON.stringify(newMaps,null,2)+'\n');
const plan={date:'2026-10-19',baselineCommit:'978e28f',newNativeOriginals:2,placements:38,currentReferenceCopies:4290,scope:'替代2个既有材质源，不增加在用场景数；旧源图/真实生成记录保留，只移除执行目录的旧重复副本',actualVideoGenerated:false,actualAudioGenerated:false,entries};fs.writeFileSync(planFile,JSON.stringify(plan,null,2)+'\n');
const requests=read('非剧情破损收敛修订任务V19.json');requests.status='adopted-static-material';requests.adopted=2;for(const j of requests.jobs){j.status='adopted';j.adoptedTargets=entries.find(e=>e.id===j.key).expectedTargets;}fs.writeFileSync(path.join(dir,'非剧情破损收敛修订任务V19.json'),JSON.stringify(requests,null,2)+'\n');
const out={date:'2026-10-19',newNativeOriginals:2,adoptedReplacements:2,sceneReferencePlacements:38,totalReferenceCopies:4290,formalCharacterCostumeMastersEdited:0,oldSourceOriginalsDeleted:0,actualVideoGenerated:false,actualAudioGenerated:false,placements};fs.writeFileSync(path.join(dir,'完整材质二次修订采用检查V23.json'),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({...out,placements:undefined}));

