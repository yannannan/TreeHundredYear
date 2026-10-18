const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'../..'),scope=path.resolve(__dirname,'第32集/执行包V1'),source='人物资产/苏晚/SW-D22_左踝包扎战损全身V1.png',sha='3b9d7473d349b9fcae366c991be49b6e3a683a4258504a0e5e51fbb554d564d6';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),master=path.resolve(root,source);
if(hash(fs.readFileSync(master))!==sha)throw Error('正式伤势母图发生变化，停止清理');
const ledger=JSON.parse(fs.readFileSync(path.join(scope,'连续性与参考校核V1.json'),'utf8')),records=[];
for(const s of ledger.segments.filter(s=>s.n>=5)){
 const r=s.refs.find(r=>r.source===source);if(!r)continue;
 const p=path.resolve(root,path.dirname(s.prompt),r.file);
 if(!p.startsWith(scope+path.sep)||path.basename(p)!=='SW-D22_左踝包扎战损全身V1.png'||p===master)throw Error('目标不在第32集派生目录');
 if(!fs.existsSync(p)||hash(fs.readFileSync(p))!==sha||r.sha256!==sha)throw Error('派生副本字节未核 '+p);
 records.push({segment:'32-'+String(s.n).padStart(2,'0'),path:path.relative(root,p).replaceAll('\\','/'),sha256:sha,reason:'第4年以后旧伤已逐渐正常恢复，正式无伤全身/头肩固定参考已在，移除会误导旧包永久存在的派生副本；正式母图不改'});
}
if(records.length&&records.length!==8)throw Error('应恰8个过期派生副本，未执行删除');
for(const r of records)fs.unlinkSync(path.join(root,r.path));
const file=path.join(__dirname,'后期旧伤参考副本清理记录V1.json');
if(records.length)fs.writeFileSync(file,JSON.stringify({date:'2026-10-18',scope:'只删除核过字节的8个第32集派生副本，源PNG和首年01—04副本保留',source,sha256:sha,removed:records},null,2));
console.log(JSON.stringify({removedThisRun:records.length,recordRetained:fs.existsSync(file),masterUntouched:hash(fs.readFileSync(master))===sha}));
