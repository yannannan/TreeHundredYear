const fs=require('fs'),path=require('path');
const raw=JSON.parse(fs.readFileSync(path.join(__dirname,'第九层战斗关键帧原图清单V1.json'),'utf8'));
const use=[
 ['FIGHT-REFLECT-R2',['28-02'],'单符折返与右足避线','4—6秒折返已发生、小滚前','同一镜胸的一条细返光、B左手无包/右包掌、右好足主承重/左伤踝后卸重、A原整剑。只本段折返避线时刻，不当首帧已放符、末帧柱断后或完整滚地；九环只局部，不据图改计数或实际高度。'],
 ['FIGHT-WEDGE-WIDE-R2',['28-06','28-07'],'石肩承重及A双足柄侧','06末楔稳；07开头第一封未破','完整旧剑横搭两实体石肩/巨刃压中、A右手控柄左手离受力区、双靴实地。只06末及07前4秒维持态，不能重新楔剑或把未破封/完整剑带到07末与08断后；B和可达封高度画外、需其他同框补验。'],
 ['FIGHT-BROKEN-R2',['28-08','28-09'],'旧剑两截及第一封破态','08末已滚起；09开始尚未绕链','A右手同柄半截、唯一尖段在卫甲靴旁、靠矮台侧小封暗裂/胸镜未毁、A双靴实台。只08末和09最初短瞬，非08首帧完整剑或09绕柱后的动作，不复制地尖/背生整剑；另一封与九环全数不在局部证明。'],
 ['FIGHT-SECOND-JAM-R2',['28-10','28-11'],'独立第二封卡刀上手','10末上手；11开始尚未切断','B右包掌握同木柄刀尖卡独立小封、左无包手扶钝翼缘，镜胸侧转仅远边、右好足前/左伤踝后。只10末与11最初态，不能作第二封已断或把镜胸转正；第一封画外不重置，完整送刀/走近需动态。'],
 ['FIGHT-SECOND-BREAK-R2',['28-11'],'第二封贯通缺口且刀未抽','4—7秒压断后、抽刀前特写','同独立第二小封有贯通黑隙与分离断头、局部嵌框边缘同时缺一小段，右刀未断未抽、左扶翼缘/胸镜不正对。采用实际缺口，提示厚框无损未完全达到、不冒称框完整。只本段压断后待拔中间态，不作首帧、九环停或卫跪结果。']
];
const entries=use.map(([id,targets,label,phase,purpose])=>{
 const r=raw.find(x=>x.id===id);if(!r||!r.purpose.startsWith('采用'))throw Error('原图尚未视检采用：'+id);
 return {...r,qa:r.purpose,purpose,targets,label,phase,status:'adopted-static',actualVideoGenerated:false};
});
const result={date:'2026-10-18',scope:'第28集五项有限静态，非实际视频或力学/光学验收',sourceCatalog:'第九层战斗关键帧原图清单V1.json',sourceJobs:'第九层战斗关键帧生成归档V1.json',entries,targets:[...new Set(entries.flatMap(x=>x.targets))],referenceCopyPlacements:entries.reduce((n,x)=>n+x.targets.length,0)};
fs.writeFileSync(path.join(__dirname,'第九层战斗静态采用V1.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({raw:raw.length,adopted:entries.length,candidates:raw.length-entries.length,segments:result.targets.length,copies:result.referenceCopyPlacements}));
