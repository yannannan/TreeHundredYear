const fs=require('fs'),path=require('path'),crypto=require('crypto');const dir=__dirname,root=path.resolve(dir,'../..');
const data=JSON.parse(fs.readFileSync(path.join(dir,'第一集15秒执行数据V2.json'),'utf8').replace(/^\uFEFF/,''));
const common=fs.readFileSync(path.join(dir,'全剧通用提示词.md'),'utf8').match(/```text\s*([\s\S]*?)```/)[1].trim();
const catalog=JSON.parse(fs.readFileSync(path.join(dir,'第一集真实参考来源V2.json'),'utf8').replace(/^\uFEFF/,''));
const get=id=>{const x=catalog.find(x=>x.id===id);if(!x||!fs.existsSync(path.join(root,x.path)))throw Error('Missing actual reference '+id);return x;};
const ep=path.join(dir,'第01集','执行包V2');fs.mkdirSync(ep,{recursive:true});
const priorFile=path.join(ep,'连续性与参考校核V2.json');const prior=fs.existsSync(priorFile)?JSON.parse(fs.readFileSync(priorFile,'utf8')).segments:[];
let index='# 第一集｜10段×15秒完整闭环执行包V2\n\n当前执行入口；8段V1为历史候选，不与V2混剪。为避免15秒塞过多动作，首集调整为150秒，街口45/铺内30/山路30/断阶45，剧情事件和台词未删。每段均有真实角色、场景及对应道具参考就近副本，完整输入为本段唯一代码块。当前未生成视频、未做口型/动态/字幕验收；源图约1.57MP，不称原生4K。\n\n| 段 | 集内时码 | 任务 | 文件 |\n| --- | --- | --- | --- |\n';
const ledger=[];
for(const d of data){const num=String(d.n).padStart(2,'0'),seg=path.join(ep,'第'+num+'段_'+d.name);fs.mkdirSync(seg,{recursive:true});
const roleId=d.role==='周辰'?'ZC':'SW';const refs=[get(roleId+'-FULL'),get(roleId+'-HEAD'),get(d.sceneId)];
if(d.n<=3)refs.push(get('CAST01'),get('CAST02'),get('PROP02'));
else if(d.n<=5)refs.push(get('PROP01'),get('PROP02'));
else if(d.n<=7)refs.push(get('PROP03'));
else refs.push(get('PROP02'));
if(d.n===7)refs.push(get('TOWER'));
const keyId={1:'KEY-STREET',4:'KEY-SHOP',6:'KEY-MOUNTAIN',10:'KEY-CLIFF'}[d.n];const key=catalog.find(r=>r.id===keyId);if(key)refs.unshift(key);
for(const r of prior.find(x=>x.n===d.n)?.refs||[]){if(refs.some(n=>path.basename(n.path)===r.file))continue;const p=path.join(seg,r.file);if(path.basename(r.file)!==r.file)throw Error('invalid prior reference');if(fs.existsSync(p)&&crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')===r.sha256.toLowerCase())fs.unlinkSync(p);}
for(const r of refs){const dest=path.join(seg,path.basename(r.path));fs.copyFileSync(path.join(root,r.path),dest);if(crypto.createHash('sha256').update(fs.readFileSync(dest)).digest('hex')!==r.sha256.toLowerCase())throw Error('Copy hash mismatch '+dest);}
const lead=d.role==='周辰'?'人物A=周辰，成年约28岁外观、C04脸，黑长发半束与古金冠，黑金分层华服和黑靴；人物B苏晚本段不在场。旧铁剑与完整剑鞘、腰侧古符在本集都存在，未丢符、未断鞘、未断剑。':'人物B=苏晚，成年约25岁外观、C03脸，黑长发半束、银花发饰/额饰/耳坠，银白冰蓝实色内层华服与纱袖，赤足；人物A周辰本段不在场。右腰为修物短刃套，绳/布结状态按首尾锁。';
const cast=d.n<=3?'人物C=街口摊主，成年约45、棕粗布衣、简单发髻，站木车右前安全/危险位置按时间轴；人物D=持碗老人，成年约70、灰白短须、褐灰长袍，在左后方；第01段0秒双手空，碎片逆回后才托住一只完整碗，第02/03段持同一只碗，不再添第二只。出镜总数严格3人：B/C/D，不新增A、沈砚、小满或路人。':'出镜严格仅'+(d.role==='周辰'?'A周辰':'B苏晚')+'一人；无C/D，无另一主角；提到沈砚或小满不代表画面需要生成他们。';
const dialog=d.lines.length?d.lines.map(l=>`${l[0]}=${l[1]}，${l[2]}—${l[3]}秒说：“${l[4]}”\n表演/视线：${l[5]}。该时段只有${l[0]}动嘴，其他人只作听者反应；不交换台词、不加句、不叠声。`).join('\n\n'):'0—15秒无对白、无旁白，所有人物只按动作自然呼吸，不自动补台词或空口型。';
const subs=d.lines.length?d.lines.map(l=>`${l[2]}—${l[3]}秒，简体中文字幕：${l[4]}`).join('\n'):'0—15秒无对白/旁白字幕。';
const refText=refs.map((r,i)=>`${i+1}. ${path.basename(r.path)}：${r.purpose}。`).join('\n');
let p=`【唯一执行目标】\n生成第一季《我活了300年，勇闯九层星渊塔》第01集第${num}段《${d.name}》，固定15秒、9:16；集内${(d.n-1)*15}—${d.n*15}秒。只拍下面这一段，不把整集前情重演。你没有前段记忆，所有必要事实已完整写入本提示词。\n\n【本段剧情前情：理解用，不回放】\n${d.context}\n\n【这15秒要生成什么视频剧情】\n${d.story}\n\n【本段人物绑定与人数】\n全项目固定ID：A周辰、B苏晚、C摊主、D老人；ID不可随段换人。\n${lead}\n${cast}\n武器道具形状优先按专用道具图；服装与脸优先按角色图，角色旧展示图附带的装饰剑不可替换本集旧铁剑。绳不可凭空出现，藏在衣内的布结不需要一直露出。\n\n【时间、场景与光线】\n${d.scene}\n相邻同场段使用本条列出的同一场景母图，不随机变门窗、地形、车/桌/桩位置。摄影机移动只改变投影位置，不镜像环境。中景深保人物和接触点可读；特写可浅景深，不让关键落脚沿虚糊。\n\n【首帧精确状态】\n${d.start}\n\n【摄影机执行】\n${d.axis}\n不添加未要求切镜；同一镜内焦段不突然改变，不将慢推/拉远/环绕同时叠加。自然微运动与惯性，非MV炫镜。奇观用近物、中层动作、远巨构建立尺度，不每段都爆炸或开全塔航拍。\n\n【0—15秒动作/运镜时序】\n${d.t.join('\n')}\n\n【对白：人物、原句、秒数、情绪、嘴型】\n${dialog}\nB声音清亮自然、机敏不娇嗲；A自然中低音、克制自嘲；C有真实惊疑。普通话，单句前后留呼吸。当前未固定真实录音声线，后续所有段采用同一套声线，不声称已配音。\n\n【字幕：同一段完整规格】\n${subs}\n字幕白字细深边、画面横向中心约高度72%—82%，每次一条，避开当前手脚动作；发布前按实际平台预览调整安全区。只有指定字幕可以出现，不加英文、滚动说明、乱码或Logo。若工具不能生成准确字形/音频，必须按本段同一规格合成；不另建字幕文件夹。\n\n【声音与配乐入点】\n${d.sound}\n无额外台词和歌词。对话时降低环境与音乐，动作声按真实接触入点；不因古装而每步加剑鸣，不因悬念而突然爆音。原创低密度配乐，情绪让位于人声。\n\n【尾帧精确状态与本段闭环结果】\n${d.end}\n本段必须完成上述行动结果，留自然未解线索即可，不提前救起、相遇、通关或穿越。末尾保留稳定可剪尾帧，禁止自行淡黑/片尾字卡/重新播放本段。\n\n【本段同目录真实参考图及优先级】\n${refText}\n本提示词不要求模型自动读取磁盘：生成时将本段所需图片作为实际参考上传；文件就近保存供用户直接取用，未上传的图不能假装模型已看到。优先主角身份/服装、当前场景几何与关键接触；工具参考数量上限未知，不虚构支持数量。如果图中文字/多格板有无关内容，不将文字印进视频。\n\n【完整全剧视觉/世界基线：只约束当前剧情】\n${common}\n\n【当前段优先锁与禁止项】\n上述世界基线提到的后集事实只作禁止提前发生的边界，本段不生成古文明说明、断剑、冰封或现代穿越。角色数、身份、对白ID、场景和首尾状态以本段为准；无对白段不因通用声音基线强加旁白。无卡通/塑料皮肤/CG游戏感，无错误肢体/穿模/道具飞移/随机换装，无未说明文字水印。不要用加速、瞬移或跳切代替动作过程。`;
const intro=d.n===1?'1—3秒：角色称谓“持碗老人”，下一行“古镇居民”；5—7秒：角色称谓“街口摊主”，下一行“古镇商贩”；10.5—13.5秒：姓名与身份“苏晚｜修行者”，下一行“符法御敌｜伤体再生”。老人、摊主尚无正式姓名，使用剧本称谓，不编造姓名。三张介绍卡依次显示，不同时堆叠。':d.n===6?'0.5—3.5秒：三行介绍依次为“周辰｜长生剑修”“历世三百载｜不死不灭”“神秘之力｜尚未可知”。不透露永生实验、本源关系或后续命运。':'本段不新增出场介绍卡；本集人物已在首次出场段介绍，不在每个15秒片段重复标注。';
p=p.replace('只有指定字幕可以出现','只有指定对白字幕、下文人物出场介绍卡及明确要求的画内文字可以出现');
p+='\n\n【视频画面人物出场介绍卡：必须呈现在成片中】\n'+intro+'\n介绍卡是画面可见的简体中文姓名/称谓、具文气的身份简述及已确认的年龄/寿命与能力；不写赤足等衣着外观标签，不写性格评价，不凭空增加门派、封号或境界。苏晚开篇实际年龄未定，不标300岁；不死再生不是无痛无损，禁止据此省略疼痛、本源消耗或提前展示尚未发生的技能动作，不是给模型看的外貌说明，也不是人物对白；无人朗读、不生成介绍旁白，不占用对白嘴型。每集首次出场介绍一次，后续同集不重复。按指定两行或三行排版，简洁白字、细暗描边、极淡半透明底，轻淡入淡出；优先置于画面横向8%—65%、高度18%—30%的空处，避开人脸、关键手脚/碎碗动作和底部对白字幕；按实际画面调整，禁止跟随镜头抖动或遮住主体。不得因介绍卡暂停动作或另加片头。若模型不能准确生成汉字，先生成干净画面，再依照本段原文、秒数与版式合成介绍卡，最终交付必须包含正确文字；不要为介绍另建字幕文件夹。';
if(d.n===4)p+='\n\n【纸条画内文字：非对白字幕】\n4—12秒俯拍纸条时，准确简体原文：“小满先失踪。我去塔边找她。三日不归，请将银纹布结交给能入塔的人。沈砚”。纸条参考为空白用于准确同段字形合成，不朗读、不生成随机书法，不在纸外叠成旁白字幕。';
if(d.n===10)p+='\n\n【尾帧参考输入特别规则】\nKEY-CLIFF只用于对照15秒结束时的握点/持刃/落脚目标，不是本段0秒首帧。工作流若支持末帧控制，才放入末帧槽；若只支持单张起始图，不把它填到起始槽，起始姿态按上文与场景主图制作。不得从一开始就握刀卡缝，省掉本段主动自救。';
fs.writeFileSync(path.join(seg,'视频提示词.md'),`# 第一集第${num}段｜${d.name}\n\n文本及同目录基础参考已配套；尚未实际生成15秒视频，动作/口型/字幕连续性待验证。复制下面单一代码块的全部内容，连同本段参考输入；不再拼其他文件。\n\n\`\`\`text\n${p}\n\`\`\`\n`);
const entry={n:d.n,name:d.name,seconds:15,sceneId:d.sceneId,role:d.role,start:d.start,end:d.end,lines:d.lines,refs:refs.map(r=>({id:r.id,file:path.basename(r.path),sha256:r.sha256})),promptFile:path.relative(root,path.join(seg,'视频提示词.md')).replaceAll('\\','/')};
ledger.push(entry);index+=`| ${num} | ${(d.n-1)*15}—${d.n*15}秒 | ${d.name} | [完整提示词](第${num}段_${d.name}/视频提示词.md) |\n`;
}
index+='\n## 正确使用与边界\n\n每次只取一个段文件夹：上传其实际参考、复制该段全部代码块、生成15秒、按尾帧和台词检查；同场下段保持同场景与角色来源。工具不能读取本地路径文字来自动取图。文字闭环与真实参考降低歧义，不保证零漂移；本轮没有视频/录音产物。所有修改依本目录10段V2，不混用旧8段V1。\n';
fs.writeFileSync(path.join(ep,'第一集执行清单V2.md'),index);fs.writeFileSync(path.join(ep,'连续性与参考校核V2.json'),JSON.stringify({seconds:150,segments:ledger,actualVideoGenerated:false},null,2));console.log(JSON.stringify({segments:ledger.length,seconds:150,copiedRefs:ledger.reduce((n,x)=>n+x.refs.length,0)}));
