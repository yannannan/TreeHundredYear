const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process');
const dir=__dirname,root=path.resolve(dir,'../..'),plan=JSON.parse(fs.readFileSync(path.join(dir,'全季混合道具引用修订计划V20.json'),'utf8')),hash=b=>crypto.createHash('sha256').update(b).digest('hex'),norm=s=>s.replace(/\r\n/g,'\n'),errors=[],files=new Map();
const oldFile=p=>cp.execFileSync('git',['show',plan.baselineCommit+':'+p],{cwd:root,encoding:'utf8',maxBuffer:20*1024*1024});
let segments=0,refs=0,checkedRows=0,defaultPoseRisks=0,unrestrictedLostTokenRisks=0,normalizedScenePurposeRows=0,descriptionSyncSegments=0;
for(let n=1;n<=32;n++){
 const ep=String(n).padStart(2,'0'),v=n===1?'V2':'V1',lp='剧集制作/第一季/第'+ep+'集/执行包'+v+'/连续性与参考校核'+v+'.json',now=JSON.parse(fs.readFileSync(path.join(root,lp),'utf8')),old=JSON.parse(oldFile(lp)),reversed=JSON.parse(JSON.stringify(now));
 for(const s of now.segments){segments++;refs+=s.refs.length;const key=ep+'-'+String(s.n).padStart(2,'0'),entries=plan.entries.filter(e=>e.segment===key),prompt=s.prompt||s.promptFile,body=fs.readFileSync(path.join(root,prompt),'utf8');let reverted=norm(body);
 for(const r of s.refs){const marker=r.file+'：',ll=body.split('\n').filter(line=>line.includes(marker)&&/^[ \t]*(?:\d+[.)、]\s*|[-*]\s*)?$/.test(line.slice(0,line.indexOf(marker))));
  if(ll.length!==1){errors.push('用途行缺失/不唯一 '+key+' '+r.file);continue;}const purpose=ll[0].slice(ll[0].indexOf(marker)+marker.length).trim();
  if((r.source||'').endsWith('/PROP02_修物短刃探路绳V1.png')&&purpose.includes('角色右手握刀柄'))defaultPoseRisks++;
  if((r.source||'').endsWith('/PROP03_旧铁剑剑鞘古符V1.png')&&((n===3&&s.n>=4)||n>=4)&&purpose.replace(/。$/,'')==='锁旧铁剑与完整鞘、暗铜古符和隔布；覆盖旧角色图附带装饰剑')unrestrictedLostTokenRisks++;
 }
 for(const e of entries){const r=s.refs.find(r=>r.source===e.source&&r.file===e.file);if(!r||r.purpose!==e.newPurpose||!body.includes(e.file+'：'+e.newPurpose))errors.push('新用途未实际落实 '+key+' '+e.file);
  else{const rb=reversed.segments.find(x=>x.n===s.n).refs.find(x=>x.source===e.source&&x.file===e.file);rb.purpose=e.oldLedgerPurpose;checkedRows++;reverted=reverted.replace(e.file+'：'+e.newPurpose,e.file+'：'+e.oldPurpose);}
  const source=path.join(root,e.source),copy=path.join(path.dirname(path.join(root,prompt)),e.file);for(const file of[source,copy]){if(!files.has(file))files.set(file,hash(fs.readFileSync(file)));if(files.get(file)!==e.sourceSha256)errors.push('原图或副本字节改变 '+key);}
 }
 if(ep==='04'){
  const previous=old.segments.find(x=>x.n===s.n);
  for(const r of s.refs.filter(r=>r.source?.endsWith('/SC-L01_逆重天阶建立镜头V1_精工克制R2.png')||r.source?.endsWith('/SC-L01_梁链真锚动作母图V2_精工克制R2.png'))){
   const was=previous.refs.find(x=>x.source===r.source);if(!was||r.purpose.replaceAll('。','')!==was.purpose.replaceAll('。','')||r.originalSource!==was.originalSource||r.previousSource!==was.previousSource)errors.push('重建场景用途或来源偏移 '+key);
   else{reversed.segments.find(x=>x.n===s.n).refs.find(x=>x.source===r.source).purpose=was.purpose;reverted=reverted.replace(r.file+'：'+r.purpose+'。',r.file+'：'+was.purpose);normalizedScenePurposeRows++;}
  }
  const current='短刃实际位置按本段首尾与下列清单，',previousText='短刃归右腰套，';if(reverted.split(current).length!==2)errors.push('第四集持物模板同步范围不符 '+key);else{reverted=reverted.replace(current,previousText);descriptionSyncSegments++;}
 }
 if(entries.length&&reverted!==norm(oldFile(prompt)))errors.push('参考用途之外提示词有变 '+key);
 }
 if(JSON.stringify(reversed)!==JSON.stringify(old))errors.push('用途之外台账字段有变 '+ep);
}
for(const ep of['二','三','四','六','八','十一','十二']){const b=fs.readFileSync(path.join(dir,'生成第'+ep+'集执行包V1.cjs'),'utf8');if(!b.includes("require('./应用全季混合道具引用V20.cjs')();"))errors.push('缺后置修订钩子 '+ep);}
const imageChanges=cp.execFileSync('git',['-c','core.quotepath=false','-c','core.safecrlf=false','diff','--name-only',plan.baselineCommit],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(p=>/\.(png|jpe?g|webp)$/i.test(p));if(imageChanges.length)errors.push('不应编辑图像');
if(segments!==313||refs!==4290||checkedRows!==88||defaultPoseRisks||unrestrictedLostTokenRisks||normalizedScenePurposeRows!==16||descriptionSyncSegments!==8)errors.push('范围/引用数/残留风险不符');
const result={date:'2026-10-19',baselineCommit:plan.baselineCommit,checkedSegments:segments,referenceCopies:refs,updatedSegments:47,checkedPurposeRows:checkedRows,defaultKnifePoseRowsRemaining:defaultPoseRisks,unrestrictedLostTokenRowsRemaining:unrestrictedLostTokenRisks,narrativeDialogueFirstLastTimingAndOtherLedgerFieldsUnchanged:errors.length===0,changedPromptsOnlyAlterReferencePurposesAndFourthEpisodeGenericKnifeDescription:errors.length===0,fourthEpisodeNormalizedScenePurposeRows:normalizedScenePurposeRows,fourthEpisodeGenericKnifeDescriptionSyncSegments:descriptionSyncSegments,checkedSourceAndCopyFiles:files.size,imageFilesChanged:imageChanges.length,actualVideoGenerated:false,actualAudioGenerated:false,limitations:'只核查指定混合图用途冲突和文件一致性，不证明全部画面、动作、持物或成片已验收。',errors};
fs.writeFileSync(path.join(dir,'全季混合道具引用复核V20.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));if(errors.length)process.exitCode=1;

