const fs=require('fs'),path=require('path'),crypto=require('crypto');
const dir=__dirname,root=path.resolve(dir,'../..'),errors=[],warnings=[];
const common=fs.readFileSync(path.join(dir,'全剧通用提示词.md'),'utf8').match(/```text\s*([\s\S]*?)```/)[1].trim();
let previous=JSON.parse(fs.readFileSync(path.join(dir,'第01集/执行包V2/连续性与参考校核V2.json'),'utf8')).segments.at(-1).end;
let copied=0,count=0;
for(const ep of ['02','03']){
 const folder=path.join(dir,`第${ep}集/执行包V1`),ledger=JSON.parse(fs.readFileSync(path.join(folder,'连续性与参考校核V1.json'),'utf8'));
 if(ledger.segments.length!==8||ledger.seconds!==120)errors.push(ep+'段数/集长错误');
 for(const [i,d] of ledger.segments.entries()){
  const file=path.join(root,d.prompt||d.promptFile),s=fs.readFileSync(file,'utf8'),blocks=[...s.matchAll(/```text\s*([\s\S]*?)```/g)];count++;
  if(blocks.length!==1||!blocks[0][1].includes(common))errors.push(ep+'-'+d.n+'缺唯一完整母版代码块');
  for(const field of ['首帧精确状态','尾帧','固定15秒','0—15秒','简体中文字幕','人物','实际'])if(!s.includes(field))errors.push(ep+'-'+d.n+'缺字段'+field);
  if(!/配乐|音乐/.test(s))errors.push(ep+'-'+d.n+'缺音乐规格'); 
  if(d.start!==previous&&!(ep==='02'&&i===2))errors.push(ep+'-'+d.n+'首尾文本不连贯');
  if(ep==='02'&&i===2)warnings.push('02-03为断阶至塔门的明确场景切换，不要求位置文本相同');
  previous=d.end;
  for(const r of d.refs){const b=fs.readFileSync(path.join(path.dirname(file),r.file)),source=fs.readFileSync(path.join(root,r.source));const hash=x=>crypto.createHash('sha256').update(x).digest('hex');if(hash(b)!==r.sha256||hash(source)!==r.sha256)errors.push(ep+'-'+d.n+'源图/副本hash不符'+r.file);copied++;}
  let last=0;for(const l of d.lines){if(({A:'周辰',B:'苏晚'})[l[0]]!==l[1]||l[2]<last||l[3]>15||l[3]<=l[2]||!s.includes(l[4]))errors.push(ep+'-'+d.n+'对白身份/时间/正文错误');last=l[3];}
 }
}
warnings.push('专用图缺项按各段清单补齐；单手绳环、救援握点、侧向重力和口型尚未经实际视频验收');
const result={date:'2026-10-18',episodes:2,segments:count,seconds:240,copiedReferences:copied,errors,warnings,actualVideoGenerated:false};
fs.writeFileSync(path.join(dir,'第二三集执行包文件校验V1.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(errors.length)process.exit(1);
