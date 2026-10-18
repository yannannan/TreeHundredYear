const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process'),sharp=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const dir=__dirname,root=path.resolve(dir,'../..'),read=p=>JSON.parse(fs.readFileSync(path.join(dir,p),'utf8')),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const maps=read('精工克制场景采用映射V2.json'),batches=[['精工克制场景修订原图清单V2.json','精工克制场景修订生成归档V2.json'],['沙海精工连续场景修订原图清单V3.json','沙海精工连续场景修订生成归档V3.json'],['塔体与各层主景精工修订原图清单V4.json','塔体与各层主景精工修订生成归档V4.json']],jobs=batches.flatMap(b=>read(b[1])),raw=batches.flatMap(b=>read(b[0])),errors=[],inventory=new Map(),placements=[];
 if(raw.length!==20||maps.length!==20||jobs.length!==20)errors.push('当前批次链必须2+8+10原图、20项采用');
 const specificRanges={'SAND-BREACH-REFINED-R2':['09-01'],'SAND-BLOCK-REFINED-R2':['09-01'],'SAND-SHOULDER-REFINED-R2':['09-01'],'SAND-LURE-REFINED-R2':['10-06'],'SAND-CRAWL-REFINED-R2':['10-07'],'SAND-COLLAPSE-REFINED-R2':['10-09']};
 const mother=fs.readFileSync(path.join(dir,'全剧通用提示词.md'),'utf8'),common=mother.match(/```text\s*([\s\S]*?)```/)[1].trim();
 for(const r of raw){const j=jobs.find(j=>j.key===r.id),bytes=fs.readFileSync(path.join(root,r.path)),meta=await sharp(bytes).metadata();if(!j||hash(bytes)!==r.sha256||hash(fs.readFileSync(j.source))!==r.sha256||meta.width!==r.width||meta.height!==r.height||r.upscaled)errors.push('原字节/真实像素不符 '+r.id);const note=fs.readFileSync(path.join(root,r.path.replace(/\.png$/,'_生成记录.md')),'utf8');if(!note.includes(j.prompt)||!note.includes(j.qa)||!note.includes(r.sha256))errors.push('生成记录不全 '+r.id);}
 for(let n=1;n<=32;n++){const id=String(n).padStart(2,'0'),v=n===1?'V2':'V1',ledger=read(`第${id}集/执行包${v}/连续性与参考校核${v}.json`);
  for(const s of ledger.segments){const key=id+'-'+String(s.n).padStart(2,'0'),file=path.join(root,s.prompt||s.promptFile),body=fs.readFileSync(file,'utf8');if(!body.includes(common))errors.push('母版缺 '+key);
   for(const r of s.refs){const source=r.source||r.path;if(!source?.startsWith('场景资产/'))continue;
    if(!inventory.has(source))inventory.set(source,{source,status:maps.some(m=>m.path===source)?'已完成精工克制R2环境静态视检':'待按新标准逐图美术视检/必要修订',targets:[]});inventory.get(source).targets.push(key);
    for(const m of maps){if(source===m.origin)errors.push('仍在用已替换旧图 '+key);if(source!==m.path)continue;const b=fs.readFileSync(path.join(path.dirname(file),r.file));if(hash(b)!==m.sha256||r.sha256!==m.sha256||!body.includes(r.file)||!body.includes(r.purpose))errors.push('新版副本/用途缺 '+key);placements.push({target:key,source,file:r.file});
     if(m.id==='KEY10-05-REFINED-R2'&&!['10-05','10-06','10-07'].includes(key))errors.push('低拱错误提前/毁后采用 '+key);
     if(m.id==='SC-L03-REFINED-R2'&&!((n===8&&s.n===8)||[9,10,11].includes(n)))errors.push('沙海远景采用范围错误 '+key);
     const wideRanges={'TOWER-REFINED-R2':[1,2,3],'L01-WIDE-REFINED-R2':[2,3,4,5,6],'L02-WIDE-REFINED-R2':[5,6,7,8],'L04-WIDE-REFINED-R2':[11,12,13,14],'L05-WIDE-REFINED-R2':[13,14,15,16,17,18],'L06-WIDE-REFINED-R2':[17,18,19,20,21,22],'L07-WIDE-REFINED-R5':[21,22,23,24,25],'L08-WIDE-REFINED-R2':[24,25,26,27],'L09-WIDE-REFINED-R2':[27,28,29],'L10-WIDE-REFINED-R2':[29,30,31,32]};
     const returnBridge=m.id==='L08-WIDE-REFINED-R2'&&n===32&&[5,6,7].includes(s.n)&&r.purpose.includes('空舱保持空')&&r.purpose.includes('不按初始总图补回');
     if(wideRanges[m.id]&&!wideRanges[m.id].includes(n)&&!returnBridge)errors.push('主景跨层错用 '+m.id+' '+key);
     if(specificRanges[m.id]&&!specificRanges[m.id].includes(key))errors.push('事件/段落错用 '+m.id+' '+key);
     if(m.id==='SC-L03-RIB-REFINED-R2'&&!((n===8&&s.n===8)||[9,10].includes(n)))errors.push('取材近端跨层错用 '+key);
     if(m.id==='SC-L03-REFUGE-REFINED-R2'&&!((n===10&&s.n>=8)||(n===11&&s.n<=6)))errors.push('避难舱跨层错用 '+key);
    }
   }
  }
 }
 const legacy=read('全场景提质采用映射V1.json'),resolve=require('./解析当前场景参考V1.cjs');
 for(const m of maps){const observed=placements.filter(p=>p.source===m.path).map(p=>p.target).sort();if(JSON.stringify(observed)!==JSON.stringify([...m.expectedTargets].sort()))errors.push('修订图限定范围/副本计数错误 '+m.id);if(hash(fs.readFileSync(path.join(root,m.origin)))!==m.originalSha256)errors.push('历史原图被改 '+m.id);const original=legacy.find(l=>l.path===m.origin)?.origin||m.origin,through=resolve({path:original,purpose:'仅环境与布局'});if(through.path!==m.path||through.sha256!==m.sha256)errors.push('后续生成器未解析当前图 '+m.id);}
 const a=cp.spawnSync('git',['diff','--name-only','6701068','--','人物资产'],{cwd:root,encoding:'utf8'}),b=cp.spawnSync('git',['ls-files','--others','--exclude-standard','--','人物资产'],{cwd:root,encoding:'utf8'}),charactersUnchanged=a.status===0&&b.status===0&&!a.stdout.trim()&&!b.stdout.trim();if(!charactersUnchanged)errors.push('正式人物服饰母图改动');
 const sceneFolder=path.join(root,'场景资产/第一季/九层星渊塔');let establishing=0;for(const name of fs.readdirSync(sceneFolder)){if(!name.endsWith('场景与15秒建立提示词V2.md'))continue;establishing++;if(!fs.readFileSync(path.join(sceneFolder,name),'utf8').includes(common))errors.push('环境建立文本母版缺 '+name);}if(establishing!==10)errors.push('必须有10域完整环境建立文本');
 const items=[...inventory.values()].sort((a,b)=>a.source.localeCompare(b.source,'zh-CN')),pending=items.filter(i=>!maps.some(m=>m.path===i.source));
 const result={date:'2026-10-18',commonVersion:'V1.9',textSegments:313,establishingDomains:establishing,newSceneOriginals:raw.length,newReferencePlacements:placements.length,currentSceneOriginals:items.length,pendingArtReviewOrRevision:pending.length,formalCharacterCostumeMastersUnchanged:charactersUnchanged,allSceneImagesRevised:false,actualVideoGenerated:false,errors,inventory:items};
 fs.writeFileSync(path.join(dir,'精工克制场景复核与待办V2.json'),JSON.stringify(result,null,2)+'\n');
 const rows=items.map(i=>`| [${path.basename(i.source)}](../../${i.source}) | ${i.status} | ${i.targets.join('、')} |`).join('\n');
 fs.writeFileSync(path.join(dir,'精工克制全场景修订清单V2.md'),`# 全场景精工克制修订｜实际清单V2\n\n2026-10-18。此文件为制作清单，唯一交接仍为文档/项目总控与交接.md。\n\n32集313段的当前引用中有${items.length}张不同场景/状态源图，累计${raw.length}张已生成视检、接入${placements.length}份就近引用（沙海首批2图+连续修订8图+塔体及其余各层主景10图）；另${pending.length}张待按新标准逐图美术视检/必要修订。待办数量不代表全部要重画，不把文件存在或哈希核对算作美术已验；也不把同源副本计作独立新图。\n\n最新标准：主体完整、精工材质、低饱和，仅保留剧情必要局部损坏；不模仿《逃离世界》，正式人物服饰不改。旧图的空间和动作仍可参考，但其全面锈破不得复制进新成片。\n\n塔体与第一至九层/隐藏十层共11张主景已完成本次材质修订，沙海另9张在用近端/状态合计累计20图；原动作边界不变，缺少的额外机位和真实动态不因此清零。下一批为各域功能近景→战斗和终章状态图，同时按缺项补真正缺少的接触机位。逐张检查完整面、接缝、路面、破损范围与实际行动拓扑，不用统一滤镜覆盖剧情损坏。实际视频/声音/动态仍未制作。\n\n| 当前场景源图 | 实际状态 | 引用段 |\n|---|---|---|\n${rows}\n`);
 console.log(JSON.stringify({...result,inventory:undefined}));if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
