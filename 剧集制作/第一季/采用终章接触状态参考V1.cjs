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
   const purpose=item.purpose+(key==='28-08'?' 仅作本段首帧完整受压剑，0—4秒明确折断后不得照此把剑恢复。':'')+(key==='32-12'&&item.id==='CONTACT-SLOTS'?' 仅核心A反切桌面的既有道具位置，不把双槽或道具带到现代B旁。':'')+(key==='32-12'&&item.id==='CONTACT-BROKENBAND'?' 只取原断点和各自半带材质：B右手尾端在现代，A结端从左外袖移左掌仍核心；不把这张双人断点同框当现代重逢。':'');
   if(!d.refs.some(r=>typeof r==='object'&&r.path===item.path))d.refs=[...d.refs,{path:item.path,purpose:purpose.replace(/[。；]+$/g,'')}];
   let remaining=item.remaining;
   if(item.id==='CONTACT-SLOTS'&&key!=='31-08')remaining='只延续已经留置的左小冰/右碎印位置、碎片朝向和与本段机位的空间对应，入槽与崩碎已经发生，不在本段重演；当前实际动作仍按时轴验';
   if(item.id==='CONTACT-HOLD'&&key==='31-11')remaining='原台机械暂稳、B沿实桥走近/右苏握左周的真实行程与重心，现图只是末时刻，不能把她留远台还能握手';
   if(item.id==='CONTACT-HOLD'&&key==='31-12')remaining='只从既有握手起，B抽回右手/沿桥回原台/左手末环才全冰封的连续顺序；不重演上一段降温或走近';
   if(item.id==='CONTACT-WAKE2'&&key==='32-11')remaining='只承上一段已经真醒/触颊的状态，再按本段改抓手和同带；不得重演冰裂苏醒、内心旁白或旧问答';
   if(item.id==='CONTACT-WEDGE3'&&key==='28-07')remaining='只承上一段已经楔稳的完整旧剑/石肩受力，核B切第一封与A维持柄位的同空间，不重演引刃入槽';
   if(item.id==='CONTACT-WEDGE3'&&key==='28-08')remaining='只以前段完整受压剑作首态，核撤巨刃到原崩口折两截/断柄与剑尖去向，不再次插整剑或修复';
   if(item.id==='CONTACT-BROKENBAND'&&key==='32-12')remaining='两半已经在上一段断好，本段核现代B持尾端/核心A留结端的分别握持，不能重演撕断/两人同框重逢';
   notes.push(item.label+'：'+remaining);
  }
  const suffix='每项仅补目标静态时刻；连续动作、对白配音、嘴型与对应字幕渲染、重心/受力/跨段剪辑仍未实际生成或验收，不因有参考图标成已完成。';
  if(key==='28-06'||key==='28-07'||key==='28-08')d.missing='本段已有的专用静态目标：'+items.map(x=>x.label).join('、')+'。仍需：'+notes.join('；')+'；破封/落地/受力断剑前后顺序按本段首尾，矮台与单卫总体高度需实片确认。'+suffix;
  else if(+ep.id===31)d.missing='本段已有专用静态目标：'+items.map(x=>x.label).join('、')+'。仍需：'+notes.join('；')+'；本段时轴的其余物位/首尾机位与连续动作仍需对应近端参考和动态，不生成此前已完成的其他工序。'+suffix;
  else d.missing='本段已有专用静态目标：'+items.map(x=>x.label).join('、')+'。仍需：'+notes.join('；')+'。上述图未覆盖的本段首尾机位、完整接触过程及对应计数/状态变化仍需补制或实际验证，不以静物图替代人物演出。'+suffix;
  d.refs=d.refs.map(r=>typeof r==='object'&&r.purpose?.includes('当前碎态专用图尚缺')?{...r,purpose:r.purpose.replace('当前碎态专用图尚缺','当前碎态仅见就近双独立槽V4静态，崩裂动态尚缺')}:r);
 }
 return ep;
};
