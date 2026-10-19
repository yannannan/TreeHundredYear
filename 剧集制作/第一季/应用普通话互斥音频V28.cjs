const fs=require('fs'),path=require('path'),d=__dirname,root=path.resolve(d,'../..'),read=f=>JSON.parse(fs.readFileSync(path.join(d,f),'utf8'));
const silence='本段0—15秒完全无可辨识人声、无台词、无旁白、无哼唱、无人声吟唱、无背景交谈、无口型说话、无任何语种的语言音频；只允许明确的环境与动作音效及低音量无歌词配乐。人物可见呼吸、疼痛表情和用力动作保持静音，不生成呼吸音/呻吟/抽泣或自动朗读任何文字。';
const overrides={
'01-02':'0—3秒短符非语音低鸣，无人物吸气音；3—7秒削软木一声与刀入皮套轻擦；7—11秒捡楔碰石、木楔卡轮与木轴渐停；11—15秒木框试稳轻响、衣料及清晨街口风声。配乐低密度，动作声与真实接触同步。',
'01-10':'裂石、绳张力、刀卡缝与衣料受力；落石撞声比滑落画面晚；末尾低弦骤收留裂响，无任何人声。',
'02-01':'断石、绳索松脱、衣料摩擦与低沉风声，无英雄爆音、无用力呼吸音。',
'03-03':'碎石、肩布撕裂、栏根受力，音乐减弱让布料与栏根接触声可闻，无闷哼或呼吸音。',
'05-04':'旧栏拖地、剑切纤维一声、远处铁销碎裂、短脚步和坐下衣料摩擦；配乐缓释但不大团圆。',
'07-05':'麻绳擦孔、结回扣轻绷、伤臂牵动衣料轻擦，刀道远处机械声不断，音乐低密度。',
'08-03':'鞘敲阶、踏板滑缩、绳柱摩擦、衣带绷；配乐克制，不生成E笑声或人物喘音。',
'10-04':'剑碰骨低实响、刃擦硬骨、砂滑/拖布、A肩衣摩擦，配乐收出接触声而非胜利旋律。',
'13-05':'大刃刮槽、木鞘受压吱裂、脚退与受力衣响，配乐压在窗口将失。',
'13-08':'木鞘断裂、H刃挣槽、滚地衣擦、边界刃止闷响，音乐短收不过早大胜。',
'14-03':'I落定金属重响、薄板断、剑刃实碰/受力衣响、柱抽源声，配乐压迫。',
'16-05':'旋钮小卡声、支路低电流/灯轻鸣、舱内微气流，原创配乐淡暖但不提前救援庆功。',
'17-03':'短刃入联锁/鞋足擦实地、A滚过衣摩/印退出、撤刀后门剪衣闷响。',
'17-09':'逐节地板铰合/最后阶断/一次弱符摩地、落地衣料受力声，过门由冷金属切入水轮/檐铃远声，配乐留空间反差。',
'19-11':'只有本段指定门钟一声、门外风/内远水轮声，低配乐悬而不煽情劝留。',
'21-01':'原栏断/砣摆绳响/实剑钩碰、布滚粗石/B衣料受力声，音乐紧但不替角色喊招式。',
'21-05':'旧剑放石/衣滚实石/受力衣响、旧螺位崩与空匣落，砣轮继续压迫。',
'21-06':'薄耳切断金属脆响/导索放落/偏井砣闷撞、灯链摇后静，音乐从危险松一息，无合唱。',
'21-11':'旧阶鞋足/过门远暖水轮声变冷星轨风、光盘短预警后星石实撞/碎屑落、衣料摩擦，配乐悬疑回起。',
'22-02':'环轨规律声/星石实掠与布焦轻噼、脚石声，配乐提速后不胜利。',
'22-05':'石擦断轨尖响/偏撞薄盖/金属压落/B受力衣响、A脚接近，音乐紧张但不用失忆音空。',
'23-09':'试石轻压/扶栏布声、身后阶实碎与尘风，音乐按艰难步速不快剪省路。',
'24-01':'两次细砂入槽/内外钟不同机械频率、窗外气流，原创配乐低未知，不满场钟铃。',
'26-01':'储备低鸣/小缝张声、B受力衣响，音乐停在险处，无人物吸气音。',
'26-07':'相位轻鸣由断续到连续、储能轮轴稳转，音乐首次展开一层，人物同步呼吸动作保持静音。',
'27-04':'布受力/脚上槛/扶臂衣摩轻响，末留环境气流和衣料声，配乐极低，无人物抽气或歌词。',
'27-09':'衣料接触、桥与风仍轻，低弦只一点温度，靠近与踝痛表情保持静音。',
'28-01':'沉重落刃→铁刃相擦→小石屑落地，A受力衣响；低鼓只一下，无喘息声。',
'28-06':'刃压石槽/旧剑低涩弯响/右脚落矮台，音乐不覆盖材料受力声。',
'32-08':'叶/杯沿磨声/炭记/一记短刃风/漏水被止，B哭泣表演保持静音，低旋律不掩机械失败。',
'32-09':'旁路水声回稳/睡眠静/终刻轻合/外界自然风归正，回B冰边只留环境气流，音乐渐入。'
};
const block=(body,re)=>{const m=body.match(re);if(!m)throw Error('段落缺块 '+re);return m[0];};
module.exports=function apply(options={}){
const plan=read('全季普通话声音互斥修订V28.json'),common=fs.readFileSync(path.join(d,'全剧通用提示词.md'),'utf8').match(/```text\s*([\s\S]*?)```/)[1].trim(),counts={A:0,B:0,C:0},rows=[];
for(let n=1;n<=32;n++){const ep=String(n).padStart(2,'0');if(options.episode&&ep!==String(options.episode).padStart(2,'0'))continue;const v=n===1?'V2':'V1',ledger=read('第'+ep+'集/执行包'+v+'/连续性与参考校核'+v+'.json');
for(const s of ledger.segments){const key=ep+'-'+String(s.n).padStart(2,'0'),pf=s.prompt||s.promptFile,file=path.join(root,pf);let body=fs.readFileSync(file,'utf8');if(body.includes(plan.oldCommon))body=body.replace(plan.oldCommon,common);else if(!body.includes(common))throw Error('母版缺/版本不明 '+key);
const lines=s.lines||[],inner=lines.filter(l=>l[6]==='inner'),spoken=lines.filter(l=>l[6]!=='inner'),mode=!lines.length?'A':spoken.length?'B':'C';counts[mode]++;
const voiceRe=/【(?:对白：人物、原句、秒数、情绪、嘴型|对白与配音：精确人物绑定|对白与配音逐句绑定|逐句对白、声线、情绪与嘴型|H3声音模式与逐句普通话执行V28)】[\s\S]*?(?=\n\n【)/;
let voice='【H3声音模式与逐句普通话执行V28】\n声音模式：'+mode+(mode==='A'?'｜无对白、无旁白':mode==='B'?'｜明确普通话对白':'｜仅普通话旁白')+'；只启用此模式。\n';
if(mode==='A')voice+=silence+'\n不发送任何人物声线、发声习惯或读字口型要求。';
else {voice+='Spoken language: Standard Mandarin Chinese (Putonghua, Mainland China). 只准确逐字朗读以下指定原文，严禁英语、其他外语、未知语种或伪语言；不翻译、不扩写、不朗读提示词，不补背景交谈、歌唱或未指定旁白。\n';const active=mode==='C'?inner:spoken;for(const l of active)voice+=(mode==='C'?'旁白者：':'说话者：')+l[0]+'='+l[1]+'；时码：'+l[2]+'—'+l[3]+'秒；准确原文：「'+l[4]+'」；情绪/表演：'+l[5]+'；停顿：句前后留自然停顿，仅在既定时窗完成，不抢说、拖尾或与下一句重叠。'+(mode==='C'?'画面人物全程不动嘴。':'此时仅'+l[1]+'按该句动嘴，非说话者保持闭口听者表演。')+'\n';voice+='只对列出的发声者匹配跨集声线；周辰为自然中低男声、苏晚清亮自然不娇嗲，其他角色沿已定声线，不自动让未发言角色开口。音乐与环境声不盖对白；未录制/听审前不声称配音或口型完成。';
if(inner.length&&mode==='B')voice+='\n【同段后期内心音轨规格：不交给H3生成人声】\n本段H3仍只执行模式B，0—'+spoken[0][2]+'秒没有H3人物语音；以下指定内心句按原时码独立普通话配音并后期混入，同段画面A/B均不为其动嘴。不是启用模式C，不得删句、改字、换为B代读或移动时码。\n'+inner.map(l=>'后期内心者：'+l[0]+'='+l[1]+'；时码：'+l[2]+'—'+l[3]+'秒；逐字原文：「'+l[4]+'」；表演：'+l[5]+'。').join('\n');}
body=body.replace(block(body,voiceRe),voice.trimEnd());
const soundRe=/【(?:声音与配乐入点|环境\/动作声\/配乐及入点|环境、动作声与音乐)】[\s\S]*?(?=\n\n【)/,oldSound=block(body,soundRe);
if(mode==='A'){const orig=plan.entries.find(e=>e.key===key);if(!orig)throw Error('未登记静音段 '+key);const first=overrides[key]||orig.sound.content.split(/\r?\n/)[0];if(/(?<!无)(?:用力闷哼|人声可闻|真实哭气|两人呼吸|急喘|短喘|痛吸|短吸气)/.test(first))throw Error('静音场景仍要求人声 '+key);body=body.replace(oldSound,oldSound.slice(0,oldSound.indexOf('】')+1)+'\n'+first+'\n只保留明确物件/环境音和低音量无歌词无吟唱配乐；接触声须对应实际动作，不伪造钟数。所有人物发声关闭，按模式A执行。');}
const subRe=/【(?:字幕：同一段完整规格|简体中文字幕原文与时码|简体中文字幕)】[\s\S]*?(?=\n\n【)/,oldSub=block(body,subRe),subNote='H3原始画面不自由生成文字；上述已指定对白/旁白字幕与介绍卡/画内文字，按本段原文和时码在同段后期准确合成。不另建字幕文件夹，未实际渲染逐字核对前不称字幕已完成。';
if(mode==='A')body=body.replace(oldSub,'【'+oldSub.match(/^【([^】]+)】/)[1]+'】\n0—15秒无对白/旁白字幕。H3输出干净画面，不生成字幕或任何文字。已指定的人物介绍卡/纸条等另按原文、时码、版式在同段后期合成，不朗读，不擅自取消原介绍；没有指定文字时全段无文字。');else if(!oldSub.includes(subNote))body=body.replace(oldSub,oldSub+'\n'+subNote);
fs.writeFileSync(file,body);rows.push({key,prompt:pf,mode,spokenLines:spoken.length,postInnerLines:inner.length,subtitleRendering:'same-segment-post',actualAudioGenerated:false});}}
if(!options.episode){let domains=0;for(const name of fs.readdirSync(path.join(root,'场景资产/第一季/九层星渊塔'))){if(!name.endsWith('场景与15秒建立提示词V2.md'))continue;const file=path.join(root,'场景资产/第一季/九层星渊塔',name),b=fs.readFileSync(file,'utf8');if(b.includes(plan.oldCommon))fs.writeFileSync(file,b.replace(plan.oldCommon,common));else if(!b.includes(common))throw Error('环境母版不明 '+name);domains++;}if(domains!==10)throw Error('应10域');fs.writeFileSync(path.join(d,'全季普通话声音模式清单V28.json'),JSON.stringify({date:'2026-10-19',commonVersion:'V2.0',segments:rows.length,modes:counts,establishingDomains:domains,rows,actualAudioGenerated:false,actualVideoGenerated:false},null,2)+'\n');}
const out={episode:options.episode||'all',segments:rows.length,modes:counts,actualAudioGenerated:false,actualVideoGenerated:false};console.log(JSON.stringify(out));return out;};
if(require.main===module)module.exports();
