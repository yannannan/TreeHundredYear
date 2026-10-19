const fs=require('fs'),path=require('path');
const dir=__dirname,root=path.resolve(dir,'../..'),masterFile=path.join(dir,'全剧通用提示词.md');
let master=fs.readFileSync(masterFile,'utf8');
const commonOf=s=>s.match(/```text\s*([\s\S]*?)```/)[1].trim(),oldCommon=commonOf(master);
const art=`【仙侠科幻美术修订：2026-10-18优先执行】
用户最新要求：场景和图片素材不要显得那么破旧，不模仿《逃离世界》。本项目依据自身剧情与已定空间独立设计，不以《逃离世界》的画面、构图、资产、提示词或项目资料作为模板。上古星际文明以宏大尺度、完整主体、精密工艺和神秘机制呈现，有年代感而非全面废墟；此条覆盖此前“古旧基底稍微提升”的尺度。剧情称“残舰”“遗迹”“旧器”，只指来历、用途或明确损坏，不要求所有表面统一锈蚀、碎裂、剥落。
材质以大面完整的石墨合金、细磨深灰石、低反射暗铜嵌线、精细星纹和清楚接缝为主，少量岁月包浆留在缝隙或局部。明显减少全面橙锈、剥漆、密集虫蚀孔、尖锐碎料、无意义废物和泥污；石阶与通行地面保持可读，不将每个场景画成垃圾堆、失修工厂或废土。光线有方向、黑位有层次、远近尺度清楚；青黑、灰银、暗铜等低饱和主色配少量必要能量色及暖灯，不增花哨彩光、鲜黄金饰、华丽天宫或洁白无菌新设施。
非剧情破损收敛（2026-10-19）：正常使用的地坪、台阶、栏杆、立柱、门框与机关外壳以完整、细磨、接合严密为默认状态；台阶保留正常分级，板缝表现为规整施工接缝，不画成随机深裂缝。删除无剧情依据的密集缺角、坑洞、起翘铺石、崩边栏杆、碎渣堆、墙面黑污与普遍锈斑，尤其避免前景大面积粗糙破石主导视觉。自然山岩可保留自然纹理；正在发生的落石、真实断口、危险缺口和已定事故战损按本段原位置保留。年代感用细刻纹、深浅层次、厚实材质及少量缝内包浆表现，建筑仍显工艺精良、可正常运行；低饱和、完整和精致不靠把画面改成白金仙宫或多彩霓虹实现。
必须保留本段已经发生且有剧情用途的局部故障：指定断轨、松板、卡扣、裂印、倒塌通道等，锁定位置、数量、范围与先后。大型残舰仍是搁浅的古舰，低拱仍由原两片检修板搭成而非新造隧道，后续毁拱只毁原拱；不能为美化而修复故障、重生道具、改变路线，也不能扩大为整座建筑全毁。
正式人物与服饰图片按用户认可版保留，不为本次场景修订重绘脸、身形、发冠或衣款。逐段实际伤势和服装局部损坏仍按剧情连续，不能顺便抹伤或全身加脏破；不添加无依据的脸伤、苍老或伤痕。必要人物同框只修环境，原角色身份、动作、道具和已发生代价不改。
每段同时提供新旧参考时，标注“精工克制R2”的图负责已注明的材质与环境质感；旧图只取明确的动作、接触、地形和构图，不复制其大面积锈破。未修订图片必须列待办，不能因文字已同步就声称全场景已改完；静图也不证明动态、承力、净空、字幕或成片品质。`;
const artPattern=/【仙侠科幻美术修订：2026-10-18优先执行】[\s\S]*?(?=【震撼场景的拍法】)/;
if(!artPattern.test(master))throw Error('无法定位现有美术基线');
master=master.replace(artPattern,art+'\n\n').replace(/制作母版 V1\.[89]/,'制作母版 V1.9');
master=master.replace('每段视频≤15秒、可短于15秒','每段固定15秒').replace('每个≤15秒镜头段','每个固定15秒镜头段');
master=master.replace('单次生成视频**最长15秒**，长度必须是本地工作流实际支持的档位；单段分镜覆盖0—T且动作可完成。','本项目单次按**固定15秒**编写，分镜完整覆盖0—15秒且动作可完成；实际生成能力以工作流试片验证。');
const newCommon=commonOf(master),updates=[];let segments=0;
for(let n=1;n<=32;n++){
 const id=String(n).padStart(2,'0'),v=n===1?'V2':'V1',ledger=JSON.parse(fs.readFileSync(path.join(dir,`第${id}集/执行包${v}/连续性与参考校核${v}.json`),'utf8'));
 for(const s of ledger.segments){const file=path.join(root,s.prompt||s.promptFile),body=fs.readFileSync(file,'utf8');segments++;if(body.includes(newCommon))continue;if(!body.includes(oldCommon))throw Error('缺完整旧母版，停止：'+file);updates.push({file,body:body.replace(oldCommon,newCommon),kind:'segment'});}
}
const note='> 【当前美术基线V2：2026-10-18】主体完整、材质精致、有年代感但不过度破旧；独立设计，不模仿《逃离世界》。仅保留剧情必要的局部故障，保持低饱和及既定行动布局，正式人物服饰不改。旧图未修处仅取地形/动作，不复制全面锈破；实际改图进度见唯一交接，不将文字更新算作全量图片完成。\n\n';
let sceneDocuments=0,establishing=0;
function walk(folder){for(const e of fs.readdirSync(folder,{withFileTypes:true})){const file=path.join(folder,e.name);if(e.isDirectory()){walk(file);continue;}if(!e.name.endsWith('.md')||/生成记录|生成提示词与检查|普查|回执|修订标准|检查结果|验收/.test(e.name))continue;let body=fs.readFileSync(file,'utf8'),before=body;
 if(body.includes(oldCommon)){body=body.replaceAll(oldCommon,newCommon);establishing++;}
 body=body.replace(artPattern,art+'\n\n');
 body=body.replace(/^> 【全场景轻度提质口径：2026-10-18】[^\r\n]*\r?\n\r?\n/,'');
 if(!body.startsWith(note))body=note+body;
 if(body!==before){updates.push({file,body,kind:'scene'});sceneDocuments++;}
}}walk(path.join(root,'场景资产/第一季'));
if(segments!==313)throw Error('完整执行包段数不符');
fs.writeFileSync(masterFile,master);for(const u of updates)fs.writeFileSync(u.file,u.body);
const result={date:'2026-10-18',commonVersion:'V1.9',totalSegments:segments,updatedPromptFiles:updates.filter(u=>u.kind==='segment').length,updatedOperationalSceneDocuments:sceneDocuments,establishingPromptsUpdated:establishing,formalCharacterCostumeImagesChanged:0,allSceneImagesRevised:false,actualVideoGenerated:false,files:updates.map(u=>path.relative(root,u.file).replaceAll('\\','/'))};
fs.writeFileSync(path.join(dir,'精工克制美术文字同步V2.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,files:undefined}));
