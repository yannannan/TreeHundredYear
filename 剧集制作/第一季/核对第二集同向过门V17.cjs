const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process'),sharp=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'../..'),read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,p),'utf8')),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{const plan=read('第二集同向过门静态采用V17.json'),raw=read(plan.sourceCatalog),jobs=read(plan.sourceJobs),rejected=read('第二集同向过门候选原图清单V17.json'),rejectedJobs=read('第二集同向过门候选生成归档V17.json'),errors=[];
if(plan.entries.length!==4||raw.length!==4||rejected.length!==4)errors.push('本批应4采用/4候选');
for(const r of [...raw,...rejected]){const j=[...jobs,...rejectedJobs].find(j=>j.key===r.id),b=fs.readFileSync(path.join(root,r.path)),m=await sharp(b).metadata(),note=fs.readFileSync(path.join(root,r.path.replace(/\.png$/,'_生成记录.md')),'utf8');if(!j||hash(b)!==r.sha256||hash(fs.readFileSync(j.source))!==r.sha256||m.width!==r.width||m.height!==r.height||r.upscaled||!note.includes(j.prompt)||!note.includes(j.qa))errors.push('原字节/真实像素/提示词记录错误 '+r.id);}
let checkedSegments=0,copies=0;const targets=[];
for(let n=1;n<=32;n++){const id=String(n).padStart(2,'0'),v=n===1?'V2':'V1',p='剧集制作/第一季/第'+id+'集/执行包'+v+'/连续性与参考校核'+v+'.json',baseline=cp.spawnSync('git',['show','3fa0888:'+p],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});if(baseline.status!==0)throw Error(baseline.stderr);const old=JSON.parse(baseline.stdout),now=JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
for(const s of now.segments){const key=id+'-'+String(s.n).padStart(2,'0'),file=path.join(root,s.prompt||s.promptFile),body=fs.readFileSync(file,'utf8');checkedSegments++;
for(const r of rejected)if(s.refs.some(x=>x.source===r.path)||body.includes(path.basename(r.path))||fs.existsSync(path.join(path.dirname(file),path.basename(r.path))))errors.push('候选进入执行包 '+key);
for(const e of plan.entries){const rr=s.refs.filter(r=>r.source===e.path);if(rr.length!==Number(e.targets.includes(key)))errors.push('限定采用范围错误 '+e.id+' '+key);if(rr.length){const r=rr[0],b=fs.readFileSync(path.join(path.dirname(file),r.file)),marker=r.file+'：',lines=body.split('\n').filter(line=>line.includes(marker)&&/^[ \t]*(?:\d+[.)、]\s*|[-*]\s*)?$/.test(line.slice(0,line.indexOf(marker))));if(r.sha256!==e.sha256||hash(b)!==e.sha256||lines.length!==1||!lines[0].includes(e.purpose))errors.push('副本/精确用途行错误 '+key+' '+e.id);copies++;targets.push(key);}}
if(id==='02'&&s.n===2&&!body.includes('右手拔刀立即归右腰刀套，空右掌扶稳原上沿'))errors.push('刀归套顺序未补清');
if(id==='02'&&[7,8].includes(s.n)&&(!body.includes('【V17参考阶段与声画执行锁】')||!body.includes('苏晚先跨、周辰随后')||!body.includes('0.8秒明确切位到门内')))errors.push('V17阶段/轴向切位未写入');
if(id==='02'&&s.n===7&&(!body.includes('摄影机始终留在门外')||body.includes('镜头从门内侧迎看两人')))errors.push('07仍反拍');
if(id==='02'&&s.n===8&&!body.includes('0.8秒明确切至门内'))errors.push('08未明确同向切位');
}
for(const s of old.segments){delete s.refs;delete s.missing;}for(const s of now.segments){delete s.refs;delete s.missing;}if(JSON.stringify(old)!==JSON.stringify(now))errors.push('除参考/缺项外登记字段发生变化 '+id);
}
if(copies!==5||new Set(targets).size!==2)errors.push('应2段5引用');
const generator=fs.readFileSync(path.join(__dirname,'生成第二集执行包V1.cjs'),'utf8');if(!generator.includes("require('./采用第二集同向过门V17.cjs')"))errors.push('重建缺少接入钩子');
const axis=read('第二集过门同向机位计划V17.json');if(!axis.units.includes('非实测')||axis.cameras.some(c=>JSON.stringify(c.forward)!=='[0,1]')||axis.poses.some(p=>p.A[0]>=p.B[0])||axis.poses[1].A[1]>=0||axis.poses[1].B[1]<=0||axis.poses.at(-1).A[1]<=0||axis.poses.at(-1).B[1]<=0)errors.push('归一化同向计划/先后路线错');
const out={date:'2026-10-19',baseline:'3fa0888',checkedSegments,rawAdopted:raw.length,archivedCandidates:rejected.length,actualGeneratedOutputs:raw.length+rejected.length,staticCopiedPlacements:copies,targetSegments:[...new Set(targets)].sort(),dialogueFirstLastTimeAndOtherFieldsExceptReferencesAndPendingUnchanged:errors.length===0,actualVideoGenerated:false,actualAudioGenerated:false,errors};fs.writeFileSync(path.join(__dirname,'第二集同向过门复核V17.json'),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out));if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});

