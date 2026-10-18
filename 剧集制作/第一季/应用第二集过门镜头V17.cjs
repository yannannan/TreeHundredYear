const fs=require('fs'),path=require('path');const dir=__dirname,root=path.resolve(dir,'../..');
const changes=[
{file:'第02集/执行包V1/第07段_先说真话/视频提示词.md',pairs:[
['50mm门内侧双人中景，门槛与脚步在后半段通过缓拉显露；保持周辰左苏晚右，不绕到相反侧倒置方位。','50mm门外同侧双人中景，朝门内拍：0—10秒读两人侧脸与对视，10秒后缓拉至全身让门槛和脚步同框。摄影机始终留在门外，沿入塔方向拍两人转身后的背侧，周辰左路、苏晚右路；不切门内迎拍，不镜像换边，门叶末段在前景两侧收拢。'],
['10—15秒：苏晚先自主迈过门槛，周辰随后一步同行；镜头从门内侧迎看两人，清楚表现跨门而非瞬移，门在后方开始合拢。','10—15秒：10—10.8秒苏晚说完末句，两人转向门内，各自略向中线侧让入门孔左右通行线但不交叉；约11—12秒苏晚先自主跨门，约12—13秒周辰随后跨过，13—15秒二人站稳在内侧安全石台，释放裙摆，门才在他们身后开始合拢。摄影机仍在门外朝内拍背侧/足步，门叶只在前景侧边进入；不让人倒走出塔、不瞬移、不过夹门缝。']
]},
{file:'第02集/执行包V1/第08段_桥上新血/视频提示词.md',pairs:[
['24mm入口中全景缓推，8秒允许切50mm桥面及对岸线索，12秒回35mm同侧双人；不同时航拍环绕变焦，不把总塔外观塞入塔内。','0—0.8秒沿用上一段门外朝内轴向机位，先看两侧门叶合到闭合；0.8秒明确切至门内、两人背后的24mm同向中全景，摄影机仍朝塔内，周辰左、苏晚右，不反打180度。门此后在人物与摄影机后方画外，1—4秒缓推至桥口；8秒允许切50mm桥面及对岸线索，12秒回35mm同侧双人。不把剪辑切位伪装成摄影机穿门，不航拍环绕变焦。'],
['0—4秒：门在后方完全合拢，24mm从双人中全景缓推至桥口，透过肩侧见青铜环和倒流瀑布，前中后景建立纵深。','0—4秒：0—0.8秒从门外朝内保留上一段两人已在内侧的落位，门在他们身后完全合拢；0.8秒沿同一入塔方向切门内背侧24mm，门转到画外后方，不重新开门也不倒拍人物。1—4秒从双人中全景缓推桥口，透过肩侧见青铜环和倒流瀑布，前中后景建立纵深，桥仍未翻转。']
]}
];
for(const c of changes){const p=path.join(dir,c.file);let s=fs.readFileSync(p,'utf8');for(const [a,b]of c.pairs){if(s.includes(b))continue;if(!s.includes(a))throw Error('镜头旧行缺 '+c.file);s=s.replace(a,b);}fs.writeFileSync(p,s);}
const g=path.join(dir,'生成第二集执行包V1.cjs');let s=fs.readFileSync(g,'utf8');for(const c of changes)for(const [a,b]of c.pairs){if(s.includes(b))continue;if(!s.includes(a))throw Error('生成器镜头旧行缺');s=s.replace(a,b);}fs.writeFileSync(g,s);
console.log(JSON.stringify({updatedPrompts:['02-07','02-08'],axis:'outside-to-inside same forward direction',dialogueStartEndDurationEdited:false}));

