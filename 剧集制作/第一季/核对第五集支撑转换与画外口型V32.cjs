const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto');
const dir=__dirname,root=path.resolve(dir,'../..'),read=f=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf8')),plan=read('第五集完整事件与支撑转换修订V32.json'),baseline=plan.baselineCommit;
const errors=[],same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),assert=(ok,note)=>{if(!ok)errors.push(note);};
const gitJson=f=>JSON.parse(cp.execFileSync('git',['show',baseline+':'+f],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024}));
const ep=require('./第五集执行数据V1.cjs'),current=read('第05集/执行包V1/连续性与参考校核V1.json'),old=plan.previousLedger,voiceRe=/【H3声音模式与逐句普通话执行V28】[\s\S]*?(?=\n\n【)/;
assert(same(old,gitJson('剧集制作/第一季/第05集/执行包V1/连续性与参考校核V1.json')),'第五集拆分前档案与真实基线不符');
assert(current.segments.length===12&&current.seconds===180,'第五集须12段180秒');
assert(current.segments[0].start===old.segments[0].start&&current.segments.at(-1).end===old.segments.at(-1).end,'第五集跨集首尾改变');
assert(read('第06集/执行包V1/连续性与参考校核V1.json').segments[0].start===current.segments.at(-1).end,'第六集未承接第五集末态');
const added=[...plan.dialogueAddedFromExistingSource,...plan.dialogueAddedForExplicitAction],expectedLines=[];
for(const s of old.segments)for(const line of s.lines){const l=[...line],change=plan.dialogueTimeChanges.find(x=>x.originalSegment==='05-'+String(s.n).padStart(2,'0')&&x.speaker===l[0]&&x.text===l[4]);if(change){assert(l[2]===change.before[0]&&l[3]===change.before[1],'对白改时记录原值不符');[l[2],l[3]]=change.after;}expectedLines.push(l);}
const existing=current.segments.flatMap(s=>s.lines).filter(l=>!added.some(a=>a.speaker===l[0]&&a.text===l[4]));assert(same(existing,expectedLines),'原对白原文/顺序或未登记时码改变');
for(const a of added){const s=current.segments[+a.currentSegment.slice(3)-1];assert(s.lines.some(l=>l[0]===a.speaker&&l[4]===a.text&&l[2]===a.time[0]&&l[3]===a.time[1]),'补回/新增明确台词缺 '+a.text);}
const expectedOld=[1,1,2,3,3,4,4,4,5,6,7,8];
for(const [i,s] of current.segments.entries()){
 const d=ep.segments[i],file=path.join(root,s.prompt),body=fs.readFileSync(file,'utf8');
 assert(s.n===i+1&&s.seconds===15&&body.includes(`集内${i*15}—${(i+1)*15}秒`),s.n+'段时长或集内时码错误');
 assert(body.includes(d.story)&&d.t.every(t=>body.includes(t)),s.n+'段事件/动作不同步执行源');
 if(i!==10)assert(s.start===(i?current.segments[i-1].end:old.segments[0].start),s.n+'段首尾不连');else assert(Boolean(s.sceneCut),'浮城门必须明确切场');
 assert(same(s.refs.map(r=>[r.source,r.sha256]),old.segments[expectedOld[i]-1].refs.map(r=>[r.source,r.sha256])),s.n+'段应沿用对应原图');
 const files=fs.readdirSync(path.dirname(file)).filter(x=>x.endsWith('.png')).sort();assert(same(files,s.refs.map(r=>r.file).sort()),s.n+'段残留无关参考或缺图');
 for(const r of s.refs)assert(crypto.createHash('sha256').update(fs.readFileSync(path.join(path.dirname(file),r.file))).digest('hex')===r.sha256,s.n+'段参考副本字节变化');
}
const folders=fs.readdirSync(path.join(dir,'第05集/执行包V1'),{withFileTypes:true}).filter(e=>e.isDirectory()&&/^第\d+段_/.test(e.name)).map(e=>e.name).sort();assert(same(folders,current.segments.map(s=>path.basename(path.dirname(s.prompt))).sort()),'第五集仍有旧执行段目录');
assert(ep.segments[3].t.at(-1).includes('确认新约束已接住后')&&ep.segments[4].t[1].includes('不沿绳自动滑到锚点'),'先接约束/实际抓移规则缺失');
assert(ep.segments[6].t[1].includes('确认两人均已脱离绳载后')&&ep.segments[7].t[0].includes('放在真锚侧原石座'),'取短绳/放石锤前提缺失');
const migration=read('第五集参考范围迁移V32.json').entries[0],original=read(migration.sourcePlan).entries.find(e=>e.id===migration.id);
assert(same(original.targets,migration.previousTargets)&&original.purpose===migration.previousPurpose,'历史真锚采用计划被重写');
assert(current.segments[2].refs.some(r=>r.source===migration.path)&&!current.segments[1].refs.some(r=>r.source===migration.path),'真锚已绕图不得提前到未绕绳段');
let unchanged=0;for(let n=1;n<=32;n++){if(n===5)continue;const id=String(n).padStart(2,'0'),v=n===1?'V2':'V1',rel=`第${id}集/执行包${v}/连续性与参考校核${v}.json`,before=gitJson('剧集制作/第一季/'+rel);if(['07','13'].includes(id))for(const segment of before.segments)for(const r of segment.refs){if(r.purpose)r.purpose=r.purpose.replace(plan.crossEpisodePurposeChange.oldPhrase,plan.crossEpisodePurposeChange.newPhrase);const addition=plan.rebuildSourceHistoryAdditions.find(a=>a.segment===id+'-'+String(segment.n).padStart(2,'0')&&a.file===r.file&&a.source===r.source);if(addition){const maps=read('精工克制场景采用映射V2.json'),legacy=read('全场景提质采用映射V1.json'),m=maps.find(m=>m.path===r.source),prior=legacy.find(l=>l.path===m?.origin);assert(!r.originalSource&&!r.previousSource&&addition.originalSource===(prior?.origin||m?.origin)&&addition.previousSource===(m?.previousAdoptedPath||m?.origin)&&fs.existsSync(path.join(root,addition.originalSource))&&fs.existsSync(path.join(root,addition.previousSource)),'新增来源追溯未核实');r.originalSource=addition.originalSource;r.previousSource=addition.previousSource;}}assert(same(before,read(rel)),id+'集账本超出已核道具用途/原图来源追溯范围');if(!['07','13'].includes(id))unchanged++;}
const audio=read('画外对白口型执行修订V32.json');let checkedVoiceLines=0;assert(audio.entries.length===14&&audio.lines===20,'画外口型范围须14段20句');
for(const e of audio.entries){const body=fs.readFileSync(path.join(root,e.prompt),'utf8'),block=body.match(voiceRe)?.[0];for(const l of e.affectedLines){const line=block?.split('\n').find(x=>x.includes('时码：'+l[2]+'—'+l[3]+'秒')&&x.includes('准确原文：「'+l[4]+'」'));assert(line?.includes('画面内人物不为此句动嘴')&&!line.includes('按该句动嘴'),e.key+'画外句仍要求现场口型');checkedVoiceLines++;}}
const changed=cp.execFileSync('git',['diff','--name-only','-z',baseline,'--','**/视频提示词.md'],{cwd:root,encoding:'utf8',stdio:['pipe','pipe','ignore']}).split('\0').filter(Boolean);
for(const file of changed){if(file.includes('/第05集/'))continue;const prior=cp.execFileSync('git',['show',baseline+':'+file],{cwd:root,encoding:'utf8',maxBuffer:2*1024*1024});const now=fs.readFileSync(path.join(root,file),'utf8').replaceAll(plan.crossEpisodePurposeChange.newPhrase,plan.crossEpisodePurposeChange.oldPhrase);assert(now.replace(voiceRe,'【VOICE】').replaceAll('\r\n','\n')===prior.replace(voiceRe,'【VOICE】').replaceAll('\r\n','\n'),'其他集提示词超出画外口型/道具用途 '+file);}
const stats=require('./当前执行包统计V31.cjs')(),modes=read('全季普通话声音模式清单V28.json');assert(stats.segments===319&&stats.seconds===4785&&stats.referenceCopies===4358,'全季统计不符319/4785/4358');assert(same(modes.modes,{A:61,B:258,C:0}),'互斥声音模式计数不符');
const result={date:'2026-10-19',baselineCommit:baseline,episodes:32,segments:stats.segments,seconds:stats.seconds,referenceCopies:stats.referenceCopies,episode05:stats.episodes['05'],unchangedOtherEpisodeLedgers:unchanged,metadataOnlyEpisodeLedgers:['07','13'],purposeRows:18,sourceHistoryReferencesAdded:plan.rebuildSourceHistoryAdditions.length,dialogueTimeChanges:plan.dialogueTimeChanges.length,dialogueOriginalsRestored:1,explicitFeedbackReportAdded:1,offscreenSegments:14,offscreenLinesChecked:checkedVoiceLines,modes:modes.modes,newImageOriginals:0,actualVideoGenerated:false,actualAudioGenerated:false,dynamicsValidated:false,errors};fs.writeFileSync(path.join(dir,'第五集支撑转换与画外口型核对V32.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));if(errors.length)process.exitCode=1;
