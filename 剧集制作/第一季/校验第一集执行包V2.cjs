const fs=require('fs'),path=require('path'),crypto=require('crypto');const dir=__dirname,root=path.resolve(dir,'../..'),ep=path.join(dir,'第01集/执行包V2');
const data=JSON.parse(fs.readFileSync(path.join(dir,'第一集15秒执行数据V2.json'),'utf8'));
const ledger=JSON.parse(fs.readFileSync(path.join(ep,'连续性与参考校核V2.json'),'utf8'));
const common=fs.readFileSync(path.join(dir,'全剧通用提示词.md'),'utf8').match(/```text\s*([\s\S]*?)```/)[1].trim();
let errors=[],warnings=[];
for(const d of data){const x=ledger.segments.find(x=>x.n===d.n);if(!x){errors.push('缺段'+d.n);continue;}const file=path.join(root,x.promptFile),s=fs.readFileSync(file,'utf8'),blocks=[...s.matchAll(/```text\s*([\s\S]*?)```/g)];if(blocks.length!==1)errors.push(d.n+'不是单一完整代码块');if(!blocks[0]?.[1].includes(common))errors.push(d.n+'未完整含通用正文');
for(const key of ['生成什么视频剧情','首帧精确状态','尾帧精确状态','对白：人物','字幕：同一段','固定15秒','A周辰、B苏晚、C摊主、D老人'])if(!s.includes(key))errors.push(d.n+'缺'+key);
let end=0;for(const line of d.t){const m=line.match(/^(\d+)—(\d+)秒/);if(!m||+m[1]!==end||+m[2]<=end){errors.push(d.n+'时间轴不连续');break;}end=+m[2];}if(end!==15)errors.push(d.n+'时间轴未到15秒');
let speechEnd=0;for(const l of d.lines){if(l[2]<speechEnd||l[3]>15||l[2]>=l[3])errors.push(d.n+'台词时间不合法');speechEnd=l[3];const expected={周辰:'A',苏晚:'B',摊主:'C',老人:'D'}[l[1]];if(l[0]!==expected)errors.push(d.n+'台词身份错绑');const cps=l[4].replace(/[，。？！、\s]/g,'').length/(l[3]-l[2]);if(cps>6)warnings.push(d.n+'对白需录音检查语速 '+cps.toFixed(2)+'字/秒');}
for(const r of x.refs){const p=path.join(path.dirname(file),r.file);if(!fs.existsSync(p))errors.push(d.n+'缺参考'+r.file);else if(crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')!==r.sha256.toLowerCase())errors.push(d.n+'参考副本hash变更'+r.file);}
const next=data.find(n=>n.n===d.n+1);if(next&&d.sceneId===next.sceneId&&d.end!==next.start)errors.push(d.n+'→'+next.n+'同场首尾文本不相等');
}
if(data.length!==10||ledger.seconds!==150)errors.push('段数或集长不符合10x15');
const result={date:'2026-10-17',segments:data.length,totalSeconds:150,referenceCopies:ledger.segments.reduce((n,x)=>n+x.refs.length,0),errors,warnings,scope:'校验文件/字段/时码/固定ID/同场首尾/真实参考hash；不能替代H3动作/口型/音画/连续性试片',actualVideoGenerated:false};fs.writeFileSync(path.join(ep,'执行包检查结果V2.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(errors.length)process.exit(1);
