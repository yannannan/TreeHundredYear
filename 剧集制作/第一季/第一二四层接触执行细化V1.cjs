const fs=require('fs'),path=require('path'),crypto=require('crypto'),root=path.resolve(__dirname,'../..');
module.exports=ep=>{
 if(!['05','07','13'].includes(ep.id))return ep;
 const m=JSON.parse(fs.readFileSync(path.join(__dirname,'第一二四层接触静态采用V1.json'),'utf8')),base=JSON.parse(fs.readFileSync(path.join(__dirname,'第一集真实参考来源V2.json'),'utf8'));
 const remaining={
 '05-02':'真锚穿眼回扣完整单绳路仍遮挡、实际渐进试载/腰环/原梁冗余、同空间抛回绳与A接绳仍待专用机位及动态，不用局部静结证明承力。旧链和真锚必须分开，A仍原梁不提前过界。',
 '07-02':'袖内第三次试掌/F追答延迟、右手挑实际锁簧、左脚先绕线再收右脚和实体扫过/回槽全过程仍需动态，窄门仍受影锁未开，不以分辨假影免除真刀危险。',
 '13-05':'完整引刀绕柱/刀背进槽、木鞘两端承力和初裂、A右完整旧剑对腕甲/H持续挣动/B低绕落脚仍待其他机位和动态；图只局部左掌/鞘口/柱槽，不做全身首帧或受力认证。'
 };
 for(let i=0;i<ep.segments.length;i++){
  const d=ep.segments[i],key=ep.id+'-'+String(i+1).padStart(2,'0');
  d.refs=d.refs.map(r=>{const id=typeof r==='string'?r:r.id;
   if(id==='PROP03')return{path:base.find(r=>r.id==='PROP03').path,purpose:'仅同旧铁剑/原硬木鞘形制；古符第3集已永久失去，不复制符/隔布或角色装饰剑。右剑/左空鞘或入背按本段；13-05初裂/13-08裂弃后不能复原，28才永久断剑。'};
   if(id==='PROP02')return{path:base.find(r=>r.id==='PROP02').path,purpose:'仅原修物短刃/刀套与检修绳纤维，不复制塔外长绳整卷/沙囊。05段序决定桥绳/05-04后短余绳，07只左腕各一截断绳而非完整相连，13有效短绳在腰；刀到右手则腰套空，具体位置按本段。'};
   return r;
  });
  const items=m.entries.filter(r=>r.targets.includes(key));if(!items.length)continue;
  for(const r of items){if(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,r.path))).digest('hex')!==r.sha256)throw Error('新接触源图未核 '+r.id);if(!d.refs.some(x=>typeof x==='object'&&x.path===r.path))d.refs=[...d.refs,{path:r.path,purpose:r.purpose+'；精工克制新制局部，未覆盖的脸/全身/动作不能从此插入推断。'}];}
  if(!d.camera.includes('新增参考只用于'))d.camera+='；新增参考只用于'+items.map(r=>r.phase).join('、')+'的近景插入，首尾和其他人物画外方位保持，不将局部图当15秒整段构图。';
  d.missing='已补有限静态：'+items.map(r=>r.phase).join('、')+'。'+remaining[key]+'实际H3视频、声音配音/音乐、口型与简中字幕、受力/连续动作均未生成或验收。';
 }
 return ep;
};
