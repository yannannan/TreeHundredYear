const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process'),sharp=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'../..'),read=f=>JSON.parse(fs.readFileSync(path.join(__dirname,f),'utf8')),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const m=read('现代落点静态采用V1.json'),raw=m.sourceCatalogs.flatMap(read),jobs=['现代落地避车与核心半带生成归档V1.json','现代落点手位与去徽生成归档V2.json','现代同车闭窗反射生成归档V1.json'].flatMap(read),errors=[],images=[];
 if(raw.length!==6||new Set(raw.map(r=>r.path)).size!==6||m.entries.length!==4)errors.push('6原图/4采用统计不符');
 for(const r of raw){const b=fs.readFileSync(path.join(root,r.path)),meta=await sharp(b).metadata(),j=jobs.find(j=>j.key===r.id);if(hash(b)!==r.sha256||r.width!==meta.width||r.height!==meta.height||r.bytes!==b.length||r.upscaled)errors.push(r.id+'原生像素/字节错误');if(!j||hash(fs.readFileSync(j.source))!==r.sha256)errors.push(r.id+'未逐字节保留生成原图');const note=fs.readFileSync(path.join(root,r.path.replace(/\.png$/,'_生成记录.md')),'utf8');if(!j||!note.includes(j.prompt)||!note.includes(r.sha256))errors.push(r.id+'实际提示词/生成记录缺');images.push({id:r.id,width:r.width,height:r.height});}
 const accepted=new Set(m.entries.map(r=>r.path)),candidates=raw.filter(r=>!accepted.has(r.path));if(candidates.length!==2||candidates.some(r=>!r.purpose.startsWith('候选')))errors.push('两候选未留档标注');
 const ledgers=[];for(let n=1;n<=32;n++){const id=String(n).padStart(2,'0'),v=n===1?'V2':'V1';ledgers.push({id,data:read(`第${id}集/执行包${v}/连续性与参考校核${v}.json`)});}
 let copies=0;for(const {id,data}of ledgers)for(const s of data.segments){const key=id+'-'+String(s.n).padStart(2,'0'),p=s.prompt||s.promptFile;
  for(const r of candidates)if(s.refs.some(x=>x.source===r.path))errors.push(key+'误用含徽标/换手首版 '+r.id);
  for(const r of m.entries){const found=s.refs.filter(x=>x.source===r.path);if(found.length!==Number(key==='32-12'))errors.push(key+'采用范围不符 '+r.id);if(found.length){const b=fs.readFileSync(path.join(root,path.dirname(p),found[0].file));if(hash(b)!==r.sha256||found[0].sha256!==r.sha256||!fs.readFileSync(path.join(root,p),'utf8').includes(found[0].file))errors.push(key+'副本/正文缺 '+r.id);copies++;}}
 }
 if(copies!==4)errors.push('应恰4专用副本');
 const p32=ledgers.find(x=>x.id==='32').data,s=p32.segments[11],text=fs.readFileSync(path.join(root,s.prompt),'utf8'),line=s.lines[0];
 if(s.lines.length!==1||line[0]!=='B'||line[2]!==11.1||line[3]!==13.8||line[4]!=='这回，真不认识路了。')errors.push('末句身份/原文/新时码不符');
 const sub=text.match(/【简体中文字幕原文与时码】\s*([\s\S]*?)\n\n【/),intervals=[...(sub?.[1]||'').matchAll(/(\d+(?:\.\d+)?)—(\d+(?:\.\d+)?)秒/g)];
 if(intervals.length!==1||intervals.some(x=>+x[2]>14)||!text.includes('14—15秒：唯一指定黑场')||text.includes('11.2—14.2秒'))errors.push('对白字幕/黑场仍重叠或时码未同步');
 if(!text.includes('走两三小步')||!text.includes('右拳一直握原灰白窄半带')||!text.includes('左掌/一膝/另一足')||!text.includes('左掌收另一半')||!text.includes('腰下残冰未脱'))errors.push('行程/左右手/核心约束边界缺');
 const band=s.refs.find(r=>r.source.endsWith('KEY32-11_同窄布断开两人各半V3.png'));
 if(!band||!band.purpose.includes('B右手尾端在现代')||band.purpose.includes('仅核心A反切桌面的既有道具位置'))errors.push('旧双半带用途仍误限核心或混重逢');
 if(!s.end.includes('尚未重逢')||!s.refs.some(r=>r.source.includes('十三人五加八独立回执终态')))errors.push('第二季钩子或13回执核心边界丢失');
 if(p32.seconds!==180||p32.segments.length!==12)errors.push('末集预算改变');
 const a=cp.spawnSync('git',['diff','--name-only','c63fefb','--','人物资产'],{cwd:root,encoding:'utf8'}),b=cp.spawnSync('git',['ls-files','--others','--exclude-standard','--','人物资产'],{cwd:root,encoding:'utf8'}),mastersUntouched=a.status===0&&b.status===0&&!a.stdout.trim()&&!b.stdout.trim();
 if(!mastersUntouched)errors.push('正式人物服饰目录发生变化或无法核验');
 const result={date:'2026-10-18',scope:'原图/真实记录/全季采用范围/副本/片尾时码及登记手位和行程的静态检查；不是动态车制动/人体/镜面/嘴型与美术实测',rawOriginals:raw.length,adoptedStatic:m.entries.length,archivedCandidates:candidates.length,images,targetSegments:1,copiedReferencePlacements:copies,speech:{speaker:'B',start:line[2],end:line[3]},specifiedBlackCard:{start:14,end:15},formalCharacterCostumeImagesUntouched:mastersUntouched,errors,actualVideoGenerated:false,actualAudioGenerated:false};
 fs.writeFileSync(path.join(__dirname,'现代落点与片尾时序检查V1.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(errors.length)process.exit(1);
})();
