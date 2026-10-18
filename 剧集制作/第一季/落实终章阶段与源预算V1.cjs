const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8'),write=(p,s)=>fs.writeFileSync(path.join(root,p),s);
function once(file,old,next){let s=read(file);if(s.includes(next))return;if(!s.includes(old))throw Error('找不到精确修订：'+file+' '+old.slice(0,50));write(file,s.replace(old,next));}
// 已有段的右腰刀状态仍正确；新模板允许明确收工具格，且为指定内心音轨单独禁口型。
once('剧集制作/第一季/逐段执行包生成器V1.cjs','短刃归右腰套，','短刃实际位置按本段首尾与下列清单，');
once('剧集制作/第一季/逐段执行包生成器V1.cjs',"${(/仅门内/.test(l[5])||l[6]==='offscreen')?", "${l[6]==='inner'?'此句是指定内心音轨，A/B都不为此句动嘴，不在同一句中突然改有声口型':(/仅门内/.test(l[5])||l[6]==='offscreen')?");
once('剧集制作/第一季/终章执行公共数据V1.cjs',"stored:'原短刃右腰/余药布与炭腰侧，", "stored:'原短刃/余药布/炭的手位按本段：31第9段起移原工具格、此后不回腰；");
const budgets={28:{sec:180,ranges:['00:00—00:45','00:45—01:15','01:15—02:00','02:00—02:45','02:45—03:00']},29:{sec:165,ranges:['00:00—00:45','00:45—01:15','01:15—01:45','01:45—02:15','02:15—02:45']},30:{sec:180,ranges:['00:00—00:30','00:30—01:00','01:00—01:30','01:30—02:15','02:15—03:00']},31:{sec:180,ranges:['00:00—00:30','00:30—01:00','01:00—01:45','01:45—02:30','02:30—03:00']},32:{sec:180,ranges:['00:00—00:30','00:30—01:00','01:00—01:45','01:45—02:15','02:15—02:30','02:30—03:00']}};
const sourceDir=path.join(root,'完整剧本/第一季');for(const [id,b]of Object.entries(budgets)){
 const file=fs.readdirSync(sourceDir).find(x=>x.endsWith(`（第${id}集）.md`));if(!file)throw Error('缺源剧本'+id);
 const p='完整剧本/第一季/'+file;let s=read(p).replace(/成片预算\d+秒/,'成片预算'+b.sec+'秒');b.ranges.forEach((r,i)=>{s=s.replace(new RegExp('### 场'+(i+1)+'｜[^\\r\\n]+'),'### 场'+(i+1)+'｜'+r)});
 if(id==='28')s=s.replace('苏晚从倒柱起跳，好腿发力','卫像前俯使胸侧封下降，苏晚以好右腿踏上同矮残台、只跨一步够封').replace('手臂被扯得渗血','原左前臂旧包边被牵得少量渗血，柱承受主力').replace('肩上见血','左肩新浅擦口少量见血，她末段用原余药布暂压');
 if(id==='29')s=s.replace('周辰拎起断剑包','周辰从原凳旁拎起同两截旧剑包').replace('苏晚把名册放在最外层','苏晚把名册放在内襟最外层');
 if(id==='30')s=s.replace('150秒，碎片','180秒，碎片');
 if(id==='31')s=s.replace('取掉可能夹伤的饰物','把短刃/余布/炭收进工具格，避免锚旁碰伤；原冠/花饰和服装款式不改').replace('把最后一条衣带系在他腕外','从既有余药布取一条窄布，松系他左腕外袖，尾端在外、不压旧灼纹或锁合线').replace('冰越过他的指节，握力慢慢消失','握力渐弱，她先主动抽回右手免被封；冰才越过他的指节，原窄布尾留外').replace('150秒完成试岗位','180秒完成试岗位');
 if(id==='32')s=s.replace('第4年至第37年／八人回程','第4年至第37年／八人回程（05—12逐人核）').replace('她先暂停换轴','12号末舱于第30年先暂停，回收换轴，等至第37年下一相位窗再放行').replace('外界双钟仍只移动极短一格','外界双钟仍只移动极短一格；前期踝/掌/肩伤已随数年正常渐愈、药布拆下，不永久绑三百年').replace('他抓到的衣带被拉直、断开','他左腕31同窄余布尾被她右手抓住、拉直，仅一处断开；两人各留一半').replace('“我听见了！”','“我听见了！”');
 const marker='## 终章固定15秒执行细化（2026-10-18）';if(!s.includes(marker))s+='\n\n'+marker+'\n\n'+b.sec/15+'段×15秒='+b.sec+'秒。按动作、对白及留白扩展原叙事预算，保留真奖励、独立授权和真实三百年；31/32道具收存、左右手、内心声/嘴型与专用参考边界见逐段执行包。人物服饰原图不修改，当前未生成真实音视频，不以静态校核冒充成片验收。\n';write(p,s);
}
let r=read('README.md');for(const[id,b]of Object.entries(budgets))r=r.replace(new RegExp('^(\\| '+id+' \\|[^\\r\\n]+?\\| )\\d+秒 \\|','m'),(_,a)=>a+b.sec+'秒 |');write('README.md',r);
const rows=[...r.matchAll(/^\| (\d{2}) \| \[[^\r\n]+?\]\([^\r\n]+?\) \| [^|\r\n]+ \| (\d+)秒 \|/gm)];if(rows.length!==32)throw Error('README预算必须32条');const total=rows.reduce((n,m)=>n+ +m[2],0),counts={};rows.forEach(m=>counts[m[2]]=(counts[m[2]]||0)+1);
const op='完整剧本/第一季/第一季32集完整剧本总纲（编剧完成版V3）.md';let o=read(op);for(const[id,b]of Object.entries(budgets))o=o.replace(new RegExp('^(\\| '+id+' \\|[^\\r\\n]+?\\| )\\d+秒 \\|','m'),(_,a)=>a+b.sec+'秒 |');o=o.replace(/32集，合计\d+秒，即[^。\r\n]+/,`32集，合计${total}秒，即78分15秒叙事预算`).replace(/\d+集120秒、[^；\r\n]+；录音/,[120,135,150,165,180].filter(t=>counts[t]).map(t=>counts[t]+'集'+t+'秒').join('、')+'；录音');write(op,o);
console.log(JSON.stringify({budgets,total,segments:total/15,counts}));
