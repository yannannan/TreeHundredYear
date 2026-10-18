const fs=require('fs'),path=require('path'),crypto=require('crypto'),root=path.resolve(__dirname,'../..');
module.exports=ep=>{
 if(ep.id!=='14')return ep;
 const m=JSON.parse(fs.readFileSync(path.join(__dirname,'铁卫松轨接触静态采用V1.json'),'utf8'));
 const d=ep.segments[4];
 for(const r of m.entries){if(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,r.path))).digest('hex')!==r.sha256)throw Error('铁卫接触源图未核 '+r.id);if(!d.refs.some(x=>typeof x==='object'&&x.path===r.path))d.refs=[...d.refs,{path:r.path,purpose:r.purpose}];}
 d.camera+='；新增两张仅为0—5秒右短刃触松卡点、5—10秒右完整旧剑尖挑损销的近景插入，不能作为整段首帧或把刀/剑当整轨承重支柱；回到原35mm铁卫限位/安全边肋与10—15秒取刀撤退构图。';
 d.missing='已补两处有限静态：右短刃楔既松卡点、完整旧剑尖挑既损挂连接。原轨铰点/挂承托全貌、轨靠自重偏转与铁卫被逼回限位、左护臂/右刃臂方向、刀取回及A/B沿未断边肋返回炭标的完整连续动作仍待专用机位及动态；不以局部销口证明承力/安全。A局部侦察记忆缺失、细抖和右背手浅烫痕持续，B原右掌擦伤无后期白包。实际H3视频、配音/音乐、口型与简中字幕尚未制作。';
 return ep;
};
