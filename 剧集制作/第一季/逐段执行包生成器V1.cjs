const fs=require('fs'),path=require('path'),crypto=require('crypto');
const dir=__dirname,root=path.resolve(dir,'../..');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
module.exports=function generate(ep){
 ep=require('./采用终章接触状态参考V1.cjs')(ep);
 const out=path.join(dir,`第${ep.id}集/执行包V1`);fs.mkdirSync(out,{recursive:true});
 const common=fs.readFileSync(path.join(dir,'全剧通用提示词.md'),'utf8').match(/```text\s*([\s\S]*?)```/)[1].trim();
 const cat=read(path.join(dir,'第一集真实参考来源V2.json'));
 const get=id=>cat.find(x=>x.id===id);const fixed=['ZC-FULL','ZC-HEAD','SW-FULL','SW-HEAD'].map(get);
 const prev=read(path.join(dir,ep.previous)).segments.at(-1).end;
 const records=[],errors=[],warnings=[];let lastEnd=prev,lastScene=ep.scene||null;
 for(const [i,d] of ep.segments.entries()){
  const n=i+1,num=String(n).padStart(2,'0'),folder=path.join(out,`第${num}段_${d.name}`);fs.mkdirSync(folder,{recursive:true});
  d.start??=lastEnd;d.scene??=lastScene;if(!d.scene)throw Error(ep.id+'-'+n+'缺明确场景');lastScene=d.scene;
  for(const field of ['name','story','start','end','scene','camera','sound','missing'])if(typeof d[field]!=='string'||!d[field].trim())throw Error(ep.id+'-'+n+'缺字段'+field);
  if(!Array.isArray(d.t)||!d.t.length)throw Error(ep.id+'-'+n+'缺动作时轴');
  if(d.start!==lastEnd&&!d.sceneCut)errors.push(n+'首尾不等且未声明换场');
  const refs=[...fixed,...d.refs.map(r=>typeof r==='string'?get(r):r)].map(r=>{if(!r||+ep.id<14)return r;if(r.path===get('PROP03').path)return {...r,purpose:'只取旧铁剑刃/柄实体形。古符第3集已失、硬木剑鞘第13集毁弃，禁止把图中古符/完整鞘带回当下；当前旧剑用原软布束，伤损按本段状态'};if(r.path===get('PROP02').path)return {...r,purpose:'只取修物短刃/刀套形；塔外探路长绳和沙囊第2集已失，图中整套绳包不重生。腰侧剩短检修绳按当前首尾状态，不凭此图加新绳'};return r;}).map(require('./解析当前场景参考V1.cjs'));if(refs.some(r=>!r))throw Error(ep.id+'未知参考');
  const copies=[...new Map(refs.map(r=>[r.path,r])).values()].map(r=>{const bytes=fs.readFileSync(path.join(root,r.path)),file=path.basename(r.path),sha256=crypto.createHash('sha256').update(bytes).digest('hex');fs.writeFileSync(path.join(folder,file),bytes);return {file,source:r.path,purpose:r.purpose||r.id,sha256};});
  const lines=d.lines||[];
  const talk=lines.length?lines.map(l=>`${l[2]}—${l[3]}秒，${l[0]}=${l[1]}：“${l[4]}”；${l[5]}。${l[6]==='inner'?'此句是指定内心音轨，A/B都不为此句动嘴，不在同一句中突然改有声口型':(/仅门内/.test(l[5])||l[6]==='offscreen')?'此声来自已标明的画外/隔墙或回放方向，画中可见人物不替它动嘴；不新增配音者肉身':'该时段只有此人开口，听者自然反应，不跟读、不换声'}。`).join('\n'):'0—15秒没有对白或旁白，不生成空口型，喘息/用力闷哼不变成新增句子。';
  const subtitles=lines.length?lines.map(l=>`${l[2]}—${l[3]}秒：${l[4]}`).join('\n'):'0—15秒无对白/旁白字幕；指定人物出场介绍卡不受此限制。';
  const intro=d.intro||'本集主角已介绍，本段不新增或重复出场介绍；不因切镜而重刷姓名卡。';
  const bodyState=d.characterState||ep.characterState,bInventory=d.bInventory||ep.bInventory||'布结藏内襟或按动作取出',spatial=d.spatial||ep.spatial;
  const text=`【唯一执行目标】\n第一季《我活了300年，勇闯九层星渊塔》第${ep.id}集《${ep.title}》第${num}段《${d.name}》。固定15秒，9:16，集内${i*15}—${n*15}秒。只拍下面行动，不重演前情；无需记忆前段或另读剧本即可理解当前事实。\n\n【本集剧情及本段明确任务】\n${ep.context}\n本段：${d.story}\n\n【出镜人物说明：固定ID】\nA=周辰，成年约28岁外貌、C04脸，黑长发半束、古金冠、黑金分层华服及黑靴；${ep.gear||'旧铁剑/完整剑鞘随背带或实际持物状态。'}已活300年，会剑术术法和缓慢再生，但不全知、不无敌。B=苏晚，成年约25岁外貌、C03脸，黑长发半束、银花发饰/额饰/耳坠，银白冰蓝实色内层华服与纱袖、赤足，短刃实际位置按本段首尾与下列清单，${bInventory}；实际年龄未知不填数值。\n${bodyState}\n${d.cast||ep.cast||'本段画面只有A/B两位真人。'}\n只有明确列出的画面角色，不因台词提到沈砚小满就生成他们。脸、发型、服装纹样与体态优先用独立角色参考；配饰不当安全绳，装饰剑不能替换旧铁剑。再生慢、会痛、消耗本源，衣料破损不随肉体恢复。位置、朝向、握点与持物按下列首帧/动作/尾帧完整执行。\n\n【场景、时间、光线和空间关系】\n${d.scene}\n${spatial}\n\n【首帧精确状态】\n${d.start}\n${d.sceneCut?'这是明确场景切换，先前已完成的动作不重演；说明位置变化：'+d.sceneCut:''}\n\n【摄影机、景深与构图】\n${d.camera}\n摄影机运动有自然惯性，关键握点、落脚和道具接触保持中景深；背景巨构提供尺度，不用全程环绕或浅景深遮挡动作。场景运动与摄像机运动分别表达，不镜像替换手位。\n\n【0—15秒动作/运镜时序】\n${d.t.join('\n')}\n\n【逐句对白、声线、情绪与嘴型】\n${talk}\nA自然中低男声、克制有呼吸，B清亮自然不娇嗲；${ep.voiceInstructions||''}普通话，保持跨集一致，不在动作最用力时塞满长句。无额外歌词和旁白。\n\n【简体中文字幕原文与时码】\n${subtitles}\n白字细暗描边、每次一条，横向居中、高度约72%—82%，避开当前手脚及实际平台界面。指定原文必须准确，不用乱码示意。\n\n【人物出场介绍卡：画面可见】\n${intro}\n简洁有文气，按姓名/已确认身份、必要年龄、能力或悬念取舍；不虚构等级称号，不写性格衣着，不提前公开本源实验。两或三行淡底白字，画面上方空处约高度18%—32%，避脸和接触点，不朗读、不暂停动作。若生成模型不能准确给字或声音，按本段原文与时码在同段流程合成；不另建字幕文件夹，不声称配音已录制完成。\n\n【环境/动作声/配乐及入点】\n${d.sound}\n音乐是低密度原创情绪配乐，对白时降音乐与环境声；接触音必须对应实际动作。没有指定的钟声不得补响。\n\n【尾帧精确状态与本段闭环】\n${d.end}\n完整兑现本段结果，自然留可剪尾帧；不提前发生下一段成功、不自行淡黑或加片尾字卡。\n\n【就近实际高清参考及优先用途】\n${copies.map(r=>`${r.file}：${r.purpose}。`).join('\n')}\n实际上传所需图片后再生成，路径不代表模型能自动读文件。不编造工具参考张数和首尾帧控制能力；关键场景总图不是任意机位的精确首帧。原图真实尺寸与hash随来源记录，禁止小图拉伸冒称原生4K，独立单图优先于多格总板。\n\n【待补参考与质量边界】\n${d.missing}\n当前仅执行文字及现有基础参考，尚无实际视频、配音或动态验收。动作超密或握点错误时修订/增段并同步集长，禁止加速或瞬移硬凑15秒。\n\n【完整全剧通用正文】\n${common}\n\n【当前剧情优先锁及禁止项】\n${ep.locks}\n母版的后集事实只作不可提前发生的边界，不让模型提前生成冰封、隐藏层、现代穿越或其他未来形态。严格按本段人物、台词、伤势和道具状态执行，无换脸、无额外肢体、无穿模、无身份互换、无意外服装变化。只显示指定字幕/卡/画内必要文字，无水印Logo。`;
  if(/\bundefined\b|\bNaN\b|\[object Object\]/.test(text))throw Error(ep.id+'-'+n+'存在未展开字段');
  const file=path.join(folder,'视频提示词.md');fs.writeFileSync(file,`# 第${ep.id}集第${num}段｜${d.name}\n\n状态：执行文字与基础参考；待补项见代码块，未生成视频。复制唯一代码块的全部内容。\n\n\`\`\`text\n${text}\n\`\`\`\n`);
  let end=0;for(const t of d.t){const m=t.match(/^(\d+)—(\d+)秒/);if(!m||+m[1]!==end||+m[2]<=end)errors.push(n+'时间轴不连续');end=+m[2];}if(end!==15)errors.push(n+'未到15秒');
  let last=0;for(const l of lines){if(({A:'周辰',B:'苏晚',...(ep.voiceNames||{})})[l[0]]!==l[1]||l[2]<last||l[3]>15||l[3]<=l[2])errors.push(n+'台词身份/时码错误');last=l[3];const cps=l[4].replace(/[，。？！、：\s]/g,'').length/(l[3]-l[2]);if(cps>6)warnings.push(n+'对白需试录 '+cps.toFixed(1)+'字/秒');}
  for(const r of copies){const b=fs.readFileSync(path.join(folder,r.file));if(crypto.createHash('sha256').update(b).digest('hex')!==r.sha256)errors.push(n+'参考副本hash错误');}
  records.push({n,name:d.name,seconds:15,scene:d.scene,start:d.start,end:d.end,sceneCut:d.sceneCut||null,lines,missing:d.missing,prompt:path.relative(root,file).replaceAll('\\','/'),refs:copies});lastEnd=d.end;
 }
 const name=ep.cn+'集';fs.writeFileSync(path.join(out,`${name}执行清单V1.md`),`# 第${ep.id}集｜${ep.segments.length}段×15秒=${ep.segments.length*15}秒\n\n${ep.context}\n\n当前是执行文本及原图就近副本，缺图按各段列明，实际音视频未生成。\n\n|段|集内时码|执行文件|\n|---|---|---|\n`+ep.segments.map((d,i)=>`|${i+1}|${i*15}—${(i+1)*15}秒|[${d.name}](第${String(i+1).padStart(2,'0')}段_${d.name}/视频提示词.md)|`).join('\n')+`\n\n## 连续性与验收重点\n\n${ep.notes}\n`);
 const result={date:'2026-10-18',voiceNames:ep.voiceNames||{},seconds:ep.segments.length*15,segments:records,errors,warnings,actualVideoGenerated:false};fs.writeFileSync(path.join(out,'连续性与参考校核V1.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify({episode:ep.id,segments:records.length,seconds:result.seconds,copiedRefs:records.reduce((n,x)=>n+x.refs.length,0),errors,warnings}));if(errors.length)throw Error(errors.join(';'));return result;
};
