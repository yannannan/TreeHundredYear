// 历史旧段号采用脚本；V31当前第二集由生成第二集执行包V1.cjs和第二集执行数据V31.cjs重建，不再调用本脚本。
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const dir=__dirname,root=path.resolve(dir,'../..'),read=n=>JSON.parse(fs.readFileSync(path.join(dir,n),'utf8')),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const plan=read('第二集同向过门静态采用V17.json'),ledgerPath=path.join(dir,'第02集/执行包V1/连续性与参考校核V1.json'),ledger=JSON.parse(fs.readFileSync(ledgerPath,'utf8')),writes=[],placements=[];
const missing={
  "7": "已补双物收纳后/苏晚先越真实门框底缘/周辰随后/双人内侧清摆尾态4静态目标；已改门外同向背侧过门避免反打换边。收纳接触过程、全程转身与跨步/物理受力、裙摆清除和门叶开始运动的时间、口型字幕及微纹理连续性仍需动态，非已完成过门视频。",
  "8": "已补本段外侧首态：两人在内侧/裙摆离门槛/门仍宽开；0—0.8秒合门后明确轴向切到门内背侧的机位规格已补。完全合门过程、内侧桥口建立、对岸新血碎符/细砂/带剑鞘敲石专用参考与动态仍待补；不把门外尾图冒称门内桥口图。"
};
function purposeLine(body,file,purpose){const marker=file+'：',lines=body.split('\n'),ii=lines.map((l,i)=>l.includes(marker)&&/^[ \t]*(?:\d+[.)、]\s*|[-*]\s*)?$/.test(l.slice(0,l.indexOf(marker)))?i:-1).filter(i=>i>=0);if(ii.length!==1)throw Error('用途行不唯一 '+file);lines[ii[0]]=marker+purpose;return lines.join('\n');}
for(const e of plan.entries){if(e.status!=='adopted-static'||!e.qa.startsWith('采用')||hash(fs.readFileSync(path.join(root,e.path)))!==e.sha256)throw Error('采用源图未核 '+e.id);}
for(const s of ledger.segments){const key='02-'+String(s.n).padStart(2,'0'),entries=plan.entries.filter(e=>e.targets.includes(key));if(!entries.length)continue;const prompt=path.join(root,s.prompt||s.promptFile),folder=path.dirname(prompt);let body=fs.readFileSync(prompt,'utf8');
for(const e of entries){const file=path.basename(e.path),dest=path.resolve(folder,file);if(path.dirname(dest)!==folder)throw Error('目录越界');let r=s.refs.find(r=>r.source===e.path);if(r){if(r.sha256!==e.sha256||!fs.existsSync(dest)||hash(fs.readFileSync(dest))!==e.sha256)throw Error('既有副本变更');r.purpose=e.purpose;body=purposeLine(body,file,e.purpose);}else{if(fs.existsSync(dest)&&hash(fs.readFileSync(dest))!==e.sha256)throw Error('副本同名冲突');const anchor='人物图优先锁身份衣着，道具图锁形状';if(!body.includes(anchor))throw Error('参考插入点缺');body=body.replace(anchor,file+'：'+e.purpose+'\n'+anchor);s.refs.push({file,source:e.path,sha256:e.sha256,purpose:e.purpose});writes.push({src:path.join(root,e.path),dest});}placements.push({segment:key,id:e.id,source:e.path,file});}
const marker='【V17参考阶段与声画执行锁】',lock="【V17参考阶段与声画执行锁】\n第07先完成A古符归原腰带层内/B布结入内襟，再转身向门内；不复制候选新布袋。摄影机始终留门外朝内拍，A左路B右路，各自略向中线让入通行线但不交叉，苏晚先跨、周辰随后；不切门内迎拍或镜像人物/手别。按原门框底缘而非前景地砖横缝判断内外，B先图只左足在内/A仍外，A随后图右靴入内/B双足已内；单石始终留内。二人和全部裙摆越槛并站稳后门才开始收，尾图B另一足被裙遮，门仍宽开，不从静态声称门已运动5%或净空通过。第08的0—0.8秒沿用外侧初态看合门，0.8秒明确切位到门内/人物背后，仍朝塔内而不反拍，门在画外后方，不演摄影机穿门。此为导演和静态目标规格，实际连续转身/跨门/合门与配音字幕动态尚未完成。\n\n";
if(body.includes(marker)){const re=/【V17参考阶段与声画执行锁】[\s\S]*?(?=【尚缺参考与制作边界】)/;if(!re.test(body))throw Error('执行锁位置错');body=body.replace(re,lock);}else body=body.replace('【尚缺参考与制作边界】',lock+'【尚缺参考与制作边界】');
if(s.n===7)body=body.replace('第07门内机位/苏晚先过门/收纳与末尾合门另做，不镜像角色或道具手别冒充连续镜头。','V17第07已改门外同向背侧跨门，新增收纳/先后跨槛/清摆尾态按时间轴使用；不镜像角色或道具手别冒充连续镜头，实际动作仍待试片。');
const re=/(【尚缺参考与制作边界】\s*)[\s\S]*?(?=\n当前)/;if(!re.test(body))throw Error('缺项段缺');body=body.replace(re,'$1'+missing[s.n]);s.missing=missing[s.n];body=body.replace('制作状态：执行文本与已有基础参考；缺图见代码块，未生成视频。','制作状态：执行文本与基础/专用静态参考；实际动作、声画与其余缺项见代码块，未生成视频。');writes.push({file:prompt,body});
}
if(plan.entries.length!==4||placements.length!==5||new Set(placements.map(p=>p.segment)).size!==2)throw Error('必须4图2段5引用');
for(const w of writes){if(w.src)fs.copyFileSync(w.src,w.dest);else fs.writeFileSync(w.file,w.body);}fs.writeFileSync(ledgerPath,JSON.stringify(ledger,null,2)+'\n');
const out={date:'2026-10-19',newStaticOriginals:4,copiedPlacements:placements.length,updatedSegments:[...new Set(placements.map(p=>p.segment))],formalCharacterCostumeMastersEdited:0,actualVideoGenerated:false,actualAudioGenerated:false,placements};
fs.writeFileSync(path.join(dir,'第二集同向过门采用检查V17.json'),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({...out,placements:undefined}));


require('./应用第二集过门镜头V17.cjs');
