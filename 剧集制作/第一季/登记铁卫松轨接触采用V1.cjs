const fs=require('fs'),path=require('path');
const read=f=>JSON.parse(fs.readFileSync(path.join(__dirname,f),'utf8')),raw=read('铁卫松轨接触原图清单V1.json');
const specs=[
 ['IRON14-RAIL-WEDGE-R2','0—5秒右短刃楔已松卡点','仅取B原银蓝袖/单右手、原木柄小短刃与既松轨卡点接触。铰座/原挂轨承重，刀不支撑整轨；大板面精工完整，接触破口保留。铁卫、A、边肋全路径画外仍按本段；白掌包18集以后才有，此处不加。'],
 ['IRON14-DAMAGED-HOOK-R2','5—10秒完整旧剑尖挑受损挂连接','仅取A右手画外持同完整旧直剑末段/既有小缺口，挑既损连接销及局部空气隙。不是切断健全粗链，不提前28集断剑；硬鞘13集已弃、古符3集已失均不重生。仍须原承托/限位/安全边肋全空间及撤退动态。']
];
const entries=specs.map(([id,phase,purpose])=>{const r=raw.find(r=>r.id===id);if(!r?.purpose.startsWith('采用'))throw Error('尚未视检 '+id);return{...r,qa:r.purpose,purpose,targets:['14-05'],phase,status:'adopted-static',actualVideoGenerated:false};});
fs.writeFileSync(path.join(__dirname,'铁卫松轨接触静态采用V1.json'),JSON.stringify({date:'2026-10-18',sourceCatalog:'铁卫松轨接触原图清单V1.json',sourceJobs:'铁卫松轨接触生成归档V1.json',scope:'14-05两处有限静态插入，不代替全轨/铁卫/边肋动态',entries,referenceCopyPlacements:2},null,2)+'\n');console.log(JSON.stringify({raw:raw.length,adopted:entries.length,candidates:raw.length-entries.length,copies:2}));
