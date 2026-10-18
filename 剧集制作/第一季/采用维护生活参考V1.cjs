const fs=require('fs'),path=require('path'),crypto=require('crypto'),root=path.resolve(__dirname,'../..');
module.exports=ep=>{
 if(ep.id!=='32')return ep;const file=path.join(__dirname,'维护生活静态采用V1.json');if(!fs.existsSync(file))return ep;
 const plan=JSON.parse(fs.readFileSync(file,'utf8'));
 for(const[i,d]of ep.segments.entries()){
  const key=ep.id+'-'+String(i+1).padStart(2,'0'),items=plan.entries.filter(r=>r.targets.includes(key));if(!items.length)continue;
  for(const r of items){if(r.status!=='adopted-static'||crypto.createHash('sha256').update(fs.readFileSync(path.join(root,r.path))).digest('hex')!==r.sha256)throw Error('生活参考未核原图 '+r.id);if(!d.refs.some(x=>typeof x==='object'&&x.path===r.path))d.refs=[...d.refs,{path:r.path,purpose:r.purpose+(r.id==='LIFE-Y299-FAIL'&&key==='32-09'?' 本段只取上一段失败阀和浅盘旧环的来源对照，不重演坐地哭气；当前已明确稍后回台。':'')}];}
  d.missing='本轮有限静态已补：'+items.map(r=>r.label+'（'+r.phase+'）').join('、')+'；仍需各图指定的真实接触/动作/时间省略与实际配音口型字幕。旧伤首年仍在，百年后已渐愈，不据候选恢复；不把静态图或文件哈希当动态通过。\n'+d.missing;
 }
 return ep;
};
