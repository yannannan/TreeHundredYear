const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process'),sharp=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'../..'),read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,p),'utf8')),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const m=read('第九层战斗静态采用V1.json'),raw=read(m.sourceCatalog),jobs=read(m.sourceJobs),errors=[],images=[];
 if(raw.length!==10||new Set(raw.map(x=>x.path)).size!==10||m.entries.length!==5)errors.push('10原图/5采用计数错误');
 for(const r of raw){const b=fs.readFileSync(path.join(root,r.path)),meta=await sharp(b).metadata(),j=jobs.find(j=>j.key===r.id);
  if(hash(b)!==r.sha256||b.length!==r.bytes||meta.width!==r.width||meta.height!==r.height||r.upscaled)errors.push(r.id+'原图像素/字节/SHA错误');
  if(!j||hash(fs.readFileSync(j.source))!==r.sha256)errors.push(r.id+'未保留实际生成原字节');
  const note=fs.readFileSync(path.join(root,r.path.replace(/\.png$/,'_生成记录.md')),'utf8');if(!j||!note.includes(j.prompt)||!note.includes(j.qa)||!note.includes(r.sha256))errors.push(r.id+'生成记录/实际提示词缺');
  images.push({id:r.id,width:r.width,height:r.height});
 }
 const accepted=new Set(m.entries.map(r=>r.path)),candidates=raw.filter(r=>!accepted.has(r.path));if(candidates.length!==5||candidates.some(x=>!x.purpose.startsWith('候选')))errors.push('五候选未留档或误采用');
 let copies=0;const targets=new Set(),ledgers=[];
 for(let n=1;n<=32;n++){const id=String(n).padStart(2,'0'),v=n===1?'V2':'V1';ledgers.push({id,data:read(`第${id}集/执行包${v}/连续性与参考校核${v}.json`)});}
 for(const {id,data}of ledgers)for(const s of data.segments){const key=id+'-'+String(s.n).padStart(2,'0'),p=s.prompt||s.promptFile,txt=fs.readFileSync(path.join(root,p),'utf8');
  for(const c of candidates)if(s.refs.some(r=>r.source===c.path)||txt.includes(path.basename(c.path)))errors.push(key+'误用候选 '+c.id);
  for(const r of m.entries.map(require('./解析当前场景参考V1.cjs'))){const found=s.refs.filter(x=>x.source===r.path),expected=r.targets.includes(key);if(found.length!==Number(expected))errors.push(key+'采用范围/重复错误 '+r.id);
   if(found.length){const b=fs.readFileSync(path.join(root,path.dirname(p),found[0].file));if(hash(b)!==r.sha256||found[0].sha256!==r.sha256||!txt.includes(found[0].file)||!txt.includes(r.purpose))errors.push(key+'副本/用途正文错误 '+r.id);copies++;targets.add(key);}
  }
 }
 if(copies!==8||targets.size!==7)errors.push('7段/8份采用范围错误');
 const p28=ledgers.find(x=>x.id==='28').data;
 if(p28.seconds!==180||p28.segments.length!==12)errors.push('第28集预算变化');
 const txt=n=>fs.readFileSync(path.join(root,p28.segments[n-1].prompt),'utf8');
 if(!txt(2).includes('腕位短暂经过原胸镜前方')||!txt(2).includes('左伤踝卸重'))errors.push('单符截镜路径或伤脚规则缺');
 if(!txt(6).includes('双靴实地')||!txt(7).includes('只06末及07前4秒'))errors.push('楔稳全身/限定时刻缺');
 if(!p28.segments[7].end.includes('旧铁剑永久两截')||!p28.segments[8].end.includes('尖段仍卫足旁'))errors.push('断剑永久去向丢失');
 if(!txt(10).includes('镜胸侧转仅远边')||!txt(11).includes('先抽回同一短刃、左手离固定翼缘'))errors.push('第二封朝向/抽刀离翼次序缺');
 if(!txt(11).includes('局部嵌框边缘同时缺一小段')||!txt(11).includes('不以图片/SHA证明真实物理或成片品质'))errors.push('破封实图差异/验收边界缺');
 const a=cp.spawnSync('git',['diff','--name-only','20e25ce','--','人物资产'],{cwd:root,encoding:'utf8'}),b=cp.spawnSync('git',['ls-files','--others','--exclude-standard','--','人物资产'],{cwd:root,encoding:'utf8'}),mastersUntouched=a.status===0&&b.status===0&&!a.stdout.trim()&&!b.stdout.trim();if(!mastersUntouched)errors.push('正式人物服饰目录改动或不可核验');
 const result={date:'2026-10-18',scope:'原字节/元数据/记录/限定采用/副本/文字动作规则；不是美术或动态力学光学验收',rawOriginals:raw.length,adoptedStatic:m.entries.length,archivedCandidates:candidates.length,images,currentAdoptedSources:m.entries.map(require('./解析当前场景参考V1.cjs')).map(({id,path,width,height})=>({id,path,width,height})),targetSegments:targets.size,copiedReferencePlacements:copies,episodeSeconds:180,formalCharacterCostumeImagesUntouched:mastersUntouched,errors,actualVideoGenerated:false,actualAudioGenerated:false};
 fs.writeFileSync(path.join(__dirname,'第九层战斗采用检查V1.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));if(errors.length)process.exit(1);
})().catch(e=>{console.error(e);process.exitCode=1;});
