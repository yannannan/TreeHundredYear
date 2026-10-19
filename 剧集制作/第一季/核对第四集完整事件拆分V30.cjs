const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto');
const dir=__dirname,root=path.resolve(dir,'../..'),read=f=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));
const plan=read('第四集完整事件拆分修订V30.json'),baseline=plan.baselineCommit,errors=[];
const assert=(ok,message)=>{if(!ok)errors.push(message);};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const gitJson=file=>JSON.parse(cp.execFileSync('git',['show',baseline+':'+file],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024}));
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const data=require('./第四集执行数据V1.cjs'),current=read('第04集/执行包V1/连续性与参考校核V1.json'),old=plan.previousLedger;
assert(data.segments.length===9&&current.segments.length===9&&current.seconds===135,'第四集须为9段135秒');
const before=gitJson('剧集制作/第一季/第04集/执行包V1/连续性与参考校核V1.json');
assert(same(before,old),'拆分前归档与真实Git基线不符');
assert(same(current.segments.flatMap(s=>s.lines),old.segments.flatMap(s=>s.lines)),'第四集原对白、说话者或段内时码被改');
assert(current.segments[0].start===old.segments[0].start,'第三集进入第四集的首态变化');
assert(current.segments.at(-1).end===old.segments.at(-1).end,'第四集末态变化');
const next=read('第05集/执行包V1/连续性与参考校核V1.json');
assert(next.segments[0].start===current.segments.at(-1).end,'第五集未承接第四集末态');
let unchangedEpisodes=0,total=0,totalSeconds=0,referenceCopies=0,modes={A:0,B:0,C:0};
for(let n=1;n<=32;n++){
 const id=String(n).padStart(2,'0'),v=n===1?'V2':'V1',rel=`第${id}集/执行包${v}/连续性与参考校核${v}.json`,j=read(rel);
 if(n!==4){assert(same(j,gitJson('剧集制作/第一季/'+rel)),id+'其他集账本不应发生语义改动');unchangedEpisodes++;}
 total+=j.segments.length;totalSeconds+=j.seconds;
 for(const s of j.segments){referenceCopies+=s.refs.length;const lines=s.lines||[],spoken=lines.filter(l=>l[6]!=='inner');modes[!lines.length?'A':spoken.length?'B':'C']++;}
}
assert(total===314&&totalSeconds===4710&&referenceCopies===4315,'全季段数/时长/引用数不符');
assert(modes.A===56&&modes.B===258&&modes.C===0,'互斥声音模式计数不符');
const currentPrompts=current.segments.map(s=>path.dirname(path.join(root,s.prompt)));
const folders=fs.readdirSync(path.join(dir,'第04集/执行包V1'),{withFileTypes:true}).filter(e=>e.isDirectory()&&/^第\d+段_/.test(e.name)).map(e=>path.join(dir,'第04集/执行包V1',e.name));
assert(same([...folders].sort(),[...currentPrompts].sort()),'第四集存在旧段目录或漏掉当前段目录');
const oldFor=n=>old.segments[(n<5?n:n===5||n===6?5:n-1)-1];
for(const s of current.segments){
 const n=s.n,d=data.segments[n-1],body=fs.readFileSync(path.join(root,s.prompt),'utf8');
 assert(n>=1&&n<=9&&s.seconds===15,'第四集单段时长/编号不符');
 assert(body.includes(`集内${(n-1)*15}—${n*15}秒`),n+'段集内时码不符');
 assert(body.includes(d.story)&&d.t.every(t=>body.includes(t)),n+'段事件/动作与执行源不同');
 assert(s.start===(n===1?old.segments[0].start:current.segments[n-2].end),n+'段首尾连接错误');
 assert(same(s.refs.map(r=>[r.source,r.sha256]),oldFor(n).refs.map(r=>[r.source,r.sha256])),n+'段引用应沿用原图与像素');
 for(const r of s.refs)assert(sha(path.join(path.dirname(path.join(root,s.prompt)),r.file))===r.sha256,n+'段副本字节改变');
 if(n===5||n===6){
  assert(!s.lines.length&&body.includes('声音模式：A｜无对白、无旁白'),n+'段必须无人物人声');
  const sound=body.match(/【环境\/动作声\/配乐及入点】\s*([^\r\n]+)/)?.[1];
  assert(sound===d.sound,n+'段音效取了旧段号事件，必须取当前源数据');
 }
}
assert(data.segments[2].t[0].includes('挂')&&data.segments[2].t[1].includes('拔原短刃'),'挂石锤应先于拔刀');
assert(data.segments[2].t.at(-1).startsWith('10—15秒')&&data.segments[2].t.at(-2).startsWith('8—10秒'),'第二枚试石方向须在10.2秒对白前显现');
assert(data.segments[8].t.some(t=>t.includes('6.2、7.2、8.2秒'))&&data.segments[8].sound.includes('8.2秒第三响'),'第三响放绳时点缺失');
const props=read('全季混合道具引用修订计划V20.json'),entries=props.entries.filter(e=>e.episode==='04');
assert(props.rows===90&&props.segments===48&&entries.length===18,'道具用途计划未随新增段扩展');
for(const s of current.segments){const key='04-'+String(s.n).padStart(2,'0');assert(entries.filter(e=>e.segment===key&&e.prompt===s.prompt).length===2,key+'两条混合道具用途未正确重编号');}
const maps=read('精工克制场景采用映射V2.json');
assert(maps.filter(m=>m.expectedTargets?.includes('04-09')).length===2,'两幅通用场景缺第09段范围');
const changed=cp.execFileSync('git',['diff','--name-only','-z',baseline,'--','剧集制作/第一季'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
assert(!changed.some(p=>p.endsWith('/视频提示词.md')&&!p.includes('/第04集/')),'其他集当前提示词不应改变');
const audio=read('全季普通话声音模式清单V28.json');assert(audio.segments===total&&same(audio.modes,modes),'全季音频清单不同步');
const result={date:'2026-10-19',baselineCommit:baseline,episodes:32,segments:total,seconds:totalSeconds,referenceCopies,modes,unchangedEpisodeLedgers:unchangedEpisodes,episode04:{segments:9,seconds:135,referenceCopies:81,dialogueAndLocalTimecodesPreserved:true,entryAndExitStatesPreserved:true},newImageOriginals:0,actualVideoGenerated:false,actualAudioGenerated:false,dynamicsValidated:false,errors};
fs.writeFileSync(path.join(dir,'第四集完整事件拆分核对V30.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));if(errors.length)process.exitCode=1;
