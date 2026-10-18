const fs=require('fs'),path=require('path'),crypto=require('crypto'),root=path.resolve(__dirname,'../..');
module.exports=ep=>{
 const manifest=path.join(__dirname,'终章接触状态采用V1.json');if(!fs.existsSync(manifest))return ep;
 const catalog=JSON.parse(fs.readFileSync(manifest,'utf8'));
 for(const [i,d]of ep.segments.entries()){
  const key=ep.id+'-'+String(i+1).padStart(2,'0'),items=catalog.entries.filter(x=>x.targets.includes(key));if(!items.length)continue;
  const notes=[];
  for(const item of items){
   if(item.status!=='adopted-static'||!item.qa||!item.remaining)throw Error('未经静态视检采用的图：'+item.id);
   const file=path.join(root,item.path),bytes=fs.readFileSync(file);if(crypto.createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw Error('接触原图变更未复核：'+item.path);
   const purpose=item.purpose+(key==='28-08'?' 仅作本段首帧完整受压剑，0—4秒明确折断后不得照此把剑恢复。':'')+(key==='32-12'?' 仅核心A反切桌面的既有道具位置，不把双槽或道具带到现代B旁。':'');
   if(!d.refs.some(r=>typeof r==='object'&&r.path===item.path))d.refs=[...d.refs,{path:item.path,purpose}];
   notes.push(item.label+'：'+item.remaining);
  }
  const suffix='每项仅补目标静态时刻；连续动作、对白配音、嘴型与对应字幕渲染、重心/受力/跨段剪辑仍未实际生成或验收，不因有参考图标成已完成。';
  if(key==='28-06'||key==='28-07'||key==='28-08')d.missing='本段已有的专用静态目标：'+items.map(x=>x.label).join('、')+'。仍需：'+notes.join('；')+'；破封/落地/受力断剑前后顺序按本段首尾，矮台与单卫总体高度需实片确认。'+suffix;
  else if(+ep.id===31)d.missing='本段已有专用静态目标：'+items.map(x=>x.label).join('、')+'。仍需：'+notes.join('；')+'；原本段其余动作（独立入槽/收存物件/椅距/系窄布/暂稳/沿实桥往返/最终闭合）按各自时轴仍需对应近端参考和动态。'+suffix;
  else d.missing='本段已有专用静态目标：'+items.map(x=>x.label).join('、')+'。仍需：'+notes.join('；')+'。本段完整任务为：'+d.story+'。上述专用图未覆盖的首尾机位、完整接触过程及对应计数/状态变化仍需补制或实际验证，不以静物图替代人物演出。'+suffix;
  d.refs=d.refs.map(r=>typeof r==='object'&&r.purpose?.includes('当前碎态专用图尚缺')?{...r,purpose:r.purpose.replace('当前碎态专用图尚缺','当前碎态仅见就近双独立槽V4静态，崩裂动态尚缺')}:r);
 }
 return ep;
};
