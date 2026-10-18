const fs=require('fs'),path=require('path'),crypto=require('crypto'),root=path.resolve(__dirname,'../..');
module.exports=ep=>{const file=path.join(__dirname,'回程维护静态采用V1.json');if(!fs.existsSync(file))return ep;const plan=JSON.parse(fs.readFileSync(file,'utf8'));
 for(const [i,d]of ep.segments.entries()){
  const key=ep.id+'-'+String(i+1).padStart(2,'0'),items=plan.entries.filter(r=>r.targets.includes(key));if(!items.length)continue;
  for(const r of items){const b=fs.readFileSync(path.join(root,r.path));if(r.status!=='adopted-static'||crypto.createHash('sha256').update(b).digest('hex')!==r.sha256)throw Error('采用未核原图'+r.id);if(!d.refs.some(x=>typeof x==='object'&&x.path===r.path))d.refs=[...d.refs,{path:r.path,purpose:r.purpose.replace(/[。；]+$/g,'')}];}
  const pending=r=>{
   if(r.id==='RETURN-R5'&&['32-03','32-04'].includes(key))return '五份既有回执继续收台格，本段不增纸、不重演父女过门；按本段生活/检修时轴核人物和操作';
   if(r.id==='RETURN-R5'&&key==='32-05')return '本段开场仍仅5份，05—08各自真实返回后逐份增加到9，不能首帧直接9';
   if(r.id==='RETURN-R9'&&key==='32-06')return '本段开场既有9份，只随09—11三次真实回程增加到12，不重演05—08';
   if(r.id==='RETURN-R12'&&key==='32-06')return '12号半开门安全暂停、屋/舱止销卡持、末态12份且12号空位保持，本段不让最后一人出门';
   if(r.id==='RETURN-R12'&&key==='32-07')return '本段起既有12份，12号在换轴后下一真实相位窗口过门、最后才增加第13份，前12不复制';
   if(r.id==='RETURN-RECEIPTS'&&key!=='32-07')return '13份从第37年起已经全部成立并留核心，仅延续既有页/各编号/锁存与本段视线，不重演过门、补救或新增第14份；现代B不带此册';
   if(r.id==='MAINT-SEALED2'&&key.startsWith('32-')&&key!=='32-10')return '同锚闭眼低源压是既有持续态，只核本段视角与物位，不再生长冰/说话/睁眼；本段其他动作仍按时轴';
   if(r.id==='MAINT-SEALED2'&&key==='32-10')return '只从现有全封闭眼首态进入终日冰裂/睁眼/弱抬指，不再演31集冰封，不维持闭眼到本段尾';
   if(r.id==='MAINT-HOLD2'&&key==='31-12')return '中档暂稳维持到B抽手沿桥回原台；她坐稳转末环后才闭合，不在离位时先冻脸';
   if(r.id==='MAINT-VALVE4'&&key==='31-03')return '当前只是无压备用阀试拆：错角停止、垫片正确接触、刀背拨舌并复装回格，不提前演第32集的首年夜故障';
   return r.remaining;
  };
  const receiptNote=items.some(r=>r.receiptCount)?'回执只数米色独立纸及核印，空插位不计；图中硬皮框不替换原薄册，B按原流程在台面夹页展开核验。':'';
  const note='本轮已补专用静态：'+items.map(r=>r.label+(r.phase?'（'+r.phase+'）':'')).join('、')+'。图中状态只用于标明时刻，原片仍需：'+items.map(pending).join('；')+'。'+receiptNote+'新图不证明任何完整动作/真实配音/字幕/口型或最终成片已验收。';
  d.missing=note+'\n原有已补局部与动态边界：'+d.missing;
 }
 return ep;
};
