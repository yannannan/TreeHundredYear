const fs=require('fs'),path=require('path'),crypto=require('crypto'),root=path.resolve(__dirname,'../..');
module.exports=ep=>{
 if(ep.id!=='32')return ep;const file=path.join(__dirname,'现代落点静态采用V1.json');if(!fs.existsSync(file))return ep;
 const m=JSON.parse(fs.readFileSync(file,'utf8')),d=ep.segments[11];
 for(const r of m.entries){if(r.status!=='adopted-static'||crypto.createHash('sha256').update(fs.readFileSync(path.join(root,r.path))).digest('hex')!==r.sha256)throw Error('未核现代原图 '+r.id);if(!d.refs.some(x=>typeof x==='object'&&x.path===r.path))d.refs=[...d.refs,{path:r.path,purpose:r.purpose}];}
 d.missing='本轮已补限定静态：'+m.entries.map(r=>r.label+'（'+r.phase+'）').join('、')+'。原图仅一个瞬间或局部反射/持物，完整落滚/车制动/实际光学与全部声音口型字幕未验，不作为成片或物理试验证据。\n'+d.missing;
 return ep;
};
