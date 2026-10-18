const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root = path.resolve(__dirname, '../..');
const dir = '场景资产/第一季/九层星渊塔';
const rows = [
  ['01','逆重天阶','03—05','SC-L01_逆重天阶建立镜头V1_古旧提质R1.png','SC-L01-LAYOUT01_行动布局4K_V1.png','局部重力、侧墙落足、梁链真锚与悬空渡越'],
  ['02','双影浮城','06—08','SC-L02_双影浮城_独立建立镜头V2_古旧提质R1.png','SC-L02-LAYOUT02_行动布局V2_4K.png','浮城实墙、假影诱导与真实刀道'],
  ['03','星蚀沙海','09—11','SC-L03_星蚀沙海_独立建立镜头V2_古旧提质R1.png','SC-L03-LAYOUT02_行动布局V2_4K.png','日蚀沙海、巨型沉舰与沙鳐追猎'],
  ['04','无声律庭','12—13','SC-L04_无声律庭_独立建立镜头V2_古旧提质R1.png','SC-L04-LAYOUT02_行动布局V2_4K.png','巨柱链庭、誓链牵引、律使巡刀与近身脱困'],
  ['05','残舰灵墟','14—17','SC-L05_残舰灵墟_独立建立镜头V2_古旧提质R1.png','SC-L05-LAYOUT02_行动布局V2_4K.png','竖向舰腹、铁卫断桥、残臂横扫与双源过载'],
  ['06','轮回梦市','18—21','SC-L06_轮回梦市_独立建立镜头V2_古旧提质R1.png','SC-L06-LAYOUT02_行动布局V2_4K.png','桥市灯群、记忆交易与桥腹联锁解困'],
  ['07','天机命盘','22—24','SC-L07_天机命盘_古旧基底适度提质V4.png','SC-L07-LAYOUT02_行动布局V2_4K.png','巨大命盘、双路调度、移桥悬臂与失败后的再渡'],
  ['08','众生悬桥','25—27','SC-L08_众生悬桥_独立建立镜头V4_古旧提质R1.png','SC-L08-LAYOUT02_行动布局V2_4K.png','深渊悬桥、十二舱四急八缓与有限承载救援'],
  ['09','终焉授印','28—29','SC-L09_终焉授印_独立建立镜头V5_古旧提质R1.png','SC-L09-LAYOUT02_行动布局V2_4K.png','九环单卫、镜胸反射与双封实体破坏'],
  ['10','隐藏时空枢纽','30—32','SC-L10_隐藏时空枢纽_独立建立镜头V3_古旧提质R1.png','SC-L10-LAYOUT02_行动布局V2_4K.png','时空光流、冰锚、维护居所与最终裂隙']
];
(async()=>{
  const entries=[];
  for (const [layer,name,episodes,file,layout,design] of rows) {
    const relative=dir+'/'+file;
    const bytes=fs.readFileSync(path.join(root,relative));
    const metadata=await sharp(bytes).metadata();
    const prompt=dir+`/SC-L${layer}_${name}_场景与15秒建立提示词V2.md`;
    if(!fs.existsSync(path.join(root,prompt)) || !fs.existsSync(path.join(root,dir,layout))) throw Error('缺少布局或提示词：'+name);
    entries.push({layer,name,episodes,path:relative,width:metadata.width,height:metadata.height,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),layout:dir+'/'+layout,prompt,design,actualVideoGenerated:false});
  }
  const audit={date:'2026-10-18',scope:'核当前采用场景原图、尺寸、SHA、布局和建立提示词存在；不证明动作或动态特效完成',towerLayers:9,hiddenLayers:1,entries,actualVideoGenerated:false,actualAudioGenerated:false,errors:[]};
  fs.writeFileSync(path.join(__dirname,'九层场景实际素材核对V1.json'),JSON.stringify(audit,null,2)+'\n');
  const link=p=>'../../'+p;
  const md=['# 九层塔震撼场景、动作与特效｜实际制作核对 V1','','2026-10-18。制作核对记录，不另立项目交接。用户连续询问“九层塔各种震撼场景 决斗 等 特效有做吗”“震撼场景素材也做了吗”。本次重新核实磁盘中的当前采用源图，不将历史候选或逐段复制件算成新场景。','','**已有九层各一张独立环境建立原图，另有隐藏第十层一张，共10域；每域均有行动布局与完整15秒环境建立提示词。** 原生尺寸见表，写实图不是原生4K；3840×2160布局是示意图。43张场景提质是此前环境/状态/同框修订批次，不能解释为43场已拍完的震撼战斗。','','| 层/集数 | 已有场景原图与实际尺寸 | 已有布局和提示词 | 该层场面与动作设计 |','|---|---|---|---|',...entries.map(e=>`| ${e.layer} ${e.name}／${e.episodes}集 | [当前原图](${link(e.path)}) ${e.width}×${e.height} | [布局](${link(e.layout)}) · [15秒建立](${link(e.prompt)}) | ${e.design} |`),'','## 制作边界与待办','','- 已有：环境总景、行动拓扑、部分近端机关和接触状态参考；全季32集313段固定15秒执行文本中安排对白、运镜、声音与特效表现。文本和静帧不证明已经生成动态视频。','- 尚未齐：全部决斗的起势/接触/冲击/收势参考及反打，巨兽和铁卫与主角在同机位的连续尺度、光效与受力对应；具体逐段缺项仍见[制作参考缺项清单](制作参考缺项清单V1.md)。','- 尚未制作：实际H3打斗视频、动态法术/重力/沙尘/镜面反射效果、独立可合成特效序列及配音音乐成品；未做运动、口型、字幕与跨段拼接验收。','- 每层危险不同，不强行改为九场相同的决斗。第六层交易解困、第七八层移桥救援及第十层选择/守候仍按现有剧情。','','## 下一步优先级','','先补第九层镜胸反射到双封破坏的战斗关键状态，再补第三层沙鳐追猎、第五层铁卫断桥；每项遵循观察/起势→实体接触→冲击结果→下一段起点，锁定正式人物服饰、敌人数量与原道具损毁。依据现有逐段文本逐项接入，不把环境远景反复当作战斗已完成。继续古旧厚重、低饱和、适度提质，不重新设计人物服饰。','','本表图片均由实际文件读取元数据与SHA，检查结果见[机器可读核对](九层场景实际素材核对V1.json)；美术历史视检见[全场景改进记录](../../场景资产/第一季/九层星渊塔/全场景美术普查与改进V1.md)。',''];
  fs.writeFileSync(path.join(__dirname,'九层场面与动作特效制作核对V1.md'),md.join('\n'));
  console.log(JSON.stringify({domains:entries.length,errors:[],sizes:entries.map(e=>[e.layer,e.width,e.height])}));
})().catch(e=>{console.error(e);process.exitCode=1;});
