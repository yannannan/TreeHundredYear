const fs=require('fs'),path=require('path');
const raw=JSON.parse(fs.readFileSync(path.join(__dirname,'第九层收势关键帧原图清单V1.json'),'utf8'));
const specs=[
 ['FINISH-CHAIN-R2',['28-09','28-10'],'同链绕柱/右持半截左扶石','09末；10从已牵开状态起','同一翼链从原连接眼贴原柱角转向、末环卡同断柄钝刃背，A右腕无包/原左前臂窄包、双靴实地。仅09末/10维持牵翼局部，不能让卫整个移位或把同链延到11卸出以后；左包新渗/真实承力及另一侧B完整路程另核。'],
 ['FINISH-RELEASE',['28-11'],'链末环与断刃脱开空隙','0—3秒内卸环后、退身前','原同链完整且绕原柱、末环松垂与A同柄半截有空气隙，右手持残剑/右腕无包/左旧包小渗。只本段初卸环后一瞬，巨刃尚抬位，不当落刃/退身/末扫；不把链切断或重新套回刃。'],
 ['FINISH-DUCK-R3',['28-11'],'双人低阶各右持兵刃左掌撑地','9—11秒同末扫空过','A/B已到原侧低阶分别右手持断柄/短刀、左掌撑地；A右腕无包/左旧包小渗，B前好右足无包、后伤踝部分在裙后。只同一宽巨刃从头冠上方空过的瞬间，不证明真实安全距离/脚负重；第一小封暗裂、胸镜未毁，非卫归座或九环全停。'],
 ['FINISH-KNEEL-R2',['28-11','28-12'],'唯一原宽刃卫跪原基座/九环','11末终态；12开始后门未开','原环境九个高空大铜环可数、唯一卫右膝落原基座/左靴立/右持同宽巨刃收向实石侧/链松垂/后门仍闭。只11末和12初既成状态，不是环停/跪座过程或开后门后的画面；A/B在下方侧低阶画外，不能据空景抹除人和旧剑两截去向。远景小封不清，沿两破封近景不复原。']
];
const entries=specs.map(([id,targets,label,phase,purpose])=>{const r=raw.find(x=>x.id===id);if(!r||!r.purpose.startsWith('采用'))throw Error('原图未采用 '+id);return {...r,qa:r.purpose,purpose,targets,label,phase,status:'adopted-static',actualVideoGenerated:false};});
const result={date:'2026-10-18',scope:'第28集收势4项限定静态，不是动态/承力/刀扫安全验证',sourceCatalog:'第九层收势关键帧原图清单V1.json',sourceJobs:'第九层收势关键帧生成归档V1.json',entries,targets:[...new Set(entries.flatMap(x=>x.targets))],referenceCopyPlacements:entries.reduce((n,x)=>n+x.targets.length,0)};
fs.writeFileSync(path.join(__dirname,'第九层收势静态采用V1.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({raw:raw.length,adopted:entries.length,candidates:raw.length-entries.length,segments:result.targets.length,copies:result.referenceCopyPlacements}));
