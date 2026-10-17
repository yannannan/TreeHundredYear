const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'../..');const rd=p=>fs.readFileSync(path.join(root,p),'utf8'),wr=(p,s)=>fs.writeFileSync(path.join(root,p),s);
let r=rd('README.md');r=r.replace(/^(\| 17 \|[^\r\n]+\| )120秒 \|/m,'$1150秒 |').replace('129/288段（第01—15集）','147/290段（第01—17集）').replaceAll('全季72分钟','全季72分30秒');
const mark='- [逐集制作排程]';if(!r.includes('第十六集执行清单'))r=r.replace(mark,'- [第十六集执行清单](剧集制作/第一季/第16集/执行包V1/第十六集执行清单V1.md)\n- [第十七集执行清单](剧集制作/第一季/第17集/执行包V1/第十七集执行清单V1.md)\n'+mark);wr('README.md',r);
const p='完整剧本/第一季/第一季32集完整剧本总纲（编剧完成版V3）.md';let s=rd(p).replace('4320秒，即72分钟','4350秒，即72分30秒').replace('12集120秒、10集135秒、9集150秒','11集120秒、10集135秒、10集150秒').replace(/^(\| 17 \|[^\r\n]+\| )120秒 \|/m,'$1150秒 |');wr(p,s);
console.log('第17集150秒/全季4350秒、290段；入口进度147段');
