const fs=require('fs'),path=require('path'),crypto=require('crypto');const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8'),errors=[],eps=[],hash=b=>crypto.createHash('sha256').update(b).digest('hex');
let count=0,refs=0;
for(const[id,cn]of [[28,'第二十八'],[29,'第二十九'],[30,'第三十'],[31,'第三十一'],[32,'第三十二']]){
 const ep=require('./'+cn+'集执行数据V1.cjs'),ledger=JSON.parse(read(`剧集制作/第一季/第${id}集/执行包V1/连续性与参考校核V1.json`));
 if(ep.segments.length!==ledger.segments.length||ledger.seconds!==ep.segments.length*15)errors.push(id+'源与输出长度不符');
 for(const[i,s]of ledger.segments.entries()){
  const folder=path.dirname(path.join(root,s.prompt)),p=read(s.prompt),images=fs.readdirSync(folder).filter(f=>/\.(png|jpe?g)$/i.test(f)),expected=s.refs.map(r=>r.file);
  if(images.length!==expected.length||images.some(x=>!expected.includes(x)))errors.push(id+'-'+(i+1)+'参考有多余/缺图');
  for(const r of s.refs){if(hash(fs.readFileSync(path.join(folder,r.file)))!==r.sha256||hash(fs.readFileSync(path.join(root,r.source)))!==r.sha256)errors.push(id+'-'+(i+1)+'图字节不同');if(/旧铁剑两截永久断态V2|现代雨夜路缘与车窗V1|电影华服质感修订V2/.test(r.source))errors.push(id+'-'+(i+1)+'混用未采用候选');refs++;}
  if(!p.includes(s.start)||!p.includes(s.end))errors.push(id+'-'+(i+1)+'首尾未完整内嵌');
  if(!p.includes('当前仅执行文字及现有基础参考，尚无实际视频、配音或动态验收。'))errors.push(id+'-'+(i+1)+'丢失真实状态说明');
  if(id>=29&&!s.refs.some(r=>/原剑柄两截断态V3/.test(r.source)))errors.push(id+'-'+(i+1)+'断剑阶段漏参考');
  if(id===32&&i===9){if(!p.includes('此句是指定内心音轨，A/B都不为此句动嘴')||!p.includes('6.3—9.4秒，A=周辰'))errors.push('苏醒内心音轨/有声句未分开');}
  if(id===32&&i===11&&!s.refs.some(r=>/单车车窗近端V2/.test(r.source)))errors.push('现代落点缺当前图');
  count++;
 }
 eps.push({episode:id,segments:ledger.segments.length,seconds:ledger.seconds,referenceCopies:ledger.segments.reduce((n,s)=>n+s.refs.length,0)});
}
const p31=JSON.parse(read('剧集制作/第一季/第31集/执行包V1/连续性与参考校核V1.json'));
if(!p31.segments[10].end.includes('不能同时够台')||!p31.segments[11].end.includes('已沿实桥真实回屋内'))errors.push('握手/回台两空间问题未落实');
const p32=JSON.parse(read('剧集制作/第一季/第32集/执行包V1/连续性与参考校核V1.json'));
for(const[i,need]of [[0,'3/13'],[1,'五人全返'],[4,'9/13'],[5,'12/13'],[6,'13人全部真实返'],[8,'300年终日'],[11,'尚未重逢']])if(!p32.segments[i].end.includes(need))errors.push('第32集'+(i+1)+'阶段计数/结尾事实不符');
const result={date:'2026-10-18',scope:'28—32完整执行文本/源图副本/登记的终章关键物位；不是视频与美术品质实测',episodes:eps,segments:count,referenceCopies:refs,errors,actualVideoGenerated:false,actualAudioGenerated:false,characterCostumeImagesEdited:false,completionClaim:'只证明静态交付文件一致与明确关键规则；专用参考及实际动态仍需继续制作验收'};
fs.writeFileSync(path.join(__dirname,'终章制作交付核对V1.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(errors.length)process.exit(1);
