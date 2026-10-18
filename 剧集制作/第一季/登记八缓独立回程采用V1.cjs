const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'../..');
const catalogs=['八缓独立回程原图清单V1.json','八缓独立回程原图清单V2.json','八缓肩带与末舱暂停原图清单V1.json','八缓分配轴检修原图清单V1.json'];
const all=catalogs.flatMap(p=>JSON.parse(fs.readFileSync(path.join(__dirname,p),'utf8')));
const plans=[];
for(const p of require('./八缓乘客身份与原点具体化V1.json').people){
 const key=p.id==='08'?'SLOW-08-R3':`SLOW-${p.id}-R2`,segment=+p.id<=8?'32-05':+p.id<=11?'32-06':'32-07';
 plans.push({id:key,label:p.id+'号第'+p.year+'年独立跨槛',person:p.id,year:p.year,targets:[segment],phase:'仅该编号的末步返乡镜头',purpose:`仅${segment}的第${p.year}年${p.id}号静态身份/门槛目标。${p.appearance}；门外${p.destination}。摄影机在原点，人物向镜头方向由后方门内走出，前脚已在原点实地、后脚仍门内；只延续本人的一步，不把照片当蓝舱内状态或要求同时生成其他七人。门框外景只取该片局部，不据近景给当地添永久中转屋。`,remaining:'对应一人的连贯跨槛/实际原点回执，先前安全出舱及原桥步行仍需独立动态证明；单张不代表整次救援完成'});
}
plans.push({id:'SLOW-12-PAUSE',label:'12号第30年半开留舱',person:'12',year:30,targets:['32-06'],phase:'本段9—12秒暂停态',purpose:'仅32-06第30年12号原单舱窄缝暂停，双脚均在舱底、双手离门缝、单人同脸衣/编号12与保存蓝光。门缝不够通人，不跨出去，不根据该图首帧直接回原点；不用于32-07成功尾态。小五金只外观，止销卡持过程/磨损根因须另核。',remaining:'远端停止触发、机械卡持过程、门缝真实宽度及安全保存、恢复后全开出舱动态'});
plans.push({id:'SLOW-AXLE-STOP',label:'开舱分配轴停机磨损',targets:['32-06'],phase:'本段末维护台诊断',purpose:'仅维护台可触的12号开舱指令分配支路停机检修近端，不是桥外悬舱承重轴。旧轴仍本机，旁路隔离/独立保存继续；不让B隔空拆换桥外支臂，不在此段先修好/数13。',remaining:'停机隔离的操作顺序、损轴定位与无载检修动态，不以静态生成机械工程结论'});
plans.push({id:'SLOW-AXLE-FIX',label:'同器换轴及旧件回收',targets:['32-07'],phase:'开场早已完成的维修记录参考',purpose:'仅同分配器替换轴已装/原旧轴回收格的状态，机械试开已在此前维护时间完成；第37年是下一适宜相位窗口，不是宣称修轴耗尽七年。不能把静态图当1秒完成拆装、不能凭图提前让第13人已返。',remaining:'回收重制/拆换/无载检查完整动态与记录对应，窗口前安全恢复指令回路'});
const entries=plans.map(p=>{const r=all.find(x=>x.id===p.id);if(!r||!r.purpose.startsWith('采用'))throw Error('缺有限视检采用原图 '+p.id);return {...r,...p,status:'adopted-static',qa:r.purpose,actualVideoGenerated:false};});
const out={date:'2026-10-18',scope:'八名匿名成年乘客独立末步返乡/12号留舱/原维护台支路检修静态，正式人物服饰母图未修改；没有实际音视频',sourceCatalogs:catalogs,entries,targetSegments:[...new Set(entries.flatMap(x=>x.targets))],specificCopyPlacements:entries.reduce((n,x)=>n+x.targets.length,0),contextCopyPlacements:9};
fs.writeFileSync(path.join(__dirname,'八缓独立回程静态采用V1.json'),JSON.stringify(out,null,2));console.log(JSON.stringify({raw:all.length,adopted:entries.length,rejected:all.length-entries.length,targets:out.targetSegments,specificCopies:out.specificCopyPlacements,contextCopies:out.contextCopyPlacements}));
