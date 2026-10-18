const fs=require('fs'),path=require('path'),raw=JSON.parse(fs.readFileSync(path.join(__dirname,'第一二四层接触补制原图清单V1.json'),'utf8'));
const specs=[
 ['CONTACT05-ANCHOR-R2','05-02','约9—10秒真锚回绕/抛回绳前','只取同C03衣袖、两膝落窄沿/小真锚回绕与腰约束局部，误手背伤已去。绳穿眼/回扣全路部分遮挡，不能复制为已验承重绳结；原梁控制线/旧链仍按本段，不把大临时链眼当真锚。'],
 ['CONTACT07-BLADE','07-02','10—15秒退墙后刃扫旧足位','只取真人B右短刃/左腕断绳、双足在实墙安全边、实体刃与双足/裙分离；无后期白包。F仍原深门画外，A隔墙，不能因本插入无人就删掉F或补真A；回槽在本段后续，不把静刃当已停机关。'],
 ['CONTACT13-WEDGE-R4','13-05','5—10秒后半空鞘刚楔入初细裂','只取A左掌四指上/拇指下扣、左旧包/破袖、同空木鞘口无柄/闭端抵柱与槽内大刃的局部。A右剑、H全体/B低绕在画外仍按本段；13-06才破腕甲、13-08才裂弃鞘，不能提前。触点/手距不是承力或刃背截面已验。']
];
const entries=specs.map(([id,target,phase,purpose])=>{const r=raw.find(r=>r.id===id);if(!r?.purpose.startsWith('采用'))throw Error('尚未视检 '+id);return{...r,qa:r.purpose,purpose,targets:[target],phase,status:'adopted-static',actualVideoGenerated:false};});
fs.writeFileSync(path.join(__dirname,'第一二四层接触静态采用V1.json'),JSON.stringify({date:'2026-10-18',sourceCatalog:'第一二四层接触补制原图清单V1.json',sourceJobs:'第一二四层接触补制生成归档V1.json',scope:'仅三处局部静态目标，其他动作/力学/真实视频仍缺',entries,referenceCopyPlacements:3},null,2)+'\n');console.log(JSON.stringify({raw:raw.length,adopted:entries.length,candidates:raw.length-entries.length,copies:3}));
