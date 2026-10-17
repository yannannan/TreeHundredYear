// 确定性排版：不放大、不镜像、不改变角色；依赖本机 bundled sharp。
const fs = require('fs');
const path = require('path');
const sharp = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root = __dirname;
const W=4256,H=6800,tw=1024,th=1536,gap=32;
const xml = s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
async function main(){
 for(const [name,id,traits,color] of [['周辰','ZC-F01','克制 · 嘴硬心软 · 自嘲幽默','#ddbd7e'],['苏晚','SW-F01','灵动 · 机敏 · 敢爱敢担','#b8dce9']]){
  const entries=[['01 正面全身','独立正面全身V1'],['02 左前45°全身','独立左45度全身修正V2'],['03 左侧全身','独立左侧全身V1'],['04 左后45°全身','独立左后45度全身修正V2'],['05 背面全身','独立背面全身V2'],['06 右后45°全身','独立右后45度全身V2'],['07 右侧全身','独立右侧全身V2'],['08 右前45°全身','独立右45度全身V2'],['09 正面头肩','独立正面头肩V1'],['10 左45°头肩','独立左45度头肩V1'],['11 侧向头肩','独立左侧头肩V1'],['12 半身表演','独立半身表演V1'],['13 正面服装',name==='周辰'?'COST:ZC-COST01_独立正面衣饰细节V1':'COST:SW-COST01_独立服装陈列V1'],['14 背面服装','独立背面服装V2'],['15 坚定表情','独立坚定表情V2'],['16 含笑表情','独立含笑表情V2']];
  const layers=[],manifest=[];
  let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><style>text{font-family:Microsoft YaHei,sans-serif}</style><rect width="100%" height="100%" fill="#111a24"/><text x="40" y="98" font-size="70" fill="${color}" font-weight="bold">${name}｜第一季 · 16格完整角度人物资产板 V2</text><text x="42" y="155" font-size="30" fill="#c1cbd3">八方向全身 · 头肩与半身 · 正背衣装 · 表情　｜　${traits}　｜　${id}</text>`;
  for(let i=0;i<entries.length;i++){
   const [label,suffix]=entries[i],file=path.join(root,name,(suffix.startsWith('COST:')?suffix.slice(5):id+'_'+suffix)+'.png');
   const meta=await sharp(file).metadata();
   const scale=Math.min(tw/meta.width,th/meta.height,1);
   const width=Math.floor(meta.width*scale),height=Math.floor(meta.height*scale);
   const x=32+(i%4)*(tw+gap),y=200+Math.floor(i/4)*1640;
   const buf=await sharp(file).resize(width,height,{fit:'inside',withoutEnlargement:true}).png().toBuffer();
   layers.push({input:buf,left:x+Math.floor((tw-width)/2),top:y+Math.floor((th-height)/2)});
   svg+=`<text x="${x+tw/2}" y="${y+1591}" text-anchor="middle" font-size="40" fill="${color}">${xml(label)}</text>`;
   manifest.push({label,source:path.relative(root,file).replaceAll('\\','/'),sourceSize:[meta.width,meta.height],tileSize:[width,height],scale});
  }
  svg+=`<text x="40" y="6780" font-size="26" fill="#a6b3c0">独立原图合成 · 无放大与镜像 · 单格有效像素见制作记录 · 身份及衣装以认可原图为基准</text></svg>`;
  const out=path.join(root,name,name+'_16格全角度人物资产总板V2.png');
  await sharp(Buffer.from(svg)).composite(layers).png().toFile(out);
  fs.writeFileSync(path.join(root,name,name+'_16格总板像素与来源V2.json'),JSON.stringify({canvas:[W,H],nativeSingleImageGeneration:false,upscaled:false,mirrored:false,tiles:manifest},null,2));
  console.log(JSON.stringify({out,...await sharp(out).metadata()}));
 }
}
main().catch(e=>{console.error(e);process.exit(1)});


