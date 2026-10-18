const fs=require('fs'),path=require('path'),crypto=require('crypto'),root=path.resolve(__dirname,'../..');
module.exports=ep=>{
 if(ep.id!=='32')return ep;
 const f=path.join(__dirname,'八缓独立回程静态采用V1.json');if(!fs.existsSync(f))return ep;
 const manifest=JSON.parse(fs.readFileSync(f,'utf8')),{R}=require('./终章执行公共数据V1.cjs');
 for(const[i,d]of ep.segments.entries()){
  const key=ep.id+'-'+String(i+1).padStart(2,'0'),selected=manifest.entries.filter(r=>r.targets.includes(key));if(!selected.length)continue;
  const context=[{...R.L8,purpose:'仅原桥/原支臂舱的几何，按当前阶段前人已返、空舱保持空，不按初始总图补回已返者或四黄灯'},{...R.hut,purpose:'仅原中转屋木凳/侧桥入口/储备结构；主门在本段已按当前编号接对应原点，不取未启用旧图的主门外灰雾'},{path:'场景资产/第一季/九层星渊塔/SC-L08_中转屋主门回程原点接点V1.png',purpose:'仅沿用原中央主门铜框及门内木凳/暖灯，侧门仍桥；此图外山阶只适用最早五人，不套到05—12归处，当前门外各取本人的采用图/明确目的地'}];
  for(const r of selected){const b=fs.readFileSync(path.join(root,r.path));if(r.status!=='adopted-static'||crypto.createHash('sha256').update(b).digest('hex')!==r.sha256)throw Error('八缓原图未核 '+r.id);}
  for(const r of [...context,...selected])if(!d.refs.some(x=>typeof x==='object'&&x.path===r.path))d.refs=[...d.refs,{path:r.path,purpose:r.purpose}];
  d.missing='已补有限静态：'+selected.map(r=>r.label+'（'+r.phase+'）').join('、')+'。原片仍须：'+selected.map(r=>r.remaining).join('；')+'。对应成功图只取该人的门槛瞬间，暂停图只取第30年留舱；新图不证明音视频/口型/字幕或全程动作通过。\n'+d.missing;
 }
 return ep;
};
