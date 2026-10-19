const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto');
const dir=__dirname,root=path.resolve(dir,'../..'),read=f=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));
const plan=read('第二集救援与再生事件拆分V31.json'),baseline=plan.baselineCommit,errors=[],same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),assert=(ok,note)=>{if(!ok)errors.push(note);};
const gitJson=f=>JSON.parse(cp.execFileSync('git',['show',baseline+':'+f],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024}));
const ep=require('./第二集执行数据V31.cjs'),old=plan.previousLedger,current=read('第02集/执行包V1/连续性与参考校核V1.json'),migration=read('第二集参考范围迁移V31.json');
assert(same(old,gitJson('剧集制作/第一季/第02集/执行包V1/连续性与参考校核V1.json')),'拆分前账本不符真实Git基线');
assert(current.segments.length===9&&current.seconds===135,'当前第二集须9段135秒');
assert(same(current.segments.flatMap(s=>s.lines),old.segments.flatMap(s=>s.lines)),'原对白、人物或段内时码变动');
assert(current.segments[0].start===old.segments[0].start&&current.segments.at(-1).end===old.segments.at(-1).end,'跨集首尾变化');
assert(!current.segments[1].lines.length&&current.segments[1].name==='先回到石阶上','新02应独立完成无对白攀回');
assert(current.segments[2].end===old.segments[1].end,'新03未恢复原再生对白末态');
const dirs=fs.readdirSync(path.join(dir,'第02集/执行包V1'),{withFileTypes:true}).filter(e=>e.isDirectory()&&/^第\d+段_/.test(e.name)).map(e=>e.name).sort();
assert(same(dirs,current.segments.map(s=>path.basename(path.dirname(s.prompt))).sort()),'残留旧段目录/漏当前段目录');
for(const [i,s]of current.segments.entries()){
 const d=ep.segments[i],file=path.join(root,s.prompt),body=fs.readFileSync(file,'utf8');
 assert(s.n===i+1&&s.seconds===15&&body.includes(`集内${i*15}—${(i+1)*15}秒`),s.n+'段时长或集内时码错误');
 assert(d.t.every(t=>body.includes(t))&&body.includes(d.story),s.n+'段不同步当前执行源');
 if(i!==3)assert(s.start===(i===0?old.segments[0].start:current.segments[i-1].end),s.n+'段首尾断开');
 else assert(Boolean(s.sceneCut),'新04断阶至门前须明确切场');
 for(const r of s.refs){const bytes=fs.readFileSync(path.join(path.dirname(file),r.file));assert(crypto.createHash('sha256').update(bytes).digest('hex')===r.sha256,s.n+'段参考副本改变');}
 const actual=fs.readdirSync(path.dirname(file)).filter(f=>f.endsWith('.png')).sort();assert(same(actual,s.refs.map(r=>r.file).sort()),s.n+'段存在无关图片或缺图');
}
assert(ep.segments[1].t[1].includes('插回右腰原刀套')&&ep.segments[1].t[1].includes('右手离开刀柄后才用空掌')&&ep.segments[1].t[2].includes('左膝'),'攀回须先归刀/空掌再膝上平台');
assert(ep.segments[5].t[1].includes('8.000秒首次')&&ep.segments[5].t[2].includes('11.000秒首次'),'三秒声画错时未对齐');
for(const e of migration.entries){const original=read(e.sourcePlan).entries.find(x=>x.id===e.id);assert(original&&same(original.targets,e.previousTargets)&&original.purpose===e.previousPurpose,'历史采用记录被重写 '+e.id);const actual=[];for(const id of ['02','03'])for(const s of read('第'+id+'集/执行包V1/连续性与参考校核V1.json').segments)if(s.refs.some(r=>r.source===e.path))actual.push(id+'-'+String(s.n).padStart(2,'0'));assert(same(actual.sort(),[...e.currentTargets].sort()),'当前图阶段范围错误 '+e.id);}
const expectedThird=gitJson('剧集制作/第一季/第03集/执行包V1/连续性与参考校核V1.json'),third=read('第03集/执行包V1/连续性与参考校核V1.json'),tail=migration.entries.find(e=>e.id==='EP02-BRIDGE-TAIL-PLANNED-V1');
expectedThird.segments[0].refs.find(r=>r.source===tail.path).purpose=tail.currentPurpose;
assert(same(third,expectedThird),'第三集只允许首帧参考用途由旧02-08标成当前02-09');
assert(third.segments[0].start===current.segments.at(-1).end,'第三集未承接第二集末态');
let unchanged=0;for(let n=1;n<=32;n++){if([2,3].includes(n))continue;const id=String(n).padStart(2,'0'),v=n===1?'V2':'V1',rel=`第${id}集/执行包${v}/连续性与参考校核${v}.json`;assert(same(read(rel),gitJson('剧集制作/第一季/'+rel)),id+'其他集账本不应变动');unchanged++;}
const stats=require('./当前执行包统计V31.cjs')(),audio=read('全季普通话声音模式清单V28.json');assert(stats.segments===315&&stats.seconds===4725&&stats.referenceCopies===4322,'全季统计不同步');assert(audio.segments===315&&same(audio.modes,{A:57,B:258,C:0}),'全季声音模式不同步');
const props=read('全季混合道具引用修订计划V20.json');assert(props.rows===91&&props.segments===49,'当前道具用途计划不同步');
const result={date:'2026-10-19',baselineCommit:baseline,episodes:32,segments:stats.segments,seconds:stats.seconds,referenceCopies:stats.referenceCopies,modes:audio.modes,episode02:stats.episodes['02'],unchangedOtherEpisodeLedgers:unchanged,episode03Change:'仅首帧参考用途标签02-08→02-09，剧情对白/时码/首尾保持',currentMigrationEntries:migration.entries.length,historicalAdoptionPlansPreserved:true,newImageOriginals:0,actualVideoGenerated:false,actualAudioGenerated:false,dynamicsValidated:false,errors};
fs.writeFileSync(path.join(dir,'第二集救援事件与范围核对V31.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));if(errors.length)process.exitCode=1;
