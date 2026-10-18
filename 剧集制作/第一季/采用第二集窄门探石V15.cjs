const fs=require('fs'),path=require('path'),crypto=require('crypto');
const dir=__dirname,root=path.resolve(dir,'../..'),read=n=>JSON.parse(fs.readFileSync(path.join(dir,n),'utf8')),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const plan=read('第二集窄门探石静态采用V15.json'),ledgerPath=path.join(dir,'第02集/执行包V1/连续性与参考校核V1.json'),ledger=JSON.parse(fs.readFileSync(ledgerPath,'utf8')),writes=[],placements=[];
const missing={
5:'已补第4秒窄开/唯一外轨四分之三持物、右手旧剑尖近石起始接触、单石已落门内及空鞘收手尾态4张专用静态图。仍需抽剑/挑起/抛送连续动作、左手近门后收回表演、精确光轨变化、8.000秒可见落点至11.000秒首次落石声的三秒错时与口型字幕试片；静态与剪辑规格不证明真实动态通过。',
6:'已补05尾/06首：右手抽剑、左符/B右布结、左手收回、石已落门内、空鞘。收剑/逐人退回测试、双人同时进步后唯一外轨完整亮及门可并行的专用图和连续表演仍待补；空景全开图只锁几何。'};
function purposeLine(body,file,purpose){const marker=file+'：',lines=body.split('\n'),ii=lines.map((l,i)=>l.includes(marker)&&/^[ \t]*(?:\d+[.)、]\s*|[-*]\s*)?$/.test(l.slice(0,l.indexOf(marker)))?i:-1).filter(i=>i>=0);if(ii.length!==1)throw Error('用途行不唯一 '+file);lines[ii[0]]=marker+purpose;return lines.join('\n');}
for(const e of plan.entries){if(e.status!=='adopted-static'||!e.qa.startsWith('采用')||hash(fs.readFileSync(path.join(root,e.path)))!==e.sha256)throw Error('采用源图未核 '+e.id);}
for(const s of ledger.segments){const key='02-'+String(s.n).padStart(2,'0'),entries=plan.entries.filter(e=>e.targets.includes(key));if(!entries.length)continue;const prompt=path.join(root,s.prompt||s.promptFile),folder=path.dirname(prompt);let body=fs.readFileSync(prompt,'utf8');
for(const e of entries){const file=path.basename(e.path),dest=path.resolve(folder,file);if(path.dirname(dest)!==folder)throw Error('目录越界');let r=s.refs.find(r=>r.source===e.path);if(r){if(r.sha256!==e.sha256||!fs.existsSync(dest)||hash(fs.readFileSync(dest))!==e.sha256)throw Error('既有副本变更');r.purpose=e.purpose;body=purposeLine(body,file,e.purpose);}else{if(fs.existsSync(dest)&&hash(fs.readFileSync(dest))!==e.sha256)throw Error('副本同名冲突');const anchor='人物图优先锁身份衣着，道具图锁形状';if(!body.includes(anchor))throw Error('参考插入点缺');body=body.replace(anchor,file+'：'+e.purpose+'\n'+anchor);s.refs.push({file,source:e.path,sha256:e.sha256,purpose:e.purpose});writes.push({src:path.join(root,e.path),dest});}placements.push({segment:key,id:e.id,source:e.path,file});}
const marker='【V15参考阶段与声画执行锁】',lock='【V15参考阶段与声画执行锁】\n新参考分阶段使用，不把已落石/已拔剑/空鞘尾态提前贴到本段首帧。第05段0—4秒仍从半亮闭门图进入窄开四分之三；4—8秒参考旧剑尖近石图只锁起始接触，必须实际演出挑起抛送；第8.000秒首次清楚见单石落在门内，第11.000秒才有首次清脆落石声。8.000—11.000秒继续山风/衣料声，不延迟整条音轨，不添加早响、预反应或“延迟三秒”字卡。第05末/06首用空鞘收手图锁右持剑/左符/B右布结，随后第06段自行收剑，不让背鞘与右手同时各有一把剑。此处为制作规格，实际音视频尚未生成。\n\n';
if(body.includes(marker)){const re=/【V15参考阶段与声画执行锁】[\s\S]*?(?=【尚缺参考与制作边界】)/;if(!re.test(body))throw Error('执行锁位置错');body=body.replace(re,lock);}else body=body.replace('【尚缺参考与制作边界】',lock+'【尚缺参考与制作边界】');
const re=/(【尚缺参考与制作边界】\s*)[\s\S]*?(?=\n当前)/;if(!re.test(body))throw Error('缺项段缺');body=body.replace(re,'$1'+missing[s.n]);s.missing=missing[s.n];body=body.replace('制作状态：执行文本与已有基础参考；缺图见代码块，未生成视频。','制作状态：执行文本与基础/专用静态参考；实际动作、声画与其余缺项见代码块，未生成视频。');writes.push({file:prompt,body});
}
if(plan.entries.length!==4||placements.length!==5||new Set(placements.map(p=>p.segment)).size!==2)throw Error('必须4图2段5引用');
for(const w of writes){if(w.src)fs.copyFileSync(w.src,w.dest);else fs.writeFileSync(w.file,w.body);}fs.writeFileSync(ledgerPath,JSON.stringify(ledger,null,2)+'\n');
const out={date:'2026-10-19',newStaticOriginals:4,copiedPlacements:placements.length,updatedSegments:[...new Set(placements.map(p=>p.segment))],formalCharacterCostumeMastersEdited:0,actualVideoGenerated:false,actualAudioGenerated:false,placements};
fs.writeFileSync(path.join(dir,'第二集窄门探石采用检查V15.json'),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({...out,placements:undefined}));

