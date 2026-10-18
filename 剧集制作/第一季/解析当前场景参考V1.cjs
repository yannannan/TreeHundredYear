const fs=require('fs'),path=require('path');
module.exports=function resolve(r){
 if(!r)return r;
 const read=name=>{const file=path.join(__dirname,name);return fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):[];};
 const legacy=read('全场景提质采用映射V1.json'),current=read('精工克制场景采用映射V2.json');
 let out={...r},m=legacy.find(m=>m.origin===out.path);if(m)out={...out,path:m.path,width:m.width,height:m.height,bytes:m.bytes,sha256:m.sha256};
 const newer=current.find(m=>m.origin===out.path||m.origin===r.path);
 if(newer)out={...out,path:newer.path,width:newer.width,height:newer.height,bytes:newer.bytes,sha256:newer.sha256,purpose:(r.purpose||r.id||'场景参考')+'；精工克制'+(newer.path.match(/(R\d+)\.png$/)?.[1]||'R2')+'当前采用：'+newer.review+'；原功能/数量/状态/接触限制保留'};
 else if(m||legacy.some(m=>m.path===out.path))out.purpose=(r.purpose||r.id||'场景参考')+'；旧尺度场景待按精工克制V2修订，仅取已注明地形/动作与功能，不复制全面锈破';
 if(newer?.id==='L08-WIDE-REFINED-R2'&&(r.purpose||'').includes('空舱保持空'))out.purpose+='；本段最高优先：上述四暖八冷是原始初入层源图的视检描述，本段只取原桥/支臂和材质。按本段年份与累计返乡人数保留已空舱，绝不恢复四急灯态或已返人物；最终十三返后不再有留舱者。';
 const unchanged=read('场景原图合规视检登记V1.json').find(x=>x.path===out.path);
 if(unchanged)out={...out,width:unchanged.width,height:unchanged.height,bytes:unchanged.bytes,sha256:unchanged.sha256,purpose:(out.purpose||r.purpose||r.id||'场景参考').split('；新标准原图视检：')[0]+'；新标准原图视检：'+unchanged.review+'；本次未重绘或生成，原逐段动作/声音/数量/状态限制保留'};
 return out;
};
