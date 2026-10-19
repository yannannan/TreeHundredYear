const fs=require('fs'),path=require('path'),crypto=require('crypto'),dir=__dirname,root=path.resolve(dir,'../..');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const common=fs.readFileSync(path.join(dir,'全剧通用提示词.md'),'utf8').match(/```text\s*([\s\S]*?)```/)[1].trim();
const errors=[],warnings=[],episodes=[];let last=null,previousScene=null,previousEpisode=null;
const readme=fs.readFileSync(path.join(root,'README.md'),'utf8');
const budgets=new Map([...readme.matchAll(/^\| (\d{2}) \| \[[^\r\n]+?\]\(([^\r\n]+?)\) \| ([^|\r\n]+) \| (\d+)秒 \|/gm)].map(m=>[m[1],{source:m[2],seconds:+m[4]}]));
if(budgets.size!==32)errors.push('README必须有32集预算');
for(const [id,b] of budgets){const source=fs.readFileSync(path.join(root,b.source),'utf8'),seconds=source.match(/成片预算(\d+)秒/);if(!seconds||+seconds[1]!==b.seconds)errors.push(id+'源剧本与README预算不一致');if(b.seconds>180||b.seconds%15!==0)errors.push(id+'计划集长不合法');}
const plannedSeconds=[...budgets.values()].reduce((n,b)=>n+b.seconds,0);
const outline=fs.readFileSync(path.join(root,'完整剧本/第一季/第一季32集完整剧本总纲（编剧完成版V3）.md'),'utf8');
if(+outline.match(/合计(\d+)秒/)?.[1]!==plannedSeconds)errors.push('总纲总时长与README不同');
for(let n=1;n<=32;n++){
 const id=String(n).padStart(2,'0'),version=n===1?'V2':'V1',folder=path.join(dir,`第${id}集/执行包${version}`),ledgerPath=path.join(folder,`连续性与参考校核${version}.json`);if(!fs.existsSync(ledgerPath))continue;
 const ledger=JSON.parse(fs.readFileSync(ledgerPath,'utf8'));let copied=0;
 if(ledger.seconds!==ledger.segments.length*15||ledger.seconds>180)errors.push(id+'集长不合法');
 if(ledger.seconds!==budgets.get(id)?.seconds)errors.push(id+'执行包与源剧本/排程预算不同');
 for(const [i,d] of ledger.segments.entries()){
  const p=path.join(root,d.prompt||d.promptFile),s=fs.readFileSync(p,'utf8'),blocks=[...s.matchAll(/```text\s*([\s\S]*?)```/g)];
  if(blocks.length!==1||!blocks[0][1].includes(common))errors.push(id+'-'+d.n+'单一完整母版失败');
  if(/\bundefined\b|\bNaN\b|\[object Object\]/.test(blocks[0]?.[1]||''))errors.push(id+'-'+d.n+'存在未展开字段');
  const changedScene=d.sceneId&&previousScene&&n===previousEpisode&&d.sceneId!==previousScene;
  if(d.start!==last&&last!==null&&!d.sceneCut&&!changedScene)errors.push(id+'-'+d.n+'首尾文本不连续');last=d.end;previousScene=d.sceneId||null;previousEpisode=n;
  let end=0;const timeline=blocks[0]?.[1].match(/【0—15秒[^】]*】\s*([\s\S]*?)\n\n【/);if(!timeline)errors.push(id+'-'+d.n+'无独立时间轴');else {const steps=[...timeline[1].matchAll(/^(\d+)—(\d+)秒/gm)];for(const t of steps){if(+t[1]!==end||+t[2]<=end)errors.push(id+'-'+d.n+'时间轴断档');end=+t[2];}if(end!==15)errors.push(id+'-'+d.n+'时间轴未到15秒');}
  let speechEnd=0;for(const l of d.lines||[]){const names={A:'周辰',B:'苏晚',C:'摊主',D:'老人',...(ledger.voiceNames||{})};if(names[l[0]]!==l[1]||l[2]<speechEnd||l[3]>15||l[3]<=l[2]||!s.includes(l[4]))errors.push(id+'-'+d.n+'台词身份/时码/正文失败');speechEnd=l[3];}
  for(const r of d.refs){const b=fs.readFileSync(path.join(path.dirname(p),r.file));if(hash(b)!==r.sha256.toLowerCase())errors.push(id+'-'+d.n+'副本hash失败');if(r.source&&hash(fs.readFileSync(path.join(root,r.source)))!==r.sha256.toLowerCase())errors.push(id+'-'+d.n+'源图hash失败');copied++;}
 }
 episodes.push({episode:id,segments:ledger.segments.length,seconds:ledger.seconds,referenceCopies:copied});
}
warnings.push('各段专用接触/状态/光态图缺项仍按清单补齐，复制件不算新生成原图；没有实际H3音视频及动态验收。');
const result={date:'2026-10-18',plannedSeconds,targetSegments:plannedSeconds/15,episodes,completedTextSegments:episodes.reduce((n,x)=>n+x.segments,0),referenceCopies:episodes.reduce((n,x)=>n+x.referenceCopies,0),errors,warnings,actualVideoGenerated:false};fs.writeFileSync(path.join(dir,'全季已制执行包检查结果V1.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(errors.length)process.exit(1);
