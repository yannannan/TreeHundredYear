const fs=require('fs'),path=require('path');
const catalogs=['维护生活首批原图清单V1.json','维护生活同碗重做补眠原图清单V1.json','首年同碗旧伤修正原图清单V2.json'];
const all=catalogs.flatMap(f=>JSON.parse(fs.readFileSync(path.join(__dirname,f),'utf8')));
const plans=[
 {id:'LIFE-Y1-MEAL',label:'首年坐式熄火焦锅',targets:['32-03'],phase:'0—4秒灶边',purpose:'仅第1年同原椅/灶/锅/碗匙与右掌左踝旧包，右手调节杆左手锅柄。未焦余糊另盛同碗，锅底黑焦层不吃；不把熄火照片当已尝食/嘴型。'},
 {id:'LIFE-Y1-BOWL-R2',label:'首年同碗冰前自嘲',targets:['32-03'],phase:'4—12秒已到锚前',purpose:'仅首年B右手同木匙/左手同素灰碗、右掌根与左踝原窄包，温米褐糊；A原锚全封闭眼/右腕无误包/左外袖同窄布尾。图中未让她实际尝食或说台词，按时轴先吞下再开口；先前沿实桥步行已显式省略，不凭空从灶跳到锚。'},
 {id:'LIFE-Y100',label:'百年摘叶两杯木样',targets:['32-08'],phase:'0—5秒第100年',purpose:'仅100年左手扶茎右手摘单叶/恰两素灰旧杯和旧城木样，原藻床/木台。此图优先锁两杯与木样器型，206年只添使用磨痕不换款；当前掌包已无、脚部藏裙不凭图验步态，不拿照片当五秒做完杯与木样。'},
 {id:'LIFE-Y206',label:'206年旧册短记',targets:['32-08'],phase:'7.5—10秒同年稍后',purpose:'仅206年原椅/回收纸积册、右短炭左压纸/原脸饰。纸上原句“想你，不耽误我嫌你睡得久”已经写好，此刻只添上方当日短记一笔；不用照片逼五秒内完整长句书写/练刀/起坐。两杯木样优先100年原图。'},
 {id:'LIFE-Y299-FAIL',label:'299年停支路后坐地哭气',targets:['32-08','32-09'],phase:'32-08末；32-09仅前次故障来源',purpose:'299年同脸衣/两手无旧药布，实际左手拭泪/右手搭膝，先安全停支路才坐地；旧环仍在桌面浅盘，水为停止后残水。只锁失败材料/开盖旧阀来源，不能从坐地隔空取环，不能据静态判真实循环安全。'},
 {id:'LIFE-Y299-GRIND',label:'299年同环最后平磨',targets:['32-09'],phase:'0—2秒稍后回台',purpose:'仅同一回收薄环贴平磨片/浅盘承屑、无药布双手与原纱袖接触。初步回收整形早于这一镜，当前仅磨最后余边；盘中不另复制旧环，照片不证明装回或通水。'},
 {id:'LIFE-Y299-SEALED',label:'同旧阀复装后',targets:['32-09'],phase:'2—5秒装配检查省略后',purpose:'仅同旧阀原检修盖复装、浅盘旧残水而无新增滴流的外观，环已在法兰内部不可见。原旁路渐开/循环真实回稳仍按动态检验，不用绿灯或静态冒充压力测试。'},
 {id:'LIFE-Y299-SLEEP',label:'299年回稳后原床补眠',targets:['32-09'],phase:'5—8秒同夜休息',purpose:'仅同C03脸发饰/原衣/灰床褥薄被的闭眼真实侧卧，两手枕边无首年药布；无男主同床。当前已回稳、工具归格后才休息，不在床上远控手环；3秒睡姿镜代表已省略数小时，不冒称真实休息只有3秒。'}
];
const entries=plans.map(p=>{const r=all.find(r=>r.id===p.id);if(!r||!r.purpose.startsWith('采用'))throw Error('缺采用生活原图 '+p.id);return {...r,...p,status:'adopted-static',qa:r.purpose,actualVideoGenerated:false};});
const result={date:'2026-10-18',scope:'维护生活有限静态；正式人物服饰母图不改，没有实际视频或配音',sourceCatalogs:catalogs,entries,targetSegments:[...new Set(entries.flatMap(r=>r.targets))],copiedReferencePlacements:entries.reduce((n,r)=>n+r.targets.length,0),removedHistoricalInjuryCopies:8};
fs.writeFileSync(path.join(__dirname,'维护生活静态采用V1.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({originals:all.length,adopted:entries.length,candidates:all.length-entries.length,targets:result.targetSegments,placements:result.copiedReferencePlacements,obsoleteInjuryCopies:8}));
