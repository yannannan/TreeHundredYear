const fs=require('fs'),path=require('path'),crypto=require('crypto'),sharp=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'../..'),read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,p),'utf8')),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{const plan=read('终章接触状态采用V1.json'),errors=[],rows=[];
 const accepted=new Set(plan.entries.map(r=>r.path));
 const archived=['终章接触首批真实参考V1.json','终章接触第二批真实参考V1.json','终章接触修订真实参考V2.json','窄布两半状态真实参考V3.json'].flatMap(read),rejected=archived.filter(r=>!accepted.has(r.path)),seen=[];
 for(const r of plan.entries){const b=fs.readFileSync(path.join(root,r.path)),m=await sharp(b).metadata();if(hash(b)!==r.sha256||m.width!==r.width||m.height!==r.height||r.upscaled!==false)errors.push(r.id+'源图SHA/原生像素不符');
  const current=require('./解析当前场景参考V1.cjs')(r);
  for(const target of r.targets){const[id,n]=target.split('-'),l=read(`第${id}集/执行包V1/连续性与参考校核V1.json`),s=l.segments[+n-1],p=fs.readFileSync(path.join(root,s.prompt),'utf8'),matches=s.refs.filter(x=>x.source===current.path);
   if(matches.length!==1)errors.push(target+' '+r.id+'实际副本必须唯一');else {const f=path.join(root,path.dirname(s.prompt),matches[0].file);if(hash(fs.readFileSync(f))!==current.sha256)errors.push(target+' '+r.id+'副本错');if(!p.includes(matches[0].file)||!p.includes(matches[0].purpose))errors.push(target+' '+r.id+'提示词未写明使用边界');}
   if(!p.includes('每项仅补目标静态时刻'))errors.push(target+'未保留动态尚未验收说明');seen.push(target);}
  rows.push({id:r.id,archivedWidth:r.width,archivedHeight:r.height,currentSource:current.path,width:current.width,height:current.height,placements:r.targets.length});
 }
 for(const id of [28,29,30,31,32])for(const s of read(`第${id}集/执行包V1/连续性与参考校核V1.json`).segments)for(const r of s.refs)if(rejected.some(x=>x.path===r.source))errors.push(id+'-'+s.n+'混入四历史候选');
 const p11=read('第32集/执行包V1/连续性与参考校核V1.json').segments[10];if(!p11.refs.some(r=>r.source.includes('将断'))&&!p11.refs.some(r=>r.source.includes('外袖窄布右苏握尾V2')))errors.push('分离段缺将断前态');if(!p11.refs.some(r=>r.source.includes('断开两人各半V3')))errors.push('分离段缺断后态');
 const result={date:'2026-10-18',archivedOriginals:archived.length,adoptedStaticOriginals:plan.entries.length,historicalCandidates:rejected.length,targetSegments:new Set(seen).size,copyPlacements:seen.length,images:rows,errors,actualVideoGenerated:false,actualAudioGenerated:false,characterCostumeMasterImagesEdited:false,qualityBoundary:'图像内容为人工视检的局部静态目标，文件检查仅核原像素/字节与逐段采用；全季动态/配音和其余必要参考仍未完成'};
 fs.writeFileSync(path.join(__dirname,'终章接触采用核对V1.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(errors.length)process.exit(1);
})();
