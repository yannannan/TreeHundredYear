const fs=require('fs'),path=require('path');
const sharp=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const dir=__dirname,root=path.resolve(dir,'../../..');
const data=JSON.parse(fs.readFileSync(path.join(dir,'全塔制作数据V2.json'),'utf8').replace(/^\uFEFF/,''));
const commonFile=path.join(root,'剧集制作/第一季/全剧通用提示词.md');
const common=fs.readFileSync(commonFile,'utf8').match(/```text\s*([\s\S]*?)```/)[1].trim();
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function lines(text,x,y,size,color,max=17){let out='';for(let i=0;i<text.length;i+=max)out+=`<text x="${x}" y="${y+(i/max)*Math.round(size*1.5)}" font-size="${size}" fill="${color}">${esc(text.slice(i,i+max))}</text>`;return out;}
function svg(d){
 const W=3840,H=2160,c=d.color;
 let s=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M100 0H0V100" fill="none" stroke="#243746" stroke-width="1"/></pattern><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="${c}"/></marker></defs><style>text{font-family:Microsoft YaHei,sans-serif}</style><rect width="100%" height="100%" fill="#0e1822"/><rect x="50" y="230" width="3110" height="1670" rx="24" fill="url(#grid)" stroke="#354b5a" stroke-width="3"/><text x="64" y="105" font-size="64" font-weight="bold" fill="${c}">SC-L${d.id}｜${d.name} · 行动与因果布局 V2</text><text x="66" y="175" font-size="31" fill="#b9c8d2">第一季 第${d.eps}集　｜　方向：左侧入域 → 右侧阶段终点　｜　示意不等比，箭头含行动、调度及信息关系</text>`;
 if(d.id==='02')s+='<rect x="1640" y="400" width="100" height="1290" fill="#b8d4e0" opacity="0.13"/><path d="M550 470H1550V1720H550M1850 470H2830V1720H1850" stroke="#8aa8b9" stroke-width="12" fill="none" opacity="0.2"/>';
 if(d.id==='03')for(let i=0;i<6;i++)s+=`<path d="M100 ${650+i*180}Q750 ${370+i*150} 1550 ${670+i*140}T3100 ${620+i*165}" stroke="#c8ad8c" opacity="0.15" stroke-width="9" fill="none"/>`;
 if(['04','05'].includes(d.id))for(let i=0;i<7;i++)s+=`<path d="M${330+i*420} 330L${500+i*360} 1800" stroke="${c}" stroke-width="18" opacity="0.07"/>`;
 if(d.id==='06')for(let i=0;i<14;i++)s+=`<circle cx="${220+i*210}" cy="380" r="25" fill="#e9b260" opacity="0.35"/><path d="M${220+i*210} 290v65" stroke="#e9b260" opacity="0.3" stroke-width="3"/>`;
 if(d.id==='07')s+='<path d="M360 1700Q1600 300 2940 1700M390 1730Q1600 440 2910 1730" fill="none" stroke="#b4cad9" stroke-width="14" opacity="0.18"/><path d="M1450 380L1700 520L1550 680L1770 900" fill="none" stroke="#c8d1d9" stroke-width="35" opacity="0.13"/>';
 if(d.id==='08'){s+='<path d="M300 1180H3000" stroke="#8aa7b8" stroke-width="80" opacity="0.15"/>';for(let i=0;i<12;i++){let x=1300+(i%6)*140,y=330+Math.floor(i/6)*170;s+=`<rect x="${x}" y="${y}" width="95" height="125" rx="35" fill="#233644" stroke="${i<4?'#edb46b':'#9abacb'}" stroke-width="5"/><text x="${x+47}" y="${y+75}" text-anchor="middle" font-size="31" fill="#e3eaf0">${String(i+1).padStart(2,'0')}</text>`;}}
 if(d.id==='09')for(let i=0;i<9;i++)s+=`<ellipse cx="1800" cy="440" rx="${290+i*55}" ry="${85+i*19}" fill="none" stroke="#d6ad6d" stroke-width="5" opacity="0.23"/>`;
 if(d.id==='10')s+='<path d="M1800 300C1300 500 2450 600 1800 1000S2300 1700 1700 1830" stroke="#a4dbe3" stroke-width="75" fill="none" opacity="0.08"/>';
 const lookup=Object.fromEntries(d.nodes.map(n=>[n[0],n]));
 d.routes.forEach(([a,b,label],i)=>{const p=lookup[a],q=lookup[b];let mx=(p[2]+q[2])/2,my=(p[3]+q[3])/2,dy=Math.abs(p[3]-q[3])<150?-170:(i%2?1:-1)*65;
 let route=`M${p[2]} ${p[3]}Q${mx} ${my+dy} ${q[2]} ${q[3]}`;
 if(d.id==='08'&&a==='A'&&b==='G'){route=`M480 1247V1830H3060V700H2910`;mx=1800;my=1830;dy=0;}
 s+=`<path d="${route}" fill="none" stroke="${c}" stroke-width="7" opacity="0.8" marker-end="url(#arrow)" ${d.id==='05'&&b==='E'?'stroke-dasharray="20 15"':''}/><rect x="${mx-185}" y="${my+dy-50}" width="370" height="90" rx="12" fill="#101d29" opacity="0.96"/>`;s+=lines(label,mx-165,my+dy-12,24,'#d3e0e8',14);});
 for(const [id,label,x,y] of d.nodes){s+=`<rect x="${x-175}" y="${y-87}" width="350" height="174" rx="20" fill="#1b2d3b" stroke="${c}" stroke-width="3"/><text x="${x-150}" y="${y-44}" font-size="30" font-weight="bold" fill="${c}">${id}</text>`;s+=lines(label,x-150,y+4,29,'#edf2f5',10);}
 s+='<rect x="3220" y="230" width="560" height="1670" rx="24" fill="#182735" stroke="#3f5462" stroke-width="3"/>';
 for(const [title,body,y] of [['危险与不可绕过',d.danger,325],['连续性锁',d.continuity,850],['镜头接触重点',d.detail,1370]]){s+=`<text x="3250" y="${y}" font-size="34" font-weight="bold" fill="${c}">${title}</text>`;s+=lines(body,3250,y+65,27,'#d2dce2',16);}
 s+='<text x="70" y="1995" font-size="31" fill="#d2dce2">蓝色节点是功能位置，不代表可任意穿越；实线亦可能是调度关系，须以箭头文字和剧本判断。</text><text x="70" y="2055" font-size="29" fill="#a8b7c3">制作检查：演员走位、兵器半径、距离、绳长与承重仍需分镜实测；本图不提供工程安全数值。</text><text x="70" y="2115" font-size="29" fill="#a8b7c3">独立建立图负责奇观与材质；本图负责行动因果。两者不一致时按剧本与本图修订环境，禁止静默改剧情。</text></svg>';
 return s;
}
async function main(){
 let master='# 九层星渊塔｜全塔场景制作执行总册V2\n\n2026-10-17。承接32集V3，不重写已闭环剧情。此为场景制作作品，唯一交接仍在文档/项目总控与交接.md。新增各域4K布局为拓扑示意；建立图须另行生成、检查，不能由本脚本凭空算完成。\n\n第一层沿用[独立建立图](SC-L01_逆重天阶建立镜头V1.png)及[4K行动布局](SC-L01-LAYOUT01_行动布局4K_V1.png)。外壳九重、内部真实相位小世界、隐藏层在加密塔芯，不能把沙海塞进建筑普通房间。\n\n';
 for(const d of data){
 const stem=`SC-L${d.id}_${d.name}`,map=`SC-L${d.id}-LAYOUT02_行动布局V2`,doc=stem+'_场景与15秒建立提示词V2.md';
 const asset=[4,3,2].map(v=>stem+'_独立建立镜头V'+v+'.png').find(p=>fs.existsSync(path.join(dir,p)))||stem+'_独立建立镜头V2.png';
 const raw=svg(d);fs.writeFileSync(path.join(dir,map+'.svg'),raw);await sharp(Buffer.from(raw)).png().toFile(path.join(dir,map+'_4K.png'));await sharp(Buffer.from(raw)).resize(1600).jpeg({quality:90}).toFile(path.join(dir,map+'_预览.jpg'));
 const prompt=common+'\n\n【本段唯一任务与范围】\n第一季第'+d.eps+'集的'+d.name+'空间建立候选镜头，15秒，9:16原生构图。是独立场景镜头设计，不把它擅自插进每集固定位置，不自动增加集时长；正式进入某集时替换相应建立镜头预算。全段无人类角色、无台词、无旁白、无字幕；本段只建立可行动空间，不演通关。\n\n【场景与光线】\n'+d.material+'\n'+d.spectacle+'\n入口到阶段终点依照布局，不能通过镜头运动增删路线。\n\n【本镜头动作与摄影机】\n'+d.timeline.join('\n')+'\n单次连续运镜，无凭空跳机位；慢速24/35mm电影摄影，近景实体纹理、中景行动对象和远景巨构都可辨，允许中景深而非强行全部浅景深。环境运动遵守本域规则；不加入剧本外事件或人。\n\n【声音】\n'+d.sound+'\n全段声音仅取本层环境基底与上述可见机关的合理音效，不生成文中需要人物的呼吸/台词。0—4秒近物质感，4—10秒加入空间低鸣，10—15秒保留具体线索音。音乐为低密度原创氛围，无人声，无商业歌曲。\n\n【语言与字幕】\n无对白、无旁白，因此0—15秒明确无字幕；画面无标牌文字、Logo或乱码。后续有对白镜头必须在自身提示词写简中原句与时码，不把本段无字幕规则套到整部剧。\n\n【空间、数量及连续性约束】\n'+d.danger+'\n'+d.continuity+'\n本段不表现后续战损、角色或通关事实，后续状态只作为禁提前剧透的边界。\n\n【首尾接镜】\n起点、移动和终点严格按时间分镜；尾帧保留可接角色入场的实体落脚区，不能结束成全白闪光。\n\n【参考】\n本文件同目录的'+stem+'_独立建立镜头V2.png为美术参考；'+map+'_4K.png为行动拓扑参考。真实环境图检查记录需与本段一起阅读；未通过数量/路线验收的环境图只能作材质参考，禁止直接驱动对应动作。\n\n【负面约束补充】\n不要卡通、游戏CG、塑料材质、过曝、随机镜头抖动、无原因重力变化、地图线路变形、额外出口、额外守卫、额外生命舱、混入其他层景观。';
 const text=`# ${d.name}｜场景详设与15秒建立提示词V2\n\n覆盖第${d.eps}集；来源为32集V3。不是全层所有逐段提示词已完成。\n\n## 震撼构图与物理空间\n\n${d.spectacle}\n\n${d.material}\n\n## 行动布局\n\n[4K布局PNG](${map}_4K.png) · [可编辑SVG](${map}.svg)\n\n`+d.nodes.map(n=>'- '+n[0]+'：'+n[1]).join('\n')+'\n\n'+d.routes.map(r=>'- '+r[0]+' → '+r[1]+'：'+r[2]).join('\n')+`\n\n## 危险、代价与连续性\n\n${d.danger}\n\n${d.continuity}\n\n## 必需接触近景、反打与表演空间\n\n${d.detail}\n\n${d.camera}\n\n${d.shots.map((x,i)=>(i+1)+'. '+x).join('\n')}\n\n## 声音设计\n\n${d.sound}\n\n## 可独立复制的15秒场景建立提示词\n\n以下已完整嵌入全剧通用正文，无“同上”。本段无角色无台词，因此明确无字幕；有对白段仍须自己的简中字幕原句与时码。此为待本地试生成的文本，未声称音视频已生成。\n\n\`\`\`text\n${prompt}\n\`\`\`\n\n## 制作验收\n\n先看路线/数量，再看奇观：本层建立图与布局不一致时按剧本修图，不能改写因果。4K图是原生矢量渲染示意，非真人电影画面或真实尺寸测绘。支持15秒档位、音画及字幕能力须本地MinMaxH3实测。\n`;
 fs.writeFileSync(path.join(dir,doc),text.replaceAll(stem+'_独立建立镜头V2.png',asset));master+=`## ${d.id}｜${d.name} · 第${d.eps}集\n\n${d.spectacle}\n\n[当前独立环境源图](${asset}) · [实际图像提示词与检查](${asset.replace('.png','_生成提示词与检查.md')})\n\n[详细空间/动作/声音与完整15秒提示词](${doc}) · [4K行动图](${map}_4K.png) · [SVG](${map}.svg)\n\n`;
 }
 const first=common+'\n\n【本段】第一层逆重天阶，适用03—05集的15秒场景建立候选，9:16原生构图；无人物、无对白、无旁白，0—15秒无字幕。建立镜头替换相应集内预算，不额外加时。\n【场景】竖向深渊、旧铜环穿两桥区、青灰断阶、锈链、远处局部逆流瀑布；近梁、中部缺口、远窄沿真锚与出口可分辨，不能画连续桥绕过缺口。\n【0—4秒】24mm从近处断梁与旧链完整环缓慢前推，断口留在下半幅。\n【4—10秒】连续抬摇揭出远窄沿和穿桥巨环，雾与砂保持当地重力方向，不全画面任意翻转。\n【10—15秒】停在两区可见差异的瀑流与真锚方位，留下一段角色测重力的起点；不演完整摆渡、不出现无因巨怪。\n【声音】0—4秒石粒与链轻响；4—10秒加入深渊风压和巨环低鸣；10—15秒留两处水流声的远近差。原创低密度氛围，无人声商业歌曲，音效不抢后续对白。\n【参考】SC-L01_逆重天阶建立镜头V1.png只定材质与尺度；SC-L01-LAYOUT01_行动布局4K_V1.png确定断梁、旧链整环、窄沿、真锚、G1/G2与出口，远图中的额外建筑不形成捷径。\n【限制】15秒一个连续慢镜，真实摄影惯性、中景深；不要多出口、完整跨桥、额外守关怪兽、随机倒转、文字Logo水印或塑料CG。场景源图941×1672并非2K/4K母版，4K布局为拓扑示意；未生成视频，不把文本当成音视频已完成。';
 fs.writeFileSync(path.join(dir,'SC-L01_逆重天阶_场景与15秒建立提示词V2.md'),'# 逆重天阶｜15秒建立镜头完整提示词V2\n\n完整嵌入母版V1.5。行动详设沿用第一层4K布局及03—05集V3。本段是场景建立文本，不替代双人行动逐段包。\n\n```text\n'+first+'\n```\n');
 master+='## 第一层完整提示词\n\n[逆重天阶15秒建立提示词](SC-L01_逆重天阶_场景与15秒建立提示词V2.md)，与第二至隐藏层共10份。\n\n## 后续执行边界\n\n本轮补全十域中其余九域的独立空间详设、4K拓扑和场景建立提示词。第一层沿用已有实图与布局。逐集逐段角色表演、配音、对口型、逐句字幕和动作试片仍需逐集制作；环境建立提示词不抵整季全部执行包。\n';fs.writeFileSync(path.join(dir,'九层星渊塔_全塔场景制作执行总册V2.md'),master);
 console.log(JSON.stringify({domains:data.length,layouts:data.length,prompts:data.length,canvas:[3840,2160]}));
}
main().catch(e=>{console.error(e);process.exit(1)});
