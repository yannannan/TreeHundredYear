const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process'),sharp=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'../..'),read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,p),'utf8')),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const m=read('沙海追猎静态采用V1.json'),raw=read(m.sourceCatalog),jobs=read(m.sourceJobs),errors=[],images=[];
 if(raw.length!==9||new Set(raw.map(x=>x.path)).size!==9||m.entries.length!==7)errors.push('9原图/7采用计数错误');
 for(const r of raw){const b=fs.readFileSync(path.join(root,r.path)),meta=await sharp(b).metadata(),j=jobs.find(j=>j.key===r.id);
  if(hash(b)!==r.sha256||b.length!==r.bytes||meta.width!==r.width||meta.height!==r.height||r.upscaled)errors.push(r.id+'原图像素/字节/SHA错误');
  if(!j||hash(fs.readFileSync(j.source))!==r.sha256)errors.push(r.id+'实际原字节来源错误');
  const note=fs.readFileSync(path.join(root,r.path.replace(/\.png$/,'_生成记录.md')),'utf8');if(!j||!note.includes(j.prompt)||!note.includes(j.qa)||!note.includes(r.sha256))errors.push(r.id+'实际提示词/记录缺');
  if(j?.inputs?.length>5)errors.push(r.id+'实际归档输入超过已验证工具限制');
  images.push({id:r.id,width:r.width,height:r.height});
 }
 const accepted=new Set(m.entries.map(r=>r.path)),candidates=raw.filter(r=>!accepted.has(r.path));if(candidates.length!==2||candidates.some(x=>!x.purpose.startsWith('候选')))errors.push('两候选未明确留档');
 let copies=0;const targets=new Set(),ledgers=[];
 for(let n=1;n<=32;n++){const id=String(n).padStart(2,'0'),v=n===1?'V2':'V1';ledgers.push({id,data:read(`第${id}集/执行包${v}/连续性与参考校核${v}.json`)});}
 for(const {id,data}of ledgers)for(const s of data.segments){const key=id+'-'+String(s.n).padStart(2,'0'),p=s.prompt||s.promptFile,txt=fs.readFileSync(path.join(root,p),'utf8');
  for(const c of candidates)if(s.refs.some(r=>r.source===c.path)||txt.includes(path.basename(c.path)))errors.push(key+'误用候选 '+c.id);
  for(const original of m.entries){const r=require('./解析当前场景参考V1.cjs')(original),found=s.refs.filter(x=>x.source===r.path);if(found.length!==Number(r.targets.includes(key)))errors.push(key+'限定采用范围/重复错误 '+r.id);
   if(found.length){const b=fs.readFileSync(path.join(root,path.dirname(p),found[0].file));if(hash(b)!==r.sha256||found[0].sha256!==r.sha256||!txt.includes(found[0].file)||!txt.includes(r.purpose))errors.push(key+'副本/正文用途错误 '+r.id);copies++;targets.add(key);}
  }
 }
 if(copies!==9||targets.size!==5)errors.push('5段/9副本范围错误');
 const p9=ledgers.find(x=>x.id==='09').data,p10=ledgers.find(x=>x.id==='10').data,txt=(ep,n)=>fs.readFileSync(path.join(root,ep.segments[n-1].prompt),'utf8');
 if(p9.seconds!==120||p9.segments.length!==8||p10.seconds!==135||p10.segments.length!==9)errors.push('09/10预算改变');
 for(const s of ['10—13秒','13—15秒','左手握原完整硬木空鞘','右腕无白包','不能提前画10集板刮新裂','吸入微粒仍须动态补验'])if(!txt(p9,1).includes(s))errors.push('09-01阶段或图像边界缺 '+s);
 for(const s of ['A前/G中/B后','A先到出口外原实地','G沿同口自撑拖腿','B最后出拱后才','右手抓A前臂','双掌双踝无后期白包','一格'])if(!txt(p10,7).includes(s))errors.push('爬行次序/早期伤势或匣状态缺 '+s);
 for(const s of ['鼻前体撞板','A已一次收法','原低拱此时完整'])if(!txt(p10,6).includes(s))errors.push('有限远诱饵/实图触点缺 '+s);
 for(const s of ['又过两段才回','已开门的视线','不把全景贴进原只能看近梯的小窗','人物和晶匣仍门内'])if(!txt(p10,9).includes(s))errors.push('回扑毁拱/门内外机位缺 '+s);
 if(!p10.segments[6].end.includes('左膜开右导航关')||!p10.segments[8].end.includes('低拱已被兽撞碎'))errors.push('末态晶匣/拱毁连续性丢失');
 for(const ep of [p9,p10])for(const s of ep.segments){
  const sword=s.refs.find(r=>r.source.endsWith('PROP03_旧铁剑剑鞘古符V1.png')),knife=s.refs.find(r=>r.source.endsWith('PROP02_修物短刃探路绳V1.png'));
  if(!sword?.purpose.includes('古符第3集已经失去')||!sword?.purpose.includes('28才永久断')||!knife?.purpose.includes('整卷长绳/沙囊早已失去不重生'))errors.push('09/10第'+s.n+'段早期道具用途仍可误生已失物');
 }
 const a=cp.spawnSync('git',['diff','--name-only','6701068','--','人物资产'],{cwd:root,encoding:'utf8'}),b=cp.spawnSync('git',['ls-files','--others','--exclude-standard','--','人物资产'],{cwd:root,encoding:'utf8'}),mastersUntouched=a.status===0&&b.status===0&&!a.stdout.trim()&&!b.stdout.trim();if(!mastersUntouched)errors.push('正式人物服饰/异兽母图改动或不可核验');
 const result={date:'2026-10-18',scope:'原像素/实际源字节/记录/限定采用/副本与登记时序的静态检查；非真人动作或特效验收',rawOriginals:raw.length,adoptedStatic:m.entries.length,archivedCandidates:candidates.length,images,targetSegments:targets.size,copiedReferencePlacements:copies,episodes:[{id:'09',segments:8,seconds:120,referenceCopies:p9.segments.reduce((n,s)=>n+s.refs.length,0)},{id:'10',segments:9,seconds:135,referenceCopies:p10.segments.reduce((n,s)=>n+s.refs.length,0)}],formalCharacterCostumeAndCreatureMastersUntouched:mastersUntouched,errors,actualVideoGenerated:false,actualAudioGenerated:false};
 fs.writeFileSync(path.join(__dirname,'沙海追猎采用检查V1.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));if(errors.length)process.exit(1);
})().catch(e=>{console.error(e);process.exitCode=1;});
