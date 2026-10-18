const fs=require('fs'),path=require('path'),crypto=require('crypto');
const dir=__dirname,root=path.resolve(dir,'../..'),read=n=>JSON.parse(fs.readFileSync(path.join(dir,n),'utf8')),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const plan=read('第二集双人开门静态采用V16.json'),ledgerPath=path.join(dir,'第02集/执行包V1/连续性与参考校核V1.json'),ledger=JSON.parse(fs.readFileSync(ledgerPath,'utf8')),writes=[],placements=[];
const missing={
  "6": "已补收剑中段局部、A归剑独退/B留位、A回线/B独退和双人仍门外全开4静态目标；收剑全程单手可达与四秒节奏、精确半步/同机位进退、物件位置控制、门光及门叶连续响应和对白口型仍需动态试片。静态遮挡不证明完整双脚受力或全轨角度，不能称测试已演成。",
  "7": "已补第06尾/07首的外侧全开状态参考，非门内反打或已跨门图。门内迎拍与门外左右方位/过门路线需专门校核，不靠镜像换边拼接；苏晚先行/周辰随后、收符藏布结和门后未闭尾态专用图与动态仍待补。"
};
function purposeLine(body,file,purpose){const marker=file+'：',lines=body.split('\n'),ii=lines.map((l,i)=>l.includes(marker)&&/^[ \t]*(?:\d+[.)、]\s*|[-*]\s*)?$/.test(l.slice(0,l.indexOf(marker)))?i:-1).filter(i=>i>=0);if(ii.length!==1)throw Error('用途行不唯一 '+file);lines[ii[0]]=marker+purpose;return lines.join('\n');}
for(const e of plan.entries){if(e.status!=='adopted-static'||!e.qa.startsWith('采用')||hash(fs.readFileSync(path.join(root,e.path)))!==e.sha256)throw Error('采用源图未核 '+e.id);}
for(const s of ledger.segments){const key='02-'+String(s.n).padStart(2,'0'),entries=plan.entries.filter(e=>e.targets.includes(key));if(!entries.length)continue;const prompt=path.join(root,s.prompt||s.promptFile),folder=path.dirname(prompt);let body=fs.readFileSync(prompt,'utf8');
for(const e of entries){const file=path.basename(e.path),dest=path.resolve(folder,file);if(path.dirname(dest)!==folder)throw Error('目录越界');let r=s.refs.find(r=>r.source===e.path);if(r){if(r.sha256!==e.sha256||!fs.existsSync(dest)||hash(fs.readFileSync(dest))!==e.sha256)throw Error('既有副本变更');r.purpose=e.purpose;body=purposeLine(body,file,e.purpose);}else{if(fs.existsSync(dest)&&hash(fs.readFileSync(dest))!==e.sha256)throw Error('副本同名冲突');const anchor='人物图优先锁身份衣着，道具图锁形状';if(!body.includes(anchor))throw Error('参考插入点缺');body=body.replace(anchor,file+'：'+e.purpose+'\n'+anchor);s.refs.push({file,source:e.path,sha256:e.sha256,purpose:e.purpose});writes.push({src:path.join(root,e.path),dest});}placements.push({segment:key,id:e.id,source:e.path,file});}
const marker='【V16参考阶段与声画执行锁】',lock="【V16参考阶段与声画执行锁】\n第06段按顺序采用：首态仍右手持剑且背鞘空；收剑局部图只看画面左侧原鞘口的连续刃/入口接触，不当全程或仅入2厘米的测量。先归剑再A独退；A回线之后B独退，再自行回线；其间尽量保持两件小物原中间位置及一掌未触，只改变人到门的前后位置，不把物距变化当生命信号已获证明。右半窄缝测试图不覆盖第05末窄开四分之三首态。两人最后共同前进，外轨物理两半随门叶滑开、内刻饰暗，不在空中补一整圈。全开外侧图只作第06末和第07状态交接，两人尚未跨门、物仍各自手中；第07门内机位/苏晚先过门/收纳与末尾合门另做，不镜像角色或道具手别冒充连续镜头。门光、足步与机关声必须随真实动作同步，实际音视频尚未生成。\n\n";
if(body.includes(marker)){const re=/【V16参考阶段与声画执行锁】[\s\S]*?(?=【尚缺参考与制作边界】)/;if(!re.test(body))throw Error('执行锁位置错');body=body.replace(re,lock);}else body=body.replace('【尚缺参考与制作边界】',lock+'【尚缺参考与制作边界】');
const re=/(【尚缺参考与制作边界】\s*)[\s\S]*?(?=\n当前)/;if(!re.test(body))throw Error('缺项段缺');body=body.replace(re,'$1'+missing[s.n]);s.missing=missing[s.n];body=body.replace('制作状态：执行文本与已有基础参考；缺图见代码块，未生成视频。','制作状态：执行文本与基础/专用静态参考；实际动作、声画与其余缺项见代码块，未生成视频。');writes.push({file:prompt,body});
}
if(plan.entries.length!==4||placements.length!==5||new Set(placements.map(p=>p.segment)).size!==2)throw Error('必须4图2段5引用');
for(const w of writes){if(w.src)fs.copyFileSync(w.src,w.dest);else fs.writeFileSync(w.file,w.body);}fs.writeFileSync(ledgerPath,JSON.stringify(ledger,null,2)+'\n');
const out={date:'2026-10-19',newStaticOriginals:4,copiedPlacements:placements.length,updatedSegments:[...new Set(placements.map(p=>p.segment))],formalCharacterCostumeMastersEdited:0,actualVideoGenerated:false,actualAudioGenerated:false,placements};
fs.writeFileSync(path.join(dir,'第二集双人开门采用检查V16.json'),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({...out,placements:undefined}));

