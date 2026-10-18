const fs=require('fs'),path=require('path');
const raw=JSON.parse(fs.readFileSync(path.join(__dirname,'沙海追猎关键帧原图清单V1.json'),'utf8'));
const specs=[
 ['SAND-BREACH',['09-01'],'沙鳐完整跃砂/有机腹孔','5—10秒跃起阶段','只锁同一沙鳐全体/两翼尾末/腹孔与单蚀日残舰尺度；提示吸残法微光未清，不能据本图说吸入方向已正确，不当首帧已跃起/退砂或击杀。'],
 ['SAND-BLOCK-R2',['09-01'],'整旧剑偏挡翼骨/左旧包空鞘','10—13秒接触前半','A右手唯一完整旧铁剑贴同兽翼骨、左握原空硬鞘/左前臂旧包，右腕无包、双靴实地。只本次首次格挡，不提前10集右肩新裂/单钝点或28集断剑；图不证明完整擦滑受力。'],
 ['SAND-SHOULDER',['09-01'],'偏挡后右肩背压同舰肋','13—15秒已撞肋末态','同A右肩背真实贴厚舰肋/衣料压皱/痛表情，右整剑已离翼斜降、左空鞘/左旧包/双靴实地。只同段末态，右肩衣压皱非10集板边新裂，兽未死且未完全退砂；不当已经恢复。'],
 ['SAND-ARCH',['10-05','10-06','10-07'],'低拱搭边/唯一短绳原地钉','05末成形；06/07未毁时','只本阶段低拱原薄板搭边/厚肋和唯一短绳接原地钉，入口至出口实地可爬路线；静图不证明展开后精确板数/真人净空/抗风。不能放到09或10-03提前成功，也不套到10-09毁后。'],
 ['SAND-LURE',['10-06'],'远松板单缕诱饵/兽鼻前体撞板','5—10秒远处冲击','远松板与其砂脊受唯一同兽鼻前体冲击，少量淡残光、近端只低拱边钉。只一次远诱饵效果，非三人路径低拱被毁；能量已由A一次发出即收，不凭静图证明能量量值/完整板滑落。'],
 ['SAND-CRAWL-R2',['10-07'],'A前G中B后同低拱途中','0—5秒内三人途中局部','只三人同脸衣/前后顺序与拱内接触：A前双掌、G中双手撑地/腹前唯一匣、B后撑地/低位裤料。A脸无新增伤/左旧包、肩新裂不放左侧；B双手双踝无后期白包。腿/托裤料有遮挡，不能说伤腿负重或准确杠杆表针已验。不是三人已全出拱。'],
 ['SAND-COLLAPSE',['10-09'],'同低拱被回扑压塌/唯一绳原钉','10—15秒后段舱外插入结果','原低拱顶凹塌/搭边松开、砂填爬道，唯一同兽掠过、原钉/唯一短绳/厚肋/远门梯不换。只舱外毁损结果，接已开原门的视线后插入再回门内，不把整图硬贴到旧小窗或当三人仍在拱内；非10-06远诱饵板。']
];
const entries=specs.map(([id,targets,label,phase,purpose])=>{const r=raw.find(x=>x.id===id);if(!r||!r.purpose.startsWith('采用'))throw Error('未视检采用 '+id);return {...r,qa:r.purpose,purpose,targets,label,phase,status:'adopted-static',actualVideoGenerated:false};});
const result={date:'2026-10-18',scope:'第三层09/10有限静态，非真实运动/受力/字幕和音视频验收',sourceCatalog:'沙海追猎关键帧原图清单V1.json',sourceJobs:'沙海追猎关键帧生成归档V1.json',entries,targets:[...new Set(entries.flatMap(x=>x.targets))],referenceCopyPlacements:entries.reduce((n,r)=>n+r.targets.length,0)};
fs.writeFileSync(path.join(__dirname,'沙海追猎静态采用V1.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({raw:raw.length,adopted:entries.length,candidates:raw.length-entries.length,segments:result.targets.length,copies:result.referenceCopyPlacements}));
