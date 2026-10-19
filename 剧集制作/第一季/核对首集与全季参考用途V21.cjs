const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto');
const dir=__dirname,root=path.resolve(dir,'../..'),read=f=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf8')),plan=read('首集持物与参考来源修订计划V21.json'),hash=b=>crypto.createHash('sha256').update(b).digest('hex'),norm=s=>s.replace(/\r\n/g,'\n'),errors=[];
const oldFile=f=>cp.execFileSync('git',['show',plan.baselineCommit+':'+f],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
let segments=0,refs=0,sourceRows=0,overrideRows=0,knifeBoardRows=0,tokenBoardRows=0,defaultKnifeRisks=0,unrestrictedTokenRisks=0;const speech=[];
const stripRefs=s=>norm(s).replace(/【本段同目录真实参考图及优先级】[\s\S]*?(?=本提示词不要求模型自动读取磁盘)/,'【参考用途单独核验】\n');
for(let n=1;n<=32;n++){const ep=String(n).padStart(2,'0'),v=n===1?'V2':'V1',lp='剧集制作/第一季/第'+ep+'集/执行包'+v+'/连续性与参考校核'+v+'.json',now=JSON.parse(fs.readFileSync(path.join(root,lp),'utf8')),old=JSON.parse(oldFile(lp)),reverse=JSON.parse(JSON.stringify(now));
 for(const s of now.segments){segments++;refs+=s.refs.length;const key=ep+'-'+String(s.n).padStart(2,'0'),p=s.prompt||s.promptFile,body=fs.readFileSync(path.join(root,p),'utf8'),was=old.segments.find(x=>x.n===s.n);
  if(n===1){const rr=reverse.segments.find(x=>x.n===s.n);rr.refs=was.refs;let restored=stripRefs(body);if(s.n===2){for(const k of ['axis','sound']){const a=plan.dataChange.after[k],b=plan.dataChange.before[k];if(!restored.includes(a))errors.push('新动作块缺 '+k);restored=restored.replace(a,b);}restored=restored.replace(plan.dataChange.after.t.join('\n'),plan.dataChange.before.t.join('\n'));}
   if(restored!==stripRefs(oldFile(p)))errors.push('首集指定动作/用途外文本变化 '+key);
  }
  for(const r of s.refs){const marker=r.file+'：',lines=body.split('\n').filter(line=>line.includes(marker)&&/^[ \t]*(?:\d+[.)、]\s*|[-*]\s*)?$/.test(line.slice(0,line.indexOf(marker))));if(lines.length!==1){errors.push('用途行缺/重复 '+key+' '+r.file);continue;}const purpose=lines[0].slice(lines[0].indexOf(marker)+marker.length).trim();
   if(n===1){sourceRows++;const previous=was.refs.find(x=>x.file===r.file&&x.id===r.id);if(!previous||previous.sha256.toLowerCase()!==r.sha256.toLowerCase()||!r.source||!r.purpose||path.basename(r.source)!==r.file)errors.push('首集来源字段/旧图身份改变 '+key);
    else{for(const k of ['originalSource','previousSource'])if(previous[k]!==undefined&&previous[k]!==r[k])errors.push('场景来源链改变 '+key+' '+k);const src=fs.readFileSync(path.join(root,r.source)),copy=fs.readFileSync(path.join(path.dirname(path.join(root,p)),r.file));if(hash(src)!==r.sha256.toLowerCase()||hash(copy)!==r.sha256.toLowerCase())errors.push('来源/副本SHA不符 '+key);}
    if(purpose.replace(/。$/,'')!==r.purpose.replace(/。$/,''))errors.push('首集用途台账不一致 '+key+' '+r.file);
    const o=plan.referencePurposeOverrides.find(o=>o.n===s.n&&o.id===r.id);if(o){overrideRows++;if(r.source!==o.source||r.purpose!==o.purpose)errors.push('逐段用途覆盖失效 '+key+' '+r.id);}
   }
   // 用文件名与ID覆盖首集旧台账，不再以source字段存在为扫描前提。
   if(r.file==='PROP02_修物短刃探路绳V1.png'||r.id==='PROP02'){knifeBoardRows++;if(purpose.includes('角色右手握刀柄'))defaultKnifeRisks++;}
   if(r.file==='PROP03_旧铁剑剑鞘古符V1.png'||r.id==='PROP03'){tokenBoardRows++;if(((n===3&&s.n>=4)||n>=4)&&purpose.replace(/。$/,'')==='锁旧铁剑与完整鞘、暗铜古符和隔布；覆盖旧角色图附带装饰剑')unrestrictedTokenRisks++;}
  }
  for(const l of s.lines||[]){const chars=(l[4].match(/[\p{L}\p{N}]/gu)||[]).length;speech.push({segment:key,speaker:l[1],text:l[4],start:l[2],end:l[3],characters:chars,estimatedCharactersPerSecond:+(chars/(l[3]-l[2])).toFixed(3)});}
 }
 if(JSON.stringify(reverse)!==JSON.stringify(old))errors.push('首集参考元数据以外台账变化 '+ep);
}
const dataFile='剧集制作/第一季/第一集15秒执行数据V2.json',data=JSON.parse(fs.readFileSync(path.join(root,dataFile),'utf8')),restoredData=JSON.parse(JSON.stringify(data)),s=restoredData.find(s=>s.n===2);
for(const k of ['axis','t','sound']){if(JSON.stringify(s[k])!==JSON.stringify(plan.dataChange.after[k]))errors.push('源数据未同步 '+k);s[k]=plan.dataChange.before[k];}
if(JSON.stringify(restoredData)!==JSON.stringify(JSON.parse(oldFile(dataFile))))errors.push('源数据其他剧情字段变化');
const imageChanges=cp.execFileSync('git',['-c','core.safecrlf=false','-c','core.quotepath=false','diff','--name-only',plan.baselineCommit],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(f=>/\.(png|jpe?g|webp)$/i.test(f));if(imageChanges.length)errors.push('不应改图');
if(segments!==313||refs!==4290||sourceRows!==53||overrideRows!==10||defaultKnifeRisks||unrestrictedTokenRisks)errors.push('范围/数量/泛用风险残留');
const result={date:'2026-10-19',baselineCommit:plan.baselineCommit,checkedSegments:segments,referenceCopies:refs,firstEpisodeSourcePurposeRows:sourceRows,firstEpisodeExplicitPurposeOverrides:overrideRows,knifeBoardRowsCheckedWithoutSourceDependency:knifeBoardRows,tokenBoardRowsCheckedWithoutSourceDependency:tokenBoardRows,defaultKnifePoseRowsRemaining:defaultKnifeRisks,unrestrictedLostTokenRowsRemaining:unrestrictedTokenRisks,firstLastDialogueTimingAndOtherLedgerFieldsUnchanged:errors.length===0,imageFilesChanged:imageChanges.length,speechLines:speech.length,speechLinesAbove6EstimatedCharactersPerSecond:speech.filter(x=>x.estimatedCharactersPerSecond>6).length,maxEstimatedCharactersPerSecond:Math.max(...speech.map(x=>x.estimatedCharactersPerSecond)),actualVideoGenerated:false,actualAudioGenerated:false,limitations:'文字与文件核验；字符/秒仅用于筛查，不证明真实录音自然、口型准确或15秒动态成功。source缺失已纳入检查，但未声称所有潜在连续性错误归零。',errors};
fs.writeFileSync(path.join(dir,'首集持物与全季来源兼容复核V21.json'),JSON.stringify(result,null,2)+'\n');
fs.writeFileSync(path.join(dir,'全季对白时码筛查V21.json'),JSON.stringify({date:'2026-10-19',scope:'对既有413条对白仅做文字时窗测算，未改台词或录音',actualAudioGenerated:false,lines:speech},null,2)+'\n');
console.log(JSON.stringify(result));if(errors.length)process.exitCode=1;

