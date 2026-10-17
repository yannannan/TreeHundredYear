const fs=require('fs'),path=require('path'),crypto=require('crypto');
const sharp=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'../..');
const items=[
['GATE-CLOSED','场景资产/第一季/塔外/SC-OUT05_星纹门闭合主机位V1.png','门前缓坡/短阶/闭门几何与晨光；非双人首帧'],
['GATE-HALF','场景资产/第一季/塔外/SC-OUT05_星纹门半亮状态V1.png','闭门右半外圈亮；其余刻饰暗，不作为全开门状态'],
['RESCUE-GRIP','场景资产/第一季/塔外/KEY-RESCUE_双人递鞘构图V1.png','只锁双人服装、断桩后构图和支点关系；不作为精确首帧或左右手接触尾帧控制图，见随图限制'],
['GATE-NARROW','场景资产/第一季/塔外/SC-OUT05_星纹门窄开构图V1.png','仅锁侧滑窄缝/门槛几何，发光刻饰未符合唯一外轨规则，不能当精确灯光状态首尾帧'],
['GATE-OPEN','场景资产/第一季/塔外/SC-OUT05_星纹门全开状态V1.png','双门侧滑全开与连续实地门槛/近端落地平台，空景参考而非人物首帧']
];
(async()=>{const result=[];for(const [id,p,purpose] of items){const file=path.join(root,p);if(!fs.existsSync(file))continue;const b=fs.readFileSync(file),m=await sharp(b).metadata();result.push({id,path:p,purpose,width:m.width,height:m.height,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex'),upscaled:false});}fs.writeFileSync(path.join(__dirname,'第二集新增真实参考V1.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));})();
