const fs=require('fs'),path=require('path'),crypto=require('crypto'),sharp=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'../..'),read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,p),'utf8')),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const m=read('八缓独立回程静态采用V1.json'),raw=m.sourceCatalogs.flatMap(read),allUnique=new Set(raw.map(r=>r.path)),errors=[];
 if(raw.length!==20||allUnique.size!==20||m.entries.length!==11)errors.push('原图/采用统计不符');
 const jobs=['八缓独立回程生成归档V1.json','八缓独立回程生成归档V2.json','八缓肩带与末舱暂停生成归档V1.json','八缓分配轴检修生成归档V1.json'].flatMap(read);
 for(const r of raw){const b=fs.readFileSync(path.join(root,r.path)),meta=await sharp(b).metadata(),j=jobs.find(j=>j.key===r.id);if(hash(b)!==r.sha256||meta.width!==r.width||meta.height!==r.height||b.length!==r.bytes||r.upscaled)errors.push(r.id+'原图元数据/哈希错误');if(!j||hash(fs.readFileSync(j.source))!==r.sha256)errors.push(r.id+'未逐字节保留生成原图');const note=fs.readFileSync(path.join(root,r.path.replace(/\.png$/,'_生成记录.md')),'utf8');if(!note.includes(j?.prompt||'缺实际提示词')||!note.includes(r.sha256))errors.push(r.id+'丢实际提示词/来源记录');}
 const selected=new Set(m.entries.map(r=>r.path)),rejected=raw.filter(r=>!selected.has(r.path));
 if(rejected.length!==9||rejected.some(r=>!r.purpose.startsWith('候选')))errors.push('候选状态未完整保留');
 const ledgers=[];for(let n=1;n<=32;n++){const id=String(n).padStart(2,'0'),v=n===1?'V2':'V1',file=path.join(__dirname,`第${id}集/执行包${v}/连续性与参考校核${v}.json`);ledgers.push({id,data:JSON.parse(fs.readFileSync(file,'utf8'))});}
 let placements=0;const destinations=[];
 for(const {id,data}of ledgers)for(const s of data.segments){const key=id+'-'+String(s.n).padStart(2,'0'),prompt=fs.readFileSync(path.join(root,s.prompt||s.promptFile),'utf8');
  for(const r of rejected)if(s.refs.some(x=>x.source===r.path))errors.push(key+'误用候选 '+r.id);
  for(const r of m.entries){const found=s.refs.filter(x=>x.source===r.path);if(found.length!==Number(r.targets.includes(key)))errors.push(key+'采用范围错误 '+r.id);if(found.length){const b=fs.readFileSync(path.join(root,path.dirname(s.prompt),found[0].file));if(hash(b)!==r.sha256||found[0].sha256!==r.sha256||!prompt.includes(found[0].file))errors.push(key+'未完整就近复制 '+r.id);placements++;destinations.push({segment:key,id:r.id});}}
 }
 if(placements!==11)errors.push('专用图应11份就近副本');
 const p32=ledgers.find(x=>x.id==='32').data;
 const text=n=>fs.readFileSync(path.join(root,p32.segments[n-1].prompt),'utf8');
 for(const[n,count]of [[5,'9/13'],[6,'12/13'],[7,'13人全部真实返']])if(!p32.segments[n-1].end.includes(count))errors.push('32-'+n+'人数尾态错误');
 if(!text(5).includes('前序路程明确省略')||!text(5).includes('完整拍最后一步'))errors.push('三空间/最后跨槛省略未明确');
 if(!text(6).includes('双脚均在舱内底板')||!text(6).includes('开舱指令分配支路'))errors.push('末舱安全或检修位置不清');
 if(!text(7).includes('第37年是下一适宜相位窗口')||!text(7).includes('离线无载自检'))errors.push('窗口/检修顺序未明确');
 if(p32.seconds!==180||p32.segments.length!==12||p32.segments[6].lines[0][2]!==8.4)errors.push('集长/十三人对白时序变动');
 const bridge=require('./解析当前场景参考V1.cjs')({path:'场景资产/第一季/九层星渊塔/SC-L08_众生悬桥_独立建立镜头V4_古旧提质R1.png'});
 const resolve=require('./解析当前场景参考V1.cjs'),contextPaths=[path.basename(bridge.path),...['SC-L08_中转屋独立储备内景方向修订V2.png','SC-L08_中转屋主门回程原点接点V1.png'].map(name=>path.basename(resolve({path:'场景资产/第一季/九层星渊塔/'+name}).path))];let contextCopies=0;for(const n of[5,6,7])for(const name of contextPaths){if(!p32.segments[n-1].refs.some(r=>r.file===name))errors.push(n+'缺空间来源 '+name);else contextCopies++;}
 const result={date:'2026-10-18',scope:'实际PNG原字节/尺寸/SHA/生成记录、全季排除候选与限定段副本、登记物理顺序静态检查；不证明表演或机械工程实测',rawOriginals:raw.length,adoptedStatic:m.entries.length,archivedCandidates:rejected.length,targetSegments:3,specificCopies:placements,contextCopies,placements:destinations,errors,actualVideoGenerated:false,actualAudioGenerated:false,formalCharacterCostumeImagesEdited:false};
 fs.writeFileSync(path.join(__dirname,'八缓独立回程采用检查V1.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(errors.length)process.exit(1);
})();
