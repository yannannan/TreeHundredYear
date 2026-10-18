const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process'),sharp=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'../..'),read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,p),'utf8')),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const m=read('第九层收势静态采用V1.json'),raw=read(m.sourceCatalog),jobs=read(m.sourceJobs),errors=[],images=[];
 if(raw.length!==8||new Set(raw.map(x=>x.path)).size!==8||m.entries.length!==4)errors.push('8原图/4采用计数错误');
 for(const r of raw){const b=fs.readFileSync(path.join(root,r.path)),meta=await sharp(b).metadata(),j=jobs.find(j=>j.key===r.id);
  if(hash(b)!==r.sha256||b.length!==r.bytes||meta.width!==r.width||meta.height!==r.height||r.upscaled)errors.push(r.id+'原图像素/字节/SHA错误');
  if(!j||hash(fs.readFileSync(j.source))!==r.sha256)errors.push(r.id+'实际生成源字节错误');
  const note=fs.readFileSync(path.join(root,r.path.replace(/\.png$/,'_生成记录.md')),'utf8');if(!j||!note.includes(j.prompt)||!note.includes(j.qa)||!note.includes(r.sha256))errors.push(r.id+'生成提示词/记录缺');
  images.push({id:r.id,width:r.width,height:r.height});
 }
 const accepted=new Set(m.entries.map(r=>r.path)),candidates=raw.filter(r=>!accepted.has(r.path));if(candidates.length!==4||candidates.some(x=>!x.purpose.startsWith('候选')))errors.push('四候选未留档或误采用');
 let copies=0;const targets=new Set(),ledgers=[];
 for(let n=1;n<=32;n++){const id=String(n).padStart(2,'0'),v=n===1?'V2':'V1';ledgers.push({id,data:read(`第${id}集/执行包${v}/连续性与参考校核${v}.json`)});}
 for(const {id,data}of ledgers)for(const s of data.segments){const key=id+'-'+String(s.n).padStart(2,'0'),p=s.prompt||s.promptFile,txt=fs.readFileSync(path.join(root,p),'utf8');
  for(const c of candidates)if(s.refs.some(r=>r.source===c.path)||txt.includes(path.basename(c.path)))errors.push(key+'误用候选 '+c.id);
  for(const r of m.entries){const found=s.refs.filter(x=>x.source===r.path);if(found.length!==Number(r.targets.includes(key)))errors.push(key+'限定采用/重复错误 '+r.id);
   if(found.length){const b=fs.readFileSync(path.join(root,path.dirname(p),found[0].file));if(hash(b)!==r.sha256||found[0].sha256!==r.sha256||!txt.includes(found[0].file)||!txt.includes(r.purpose))errors.push(key+'副本/正文用途错误 '+r.id);copies++;targets.add(key);}
  }
 }
 if(copies!==6||targets.size!==4)errors.push('4段6份采用范围错误');
 const p28=ledgers.find(x=>x.id==='28').data,txt=n=>fs.readFileSync(path.join(root,p28.segments[n-1].prompt),'utf8');
 if(p28.seconds!==180||p28.segments.length!==12||p28.segments[10].lines.length)errors.push('第28集预算或无对白收势段被改');
 const f=txt(11);for(const s of ['0—3秒','3—7秒','7—9秒','9—11秒','11—15秒','链未切断','先抽回同一短刃、左手离固定翼缘','好右脚主负重','9.2—11秒'])if(s==='9.2—11秒'?f.includes(s):!f.includes(s))errors.push('收势整数时轴/动作规则错误：'+s);
 if(!f.includes('每项仅补目标静态时刻')||!f.includes('不以图片/SHA证明真实物理或成片品质')||!f.includes('九个大型铜环')||!f.includes('后门仍闭'))errors.push('终态/验收边界缺');
 if(!p28.segments[10].end.includes('尖段仍原足旁')||!p28.segments[11].end.includes('两截旧剑原软布包'))errors.push('断剑未拾/拾包先后丢失');
 if(!txt(9).includes('只牵翼小角度')||!txt(12).includes('后门已开以后不能套用本闭门远景'))errors.push('牵角/后门参考使用阶段缺');
 const a=cp.spawnSync('git',['diff','--name-only','c5b4a8a','--','人物资产'],{cwd:root,encoding:'utf8'}),b=cp.spawnSync('git',['ls-files','--others','--exclude-standard','--','人物资产'],{cwd:root,encoding:'utf8'}),mastersUntouched=a.status===0&&b.status===0&&!a.stdout.trim()&&!b.stdout.trim();if(!mastersUntouched)errors.push('正式人物服饰目录改动或不可核验');
 const result={date:'2026-10-18',scope:'原像素/源字节/实际记录/采用范围与副本/登记动作静态检查；不证明视频或受力安全',rawOriginals:raw.length,adoptedStatic:m.entries.length,archivedCandidates:candidates.length,images,targetSegments:targets.size,copiedReferencePlacements:copies,episodeSeconds:180,formalCharacterCostumeImagesUntouched:mastersUntouched,nineLargeRings:'终态图人工逐一视检9个；本程序只核图字节，不进行视觉计数或停转检测',errors,actualVideoGenerated:false,actualAudioGenerated:false};
 fs.writeFileSync(path.join(__dirname,'第九层收势采用检查V1.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));if(errors.length)process.exit(1);
})().catch(e=>{console.error(e);process.exitCode=1;});
