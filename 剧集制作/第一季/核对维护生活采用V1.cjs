const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process'),sharp=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'../..'),read=f=>JSON.parse(fs.readFileSync(path.join(__dirname,f),'utf8')),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const m=read('维护生活静态采用V1.json'),raw=m.sourceCatalogs.flatMap(read),jobs=['维护生活首批生成归档V1.json','维护生活同碗重做补眠生成归档V1.json','首年同碗旧伤修正生成归档V2.json'].flatMap(read),errors=[];
 if(raw.length!==9||new Set(raw.map(r=>r.path)).size!==9||m.entries.length!==8)errors.push('原图9/采用8统计错误');
 for(const r of raw){const b=fs.readFileSync(path.join(root,r.path)),meta=await sharp(b).metadata(),j=jobs.find(j=>j.key===r.id);if(hash(b)!==r.sha256||r.bytes!==b.length||r.width!==meta.width||r.height!==meta.height||r.upscaled)errors.push(r.id+'原生像素/字节/SHA错误');if(!j||hash(fs.readFileSync(j.source))!==r.sha256)errors.push(r.id+'未保留实际生成原字节');const note=fs.readFileSync(path.join(root,r.path.replace(/\.png$/,'_生成记录.md')),'utf8');if(!j||!note.includes(j.prompt)||!note.includes(r.sha256))errors.push(r.id+'实际提示词/记录丢失');}
 const chosen=new Set(m.entries.map(r=>r.path)),candidates=raw.filter(r=>!chosen.has(r.path));if(candidates.length!==1||candidates[0].id!=='LIFE-Y1-BOWL'||!candidates[0].purpose.startsWith('候选'))errors.push('漏伤候选状态错误');
 const entries=[];for(let n=1;n<=32;n++){const id=String(n).padStart(2,'0'),v=n===1?'V2':'V1';entries.push({id,ledger:read(`第${id}集/执行包${v}/连续性与参考校核${v}.json`)});}
 let placements=0;
 for(const {id,ledger}of entries)for(const s of ledger.segments){const key=id+'-'+String(s.n).padStart(2,'0'),p=s.prompt||s.promptFile;
  for(const r of candidates)if(s.refs.some(x=>x.source===r.path))errors.push(key+'误用漏伤候选');
  for(const r of m.entries){const found=s.refs.filter(x=>x.source===r.path);if(found.length!==Number(r.targets.includes(key)))errors.push(key+'采用范围错误 '+r.id);if(found.length){const b=fs.readFileSync(path.join(root,path.dirname(p),found[0].file));if(hash(b)!==r.sha256||found[0].sha256!==r.sha256||!fs.readFileSync(path.join(root,p),'utf8').includes(found[0].file))errors.push(key+'副本/正文错误 '+r.id);placements++;}}
 }
 if(placements!==9)errors.push('应9份生活专用副本');
 const p32=entries.find(e=>e.id==='32').ledger,injury='人物资产/苏晚/SW-D22_左踝包扎战损全身V1.png';
 for(const s of p32.segments){const found=s.refs.some(r=>r.source===injury);if(s.n<=4?!found:found)errors.push('32-'+s.n+'旧伤阶段参考错误');const folder=path.join(root,path.dirname(s.prompt));if(s.n>=5&&fs.existsSync(path.join(folder,path.basename(injury))))errors.push('32-'+s.n+'残留过期派生伤图');}
 const cleanup=read('后期旧伤参考副本清理记录V1.json');if(cleanup.removed.length!==8||hash(fs.readFileSync(path.join(root,injury)))!==cleanup.sha256)errors.push('清理8派生/保留母图证据不符');
 const t=n=>fs.readFileSync(path.join(root,p32.segments[n-1].prompt),'utf8');
 if(!t(3).includes('6—12秒：50mm同框保持B真实面部和嘴')||!t(3).includes('6—11.4秒，B=苏晚')||!t(3).includes('盛碗和放凉所需时间明确省略'))errors.push('首年对白/接触时间预算未落实');
 if(!t(8).includes('长句“想你，不耽误我嫌你睡得久”已在页上')||!t(8).includes('左手拭泪/右手搭膝')||!t(8).includes('旧环还在桌面浅盘'))errors.push('206年书写/299年坐地物位不清');
 if(!t(9).includes('环已在内部')||!t(9).includes('省略装配检查所需时间')||!t(9).includes('睡着同时')&& !t(9).includes('卧床同时'))errors.push('重做/补眠顺序未落实');
 if(p32.seconds!==180||p32.segments.length!==12||!p32.segments[8].end.includes('300年终日'))errors.push('集长或苏醒前边界改变');
 const tracked=cp.spawnSync('git',['diff','--name-only','0f91286','--','人物资产'],{cwd:root,encoding:'utf8'}),untracked=cp.spawnSync('git',['ls-files','--others','--exclude-standard','--','人物资产'],{cwd:root,encoding:'utf8'});
 const mastersUntouched=tracked.status===0&&untracked.status===0&&!tracked.stdout.trim()&&!untracked.stdout.trim();if(!mastersUntouched)errors.push('正式人物服饰目录相对基线发生变化或无法核验');
 const result={date:'2026-10-18',scope:'原始PNG元数据/字节/实际记录、全季采用范围与候选排除、首年/后期伤图、登记时序的静态检查；不证明艺术品质/机械压力/配音实测',rawOriginals:raw.length,adoptedStatic:m.entries.length,archivedCandidates:candidates.length,targetSegments:3,copiedReferencePlacements:placements,removedObsoleteDerivedInjuryCopies:cleanup.removed.length,formalCharacterCostumeImagesUntouched:mastersUntouched,episode32:{segments:12,seconds:180,referenceCopies:p32.segments.reduce((n,s)=>n+s.refs.length,0)},errors,actualVideoGenerated:false,actualAudioGenerated:false};
 fs.writeFileSync(path.join(__dirname,'维护生活采用检查V1.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(errors.length)process.exit(1);
})();
