const fs=require('fs'),path=require('path'),dir=__dirname;
function apply(){const p=JSON.parse(fs.readFileSync(path.join(dir,'首集持物与参考来源修订计划V21.json'),'utf8')),file=path.join(dir,'第一集15秒执行数据V2.json'),data=JSON.parse(fs.readFileSync(file,'utf8')),s=data.find(s=>s.n===p.dataChange.n);for(const [k,v]of Object.entries(p.dataChange.after)){const current=JSON.stringify(s[k]);if(![JSON.stringify(p.dataChange.before[k]),JSON.stringify(v)].includes(current))throw Error('首集动作字段已有分歧 '+k);s[k]=v;}fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');return p;}
module.exports=apply;if(require.main===module){apply();console.log('首集01-02先削木归刀、再空手取楔；15秒首尾/对白不变');}

