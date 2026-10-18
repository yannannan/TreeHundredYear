const fs=require('fs'),path=require('path');
module.exports=function resolve(r){
 if(!r)return r;
 const read=name=>{const file=path.join(__dirname,name);return fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):[];};
 const legacy=read('全场景提质采用映射V1.json'),current=read('精工克制场景采用映射V2.json');
 let out={...r},m=legacy.find(m=>m.origin===out.path);if(m)out={...out,path:m.path,width:m.width,height:m.height,bytes:m.bytes,sha256:m.sha256};
 const newer=current.find(m=>m.origin===out.path||m.origin===r.path);
 if(newer)out={...out,path:newer.path,width:newer.width,height:newer.height,bytes:newer.bytes,sha256:newer.sha256,purpose:(r.purpose||r.id||'场景参考')+'；精工克制R2当前采用：'+newer.review+'；原功能/数量/状态/接触限制保留'};
 else if(m||legacy.some(m=>m.path===out.path))out.purpose=(r.purpose||r.id||'场景参考')+'；旧尺度场景待按精工克制V2修订，仅取已注明地形/动作与功能，不复制全面锈破';
 return out;
};
