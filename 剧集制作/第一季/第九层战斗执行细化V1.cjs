const fs=require('fs'),path=require('path'),crypto=require('crypto'),root=path.resolve(__dirname,'../..');
module.exports=ep=>{
 if(ep.id!=='28')return ep;
 const m=JSON.parse(fs.readFileSync(path.join(__dirname,'第九层战斗静态采用V1.json'),'utf8'));
 const reflect=ep.segments[1];
 reflect.a='卫收长刃转腕，腕位短暂经过原胸镜前方；B左手身前一小圈指势形成唯一低耗薄符，沿可见短弧朝该腕位发出。卫侧转以镜胸边缘截住同符，不把腕旁和胸镜画成无关的两条路径。';
 reflect.t[0]='0—4秒：'+reflect.a;
 reflect.camera='35mm同轴B手势→卫腕经过镜前/镜胸边截符→同一来向折回；4—6秒返光掠B侧撤位，随后50mm接小滚及原侧柱，镜头保证右好脚主承重、左伤踝卸重。返光不新增第二道独立法术，不强求所有时刻九环入画。';
 const final=ep.segments[10];
 final.b='B趁同振动用右包掌将原刀柄下压，独立第二薄封的封线贯通断开，同处小段嵌框边缘崩缺但不毁整翼/中央镜胸。4—7秒可短接刀仍在缺口的结果特写；随后先抽回同一短刃、左手离固定翼缘，右好脚主承重侧降原低阶，左伤踝少负重；A与B同时伏低。';
 final.t[1]='4—10秒：'+final.b;
 for(let i=0;i<ep.segments.length;i++){
  const d=ep.segments[i],key='28-'+String(i+1).padStart(2,'0'),items=m.entries.filter(r=>r.targets.includes(key));if(!items.length)continue;
  for(const r of items){
   if(r.status!=='adopted-static'||crypto.createHash('sha256').update(fs.readFileSync(path.join(root,r.path))).digest('hex')!==r.sha256)throw Error('战斗图采用未核：'+r.id);
   if(!d.refs.some(x=>typeof x==='object'&&x.path===r.path))d.refs=[...d.refs,{path:r.path,purpose:r.purpose}];
  }
  const remain={
   '28-02':'仍需唯一薄符出手→腕经过胸镜截符→原路回射→B完整小滚→同柱原裂口断落的同空间动态；图片只折返瞬间，不证明方向连续、柱倒安全区或人物与卫的实际尺度。',
   '28-06':'已补A双足/身体离主受力线的静态同框，仍缺完整斜入/双手短定位→左手脱受力区、巨刃压紧真实承重/旧剑应力，以及同矮台B到外露封的全空间机位。',
   '28-07':'已补A维持柄位的前态及既有B第一封触点，仍缺二人同侧台完整相对高度、B一步划断→一重环停→落台左肩擦伤和卫撤刃动态；本轮楔稳图只开头不可覆盖破封末态。',
   '28-08':'本轮断后图只末态/尖段卫足旁，两截断口需与原道具逐帧匹配；旧完整受压剑仅首态，仍需撤刃→旧崩口折两截→A小滚与尖段真实落点，不能直接从产品图切掉断裂。',
   '28-09':'断后图仅本段开始，随后仍需断柄勾唯一护翼链/绕原柱牵小角、左旧包才新渗一点与B近身路线；不能把末态图当已经绕链，也不让A手臂拉动整卫。',
   '28-10':'已补镜胸转离后的独立小封卡刃/双手脚位，仍缺一臂低耗符送同刀→符灭卡半寸→B走近重新握柄，隐藏左肩小擦和第一破封全局仍据前段状态，不因局部图看不到就抹掉。',
   '28-11':'已补本段卡刃首态及同第二封贯通缺口未抽刀特写；仍缺A卸链/卫落刃传振/B实体加压断线→拔回刀/左手离翼→右脚降阶→二人伏低避同末扫→卫跪/九环依次停全程。缺口按实图局部嵌框一起崩缺，不把破封特写当整卫停机或两人安全。'
  };
  d.missing='本段已补有限静态：'+items.map(r=>r.label+'（'+r.phase+'）').join('、')+'。'+remain[key]+'每项仅补目标静态时刻；实际视频、特效运动、完整口型/配音/简中字幕和跨段剪辑仍未生成或动态验收，不以图片/SHA证明真实物理或成片品质。';
 }
 return ep;
};
