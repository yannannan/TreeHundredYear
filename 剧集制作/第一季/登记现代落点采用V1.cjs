const fs=require('fs'),path=require('path');
const catalogs=['现代落地避车与核心半带原图清单V1.json','现代落点手位与去徽原图清单V2.json','现代同车闭窗反射原图清单V1.json'];
const all=catalogs.flatMap(f=>JSON.parse(fs.readFileSync(path.join(__dirname,f),'utf8'))),window=all.filter(r=>r.id.startsWith('MODERN-WINDOW')&&r.purpose.startsWith('采用')).at(-1);
if(!window)throw Error('缺经人工视检的闭窗局部反射采用图');
const plans=[
 {id:'MODERN-LAND-R2',label:'无徽单车后方/路缘落地右持半带',phase:'0—1秒低位着地',purpose:'仅现代同次穿越落地的一个瞬间：同双臂灯/左车道右人行道、唯一同款无徽车在后方、B双足着地屈膝/右手短半带/左臂平衡。不能用该低位跨步图证明完整下坠受力、车真实制动或侧滚全过程；不把车移上人行道，不新增药布/道具/第二个传送门。'},
 {id:'MODERN-SAFE-R2',label:'右拳护半带/左掌人行道支撑',phase:'约3—4秒避后',purpose:'只B避到高一阶右人行道后的撑起姿态：本人右拳始终握半带、本人左掌在左膝外侧石地支撑，膝足都在实地；同一车仍左车道，无新增徽标。不能用该图当起身已经完成或直接已到车窗，之后需要画外并行时间内走两三小步。'},
 {id:'CORE-HALF',label:'核心A左手半带/右掌残冰',phase:'4—7秒独立核心反切',purpose:'仅同一A真醒仍坐原锚、腰下残冰约束，结端半带已从左外袖解到左掌，右手在身侧残冰准备小推；左袖不再另复制半带，右腕无误包。不能拍他站起或已跨到现代，不能把B/车加在核心，旧忆/手控代价未撤销。'},
 {id:window.id,label:'同车关闭侧窗/同B局部反像',phase:'7—14秒车外停步及末句',purpose:'只同一B在停稳单车临人行道侧的全闭前侧窗外、右手仍持半带；一处较暗的玻璃局部反射不是第二真人或A，按真实光学对应高度/发饰/雨湿与镜像反向。照片只锁局部目标，真实动态反射/嘴型仍另验，不根据新图把落点搬到另一侧道路或新增第二车。'}
];
const entries=plans.map(p=>{const r=all.find(r=>r.id===p.id);if(!r||!r.purpose.startsWith('采用'))throw Error('缺现代采用原图 '+p.id);return {...r,...p,targets:['32-12'],status:'adopted-static',qa:r.purpose,actualVideoGenerated:false};});
const result={date:'2026-10-18',scope:'现代同次落点/半带分处/闭窗反射的四个有限静态；正式人物服饰母图不改，音视频未生成',sourceCatalogs:catalogs,entries,targetSegments:['32-12'],copiedReferencePlacements:entries.length};
fs.writeFileSync(path.join(__dirname,'现代落点静态采用V1.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({originals:all.length,adopted:entries.length,candidates:all.length-entries.length,target:'32-12',copies:entries.length}));
