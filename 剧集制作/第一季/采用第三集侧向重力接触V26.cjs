const fs=require('fs'),path=require('path'),crypto=require('crypto'),d=__dirname,root=path.resolve(d,'../..'),hash=b=>crypto.createHash('sha256').update(b).digest('hex'),read=f=>JSON.parse(fs.readFileSync(path.join(d,f),'utf8'));
module.exports=function apply(){
const p=read('第三集侧向重力接触静态采用V26.json'),jobs=read(p.sourceJobs),lf=path.join(d,'第03集/执行包V1/连续性与参考校核V1.json'),l=JSON.parse(fs.readFileSync(lf,'utf8')),copies=[],writes=[],placements=[];
if(p.entries.length!==3)throw Error('应3静态原图');
for(const e of p.entries){const j=jobs.find(j=>j.key===e.id);if(e.status!=='adopted-static'||!e.qa.startsWith('采用')||j?.qa!==e.qa||hash(fs.readFileSync(path.join(root,e.path)))!==e.sha256)throw Error('原图未核 '+e.id);}
const stages={
2:'右向重力尾态V3只取03-02末：A背侧左臂撑原栏根、右手护腰侧符，单整鞘已沿背带贴背；B赤足双手抓缝、无肩伤，单检修绳仍锚完整梁。图只锁重力已转向后的姿态，不能代替本段0秒左持整鞘施法首态或中间退法、背鞘回贴及人物撞栏/滑动。机位建筑竖柱保持不滚转，衣发与绳偏向建筑右侧，须真正表现局部重力转向而非旋转画面。',
3:'尾态V3只取本段0秒与03-02末相接的未擦肩/未抓人状态，腰侧古符随后才滑到右掌，不可将图中护腰姿态固定全段。右掌阻握近景只取本段末：一枚原暗铜符在右掌与完整梁角之间，未完整握梁、尚未放开；不从裁切补出第二符或改变本段原镜头。左臂套原栏根/左手抓B左前臂、右肘抵梁和B右肩擦伤/衣破与血痕仍按时间轴发生，局部右掌图并未展示这些全身关系；B右手尚未拿绳。',
4:'右掌阻握图只取本段开始的符仍在掌中状态；空右掌握梁图只取主动放符后的末态，不固定为同一时刻，也不以两张跳切代替松手、古符向建筑右侧坠落和右手再扣完整梁的连续动作。古符离手后永久遗失，无回光定位、不恢复腰侧/另一手/梁面。左臂仍套栏根、左手仍抓B左前臂，B右肩收口但破衣/血痕保留、右手尚未抓绳；两张近景不证明画外支点或承力。',
5:'空右掌握梁近景只锁本段首态和持续的A右手接触，古符已永久遗失，不恢复到任何位置。A左臂仍套栏根/左手仍抓B左前臂；B随后先双脚蹬石缝、右手再抓原检修绳余段拉近，固定端仍绕同一完整梁、不能新生第二条绳或高锚。此图未展示B/脚缝/抓绳，不可由近景声称这些动作已验；本段末尚未把绳套成腰环卸力，肩伤收口与破衣/血痕连续保留。'
};
const pending={
2:'已附重力转向后的双人支点有限尾态V3，并有上一段四齿局部前后图；尚需固定机位真正90度重力转换、退法/整鞘归背/撞栏与脚滑的连续动作、粒子/衣发/单检修绳方向及可达距离实测。尾态部分足端/细物受遮，不能据静态证明完整负重。配音、字幕字形/口型及实际视频未生成验收，过密则拆段同步预算，不加速跳切。',
3:'已附未受肩伤首态V3及末态右掌古符阻握近景。尚需完整左臂套栏根/左手抓B左前臂与右肘抵梁的同机位全身接触、B抓缝处断裂/滑落/右肩擦伤与对应衣破血痕、符由腰滑入右掌及单检修绳可达关系。右掌近景不证明画外支点/握距/真实负重；实际动作、声画、字幕/口型仍待试片。',
4:'已附放符前阻握与放符后空掌完整握同梁角两态近景。尚需主动松指/古符向建筑右侧坠落并永久消失、右手连续换握及左臂抓人/右肘支点同机位负重参考与实际动作；B肩伤收口和衣破血痕保持，检修绳尚未抓取。局部两态不证明全身承力或落符轨迹，配音/字幕/口型与实际视频仍待验。',
5:'已附古符永久离手后的右掌完整握梁首态近景。尚需A左套栏根/左抓B左前臂的持续负重、B双脚蹬缝后右手抓原梁锚检修绳余段的同机位接触、绳结固定端及抓取距离/肩衣破口的专用参考和实际动作。腰环属于下一段，不提前生成或卸力；近景不证明画外手脚、真实三维距离/负荷，声音/字幕/口型和动态仍待试片。'
};
for(const s of l.segments){if(!stages[s.n])continue;const key='03-'+String(s.n).padStart(2,'0'),pf=path.join(root,s.prompt||s.promptFile),folder=path.dirname(pf);let body=fs.readFileSync(pf,'utf8');
for(const e of p.entries.filter(e=>e.targets.includes(key))){const file=path.basename(e.path),dest=path.resolve(folder,file),rr=s.refs.filter(r=>r.source===e.path);if(path.dirname(dest)!==folder||rr.length>1)throw Error('引用路径/重复错 '+key);if(rr.length){const r=rr[0];if(r.file!==file||r.purpose!==e.purpose||r.sha256!==e.sha256||hash(fs.readFileSync(dest))!==e.sha256||!body.includes(file+'：'+e.purpose))throw Error('现有引用分歧 '+key);}else{if(fs.existsSync(dest)&&hash(fs.readFileSync(dest))!==e.sha256)throw Error('同名冲突');const anchor='【V18混合道具图用途澄清】';if(!body.includes(anchor))throw Error('插入锚缺');body=body.replace(anchor,file+'：'+e.purpose+'\n'+anchor);s.refs.push({file,source:e.path,sha256:e.sha256,purpose:e.purpose});copies.push({source:path.join(root,e.path),dest});}placements.push({segment:key,id:e.id,file,phase:e.phase});}
const marker='【V26侧向重力与右掌参考阶段限定】',block=marker+'\n'+stages[s.n]+'共同：只锁对应有限静态，不复制近景构图覆盖本段原摄影；场景主体完整、低饱和、精工克制，剧情必要断缘保留。原正式人物服饰不改，B仍赤足、右腰原短刃，左踝无早伤，A只有一把完整入鞘旧剑，不新生武器/古符/绳。\n\n';
if(body.includes(marker))body=body.replace(/【V26侧向重力与右掌参考阶段限定】[\s\S]*?(?=【待补高清参考与验收边界】)/,block);else body=body.replace('【待补高清参考与验收边界】',block+'【待补高清参考与验收边界】');
const re=/(【待补高清参考与验收边界】\s*)[\s\S]*?(?=\n\n【完整全剧基线】)/;if(!re.test(body))throw Error('缺项块缺 '+key);body=body.replace(re,'$1'+pending[s.n]);writes.push({file:pf,body});}
const count=l.segments.reduce((n,s)=>n+s.refs.length,0);if(count!==83||placements.length!==6)throw Error('应83总参考/6本批引用');
for(const c of copies)fs.copyFileSync(c.source,c.dest);for(const w of writes)fs.writeFileSync(w.file,w.body);fs.writeFileSync(lf,JSON.stringify(l,null,2)+'\n');
for(const ep of ['02','03']){const file=path.join(d,'第'+ep+'集/执行包V1/第'+(ep==='02'?'二':'三')+'集执行清单V1.md');let body=fs.readFileSync(file,'utf8').replace(/第二集105参考\/第三集\d+参考/g,'第二集105参考/第三集83参考').replace(/V25最新：([^\n]*?)第三集\d+参考/g,'V25最新：$1第三集当前83参考');if(ep==='03')body=body.replace(/\d+份原图就近副本/,'83份原图就近副本').replace('专用重力反转、侧墙机位和手/绳/梁接触图尚缺，不能只凭总景宣称齐备。','已补重力转向后尾态及右掌古符阻握/放符后握梁局部；完整转向、左臂救援/肩伤与脚绳接触仍缺，不能只凭静态宣称齐备。');const note='V26最新：03-02末/03-03首用重力尾态；03-03末/03-04首用符阻握；03-04末/03-05首用无符握梁。3原图6阶段引用，第三集当前83参考；未展示左臂救援/肩伤和完整运动负重，实际音视频仍待验。\n\n';if(/^V26最新：[^\n]*\n\n/m.test(body))body=body.replace(/^V26最新：[^\n]*\n\n/m,note);else body=body.replace(/\n\n/,'\n\n'+note);fs.writeFileSync(file,body);}
const tasks=read('第三集侧向重力接触任务V26.json');tasks.status='adopted-static-current-batch';tasks.adoptedOriginals=3;tasks.remaining='完整重力转换/连续动作、左臂救援/右肘负重、肩伤破衣、落符轨迹和脚绳抓取等仍需补制与真实试片';for(const e of p.entries){const t=tasks.jobs.find(j=>j.key===e.id||j.actualPath===e.path);if(t)Object.assign(t,{status:'adopted-static',adopted:true,adoptedTargets:e.targets});}fs.writeFileSync(path.join(d,'第三集侧向重力接触任务V26.json'),JSON.stringify(tasks,null,2)+'\n');
for(const cn of ['二','三']){const file=path.join(d,'生成第'+cn+'集执行包V1.cjs');let body=fs.readFileSync(file,'utf8'),hook="require('./采用第三集侧向重力接触V26.cjs')();";if(!body.includes(hook))body=body.trimEnd()+'\n\n// V26侧向重力/右掌阶段，后置于V24/V25旧缺项和指南写入。\n'+hook+'\n';fs.writeFileSync(file,body);}
const out={date:'2026-10-19',newNativeOriginals:3,archivedCandidates:2,actualGeneratedOutputs:5,newReferenceCopies:6,updatedSegments:['03-02','03-03','03-04','03-05'],episodeReferenceCopies:83,totalReferenceCopies:require('./当前执行包统计V31.cjs')().referenceCopies,actualVideoGenerated:false,actualAudioGenerated:false,placements};fs.writeFileSync(path.join(d,'第三集侧向重力接触采用检查V26.json'),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({...out,placements:undefined}));return out;};
if(require.main===module)module.exports();
