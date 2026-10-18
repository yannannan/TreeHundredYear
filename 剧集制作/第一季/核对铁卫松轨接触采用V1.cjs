const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process'),sharp=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const dir=__dirname,root=path.resolve(dir,'../..'),read=p=>JSON.parse(fs.readFileSync(path.join(dir,p),'utf8')),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const m=read('铁卫松轨接触静态采用V1.json'),raw=read(m.sourceCatalog),jobs=read(m.sourceJobs),errors=[],accepted=new Set(m.entries.map(r=>r.path)),candidates=raw.filter(r=>!accepted.has(r.path));
 if(raw.length!==4||m.entries.length!==2||candidates.length!==2||candidates.some(r=>!r.purpose.startsWith('候选')))errors.push('4原图/2有限采用/2候选登记错');
 for(const r of raw){const j=jobs.find(j=>j.key===r.id),b=fs.readFileSync(path.join(root,r.path)),meta=await sharp(b).metadata(),note=fs.readFileSync(path.join(root,r.path.replace(/\.png$/,'_生成记录.md')),'utf8');if(!j||hash(b)!==r.sha256||hash(fs.readFileSync(j.source))!==r.sha256||r.width!==meta.width||r.height!==meta.height||r.upscaled||!note.includes(j.prompt)||!note.includes(j.qa))errors.push('源字节/尺寸/记录缺 '+r.id);}
 let copies=0;const targets=new Set();let target;
 for(let n=1;n<=32;n++){const id=String(n).padStart(2,'0'),v=n===1?'V2':'V1',l=read(`第${id}集/执行包${v}/连续性与参考校核${v}.json`);for(const s of l.segments){const key=id+'-'+String(s.n).padStart(2,'0'),p=path.join(root,s.prompt||s.promptFile),body=fs.readFileSync(p,'utf8');
  for(const r of candidates)if(s.refs.some(x=>x.source===r.path)||body.includes(path.basename(r.path))||fs.existsSync(path.join(path.dirname(p),path.basename(r.path))))errors.push('候选误入 '+key);
  for(const r of m.entries)if(!r.targets.includes(key)&&fs.existsSync(path.join(path.dirname(p),path.basename(r.path))))errors.push('未登记误放副本 '+key+' '+r.id);
  for(const r of m.entries){const found=s.refs.filter(x=>x.source===r.path);if(found.length!==Number(r.targets.includes(key)))errors.push('采用范围或重复错 '+key+' '+r.id);if(found.length){copies++;targets.add(key);target={s,body};if(hash(fs.readFileSync(path.join(path.dirname(p),found[0].file)))!==r.sha256||found[0].sha256!==r.sha256||!body.includes(r.purpose))errors.push('副本/用途错 '+key);}}
 }}
 if(copies!==2||targets.size!==1||!targets.has('14-05'))errors.push('必须限定14-05两副本');
 if(!target?.s.end.includes('未被杀')||!target.s.end.includes('不堵安全边肋')||!target.s.end.includes('短刃已从落轨取回')||!target.s.end.includes('记忆缺失/细抖/右背手烫痕持续'))errors.push('退路/取回刀/记忆伤势或铁卫存活尾帧丢失');
 for(const phrase of ['不是切断健全粗链','白掌包18集以后才有','不提前28集断剑','刀不支撑整轨','硬木剑鞘第13集毁弃','古符第3集已失'])if(!target?.body.includes(phrase))errors.push('道具/阶段用途缺 '+phrase);
 const old=cp.spawnSync('git',['show','eb1adbe:剧集制作/第一季/第14集/执行包V1/连续性与参考校核V1.json'],{cwd:root,encoding:'utf8'}),now=read('第14集/执行包V1/连续性与参考校核V1.json');
 if(old.status!==0)errors.push('缺采用前登记');else {const before=JSON.parse(old.stdout);if(before.seconds!==now.seconds||before.segments.length!==now.segments.length||before.segments.some((s,i)=>s.start!==now.segments[i].start||s.end!==now.segments[i].end))errors.push('原段数/预算/首尾被改');}
 const diff=cp.spawnSync('git',['diff','--name-only','eb1adbe','--','人物资产'],{cwd:root,encoding:'utf8'}),untracked=cp.spawnSync('git',['ls-files','--others','--exclude-standard','--','人物资产'],{cwd:root,encoding:'utf8'}),untouched=diff.status===0&&untracked.status===0&&!diff.stdout.trim()&&!untracked.stdout.trim();if(!untouched)errors.push('正式人物服饰母图改动');
 const result={date:'2026-10-18',scope:'源字节/像素/完整记录、候选排除、限定段落/用途、原首尾与人物母图静态检查；人工另视检材质和接触，不宣称程序识手/真实力学',rawOriginals:raw.length,adoptedStatic:m.entries.length,archivedCandidates:candidates.length,targetSegments:targets.size,copiedReferencePlacements:copies,formalCharacterCostumeMastersUntouched:untouched,actualVideoGenerated:false,actualAudioGenerated:false,errors};
 fs.writeFileSync(path.join(dir,'铁卫松轨接触采用检查V1.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
