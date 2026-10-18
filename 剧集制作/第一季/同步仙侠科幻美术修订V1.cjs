const fs=require('fs'),path=require('path');
const dir=__dirname,root=path.resolve(dir,'../..');
const baseline=path.join(dir,'全剧通用提示词.md');
let master=fs.readFileSync(baseline,'utf8');
const oldCommon=master.match(/```text\s*([\s\S]*?)```/)[1].trim();
const art=`【仙侠科幻美术修订：2026-10-18优先执行】
用户最新口径：场景不要太仙侠，颜色不能花里胡哨；基于此前古旧设计稍微提升即可。原有古旧、厚重、神秘的上古星际设施是主基底，保持既有建筑轮廓、石阶桥路、环轨和各层行动布局。青黑、石灰、暗铜等低饱和主色稳定，局部暖灯和必要冷色能量承担叙事作用；不新增大面积金碧宫殿、洁白玉石翻新、装饰飞檐、彩色水晶和多色光污染。仙侠人物与古文明科幻机制仍成立，场景不为强调仙气而改造成华丽天宫。
只适度提升原基底的材质、工艺可读性和电影布光：保留石纹、岁月感、暗铜包浆及必要局部损坏；减少过密的碎裂噪点、无意义泥污和全表面重锈，让承重结构、雕纹边缘、机关接触点和前中后景更清楚。黑位有细节，亮部不泛白，金属不刷成鲜黄亮金；危险、神秘和庄严可通过尺度、构图、运动及声音表达，不靠加彩光或堆装饰。参考抖音AI漫剧《大天蓬》的场景/人物呈现质量，用于适度提质，不擅自引入未经核实的原作造型与色彩。
剧情必要损坏严格局限在当段已发生的部位：如偏移断轨、卡扣接触面、单块检修薄板、实体裂印、指定衣袍小缺口及小焦边。锁定它们的位置、范围和先后，不恢复伤势、不断掉因果、不扩大为整身破衫或整座残城。伤后人物仍保留已认可的脸、发型、华服轮廓、精细绣纹和美感；面部不添加无依据的尘泥、苍老或伤痕。苏晚保持成年银蓝华服和赤足设定，周辰保持成年黑金华服；配角按身份做可信工艺，儿童仍为普通儿童穿着。
本条以用户最后确认的古旧基底适度提质为准，覆盖此前“华美仙宫/大面积玉石金饰”的过度修订；不覆盖本段明确的动作、建筑拓扑、道具数量、真实负伤与服装损坏连续性。新美术样图仅说明已注明的材质/光线/服饰质感，不冒充全部精确机位或已完成动态验证。`;
if(oldCommon.includes('【仙侠科幻美术修订：2026-10-18优先执行】')) master=master.replace(/【仙侠科幻美术修订：2026-10-18优先执行】[\s\S]*?(?=【震撼场景的拍法】)/,art+'\n\n');
else master=master.replace('【震撼场景的拍法】',art+'\n\n【震撼场景的拍法】');
master=master.replace(/制作母版 V1\.[678]/,'制作母版 V1.8');
const newCommon=master.match(/```text\s*([\s\S]*?)```/)[1].trim();
const updates=[];
for(let n=1;n<=32;n++){
 const id=String(n).padStart(2,'0'),v=n===1?'V2':'V1',ledger=path.join(dir,`第${id}集/执行包${v}/连续性与参考校核${v}.json`);
 if(!fs.existsSync(ledger))continue;
 const data=JSON.parse(fs.readFileSync(ledger,'utf8'));
 for(const d of data.segments){const file=path.join(root,d.prompt||d.promptFile),s=fs.readFileSync(file,'utf8');
  if(s.includes(newCommon))continue;
  if(!s.includes(oldCommon))throw Error('无完整旧母版，停止同步：'+file);
  updates.push({file,body:s.replace(oldCommon,newCommon)});
 }
}
fs.writeFileSync(baseline,master);
for(const u of updates)fs.writeFileSync(u.file,u.body);
const result={date:'2026-10-18',commonVersion:'V1.8',updatedPromptFiles:updates.length,scope:'现有执行包完整母版；古旧基底适度提质覆盖先前过度华丽化；图片重绘仅按实际生成记录计数',actualVideoGenerated:false};
fs.writeFileSync(path.join(dir,'仙侠科幻美术文字同步核验V1.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result));
