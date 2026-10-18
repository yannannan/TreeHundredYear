const fs=require('fs'),path=require('path'),crypto=require('crypto');
const dir=__dirname,root=path.resolve(dir,'../..'),hash=b=>crypto.createHash('sha256').update(b).digest('hex'),read=name=>JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'));
const batches=[['精工克制场景修订原图清单V2.json','精工克制场景修订生成归档V2.json'],['沙海精工连续场景修订原图清单V3.json','沙海精工连续场景修订生成归档V3.json']];
const previous=fs.existsSync(path.join(dir,'精工克制场景采用映射V2.json'))?read('精工克制场景采用映射V2.json'):[];
const origins={
 'SC-L03-REFINED-R2':'场景资产/第一季/九层星渊塔/SC-L03_星蚀沙海_独立建立镜头V2_古旧提质R1.png',
 'KEY10-05-REFINED-R2':'场景资产/第一季/沙海追猎/KEY10-05_两片低拱曲边短绳地钉V1.png'
};
const maps=batches.flatMap(([sourceCatalog,sourceJobs])=>{const catalog=read(sourceCatalog),jobs=read(sourceJobs);return catalog.map(c=>{const j=jobs.find(j=>j.key===c.id),b=fs.readFileSync(path.join(root,c.path)),origin=j?.origin||origins[c.id];if(!origin||!j?.qa.startsWith('采用')||hash(b)!==c.sha256)throw Error('未核源图 '+c.id);return{origin,...c,review:j.qa,originalSha256:hash(fs.readFileSync(path.join(root,origin))),sourceCatalog,sourceJobs};});});
const ledgers=[];for(let n=1;n<=32;n++){const id=String(n).padStart(2,'0'),v=n===1?'V2':'V1',file=path.join(dir,`第${id}集/执行包${v}/连续性与参考校核${v}.json`);ledgers.push({id,file,data:JSON.parse(fs.readFileSync(file,'utf8'))});}
for(const m of maps){const old=previous.find(p=>p.path===m.path);m.expectedTargets=old?.expectedTargets||ledgers.flatMap(({id,data})=>data.segments.filter(s=>s.refs.some(r=>[m.origin,m.path].includes(r.source||r.path))).map(s=>id+'-'+String(s.n).padStart(2,'0')));if(!m.expectedTargets.length)throw Error('未登记采用范围 '+m.id);}
fs.writeFileSync(path.join(dir,'精工克制场景采用映射V2.json'),JSON.stringify(maps,null,2)+'\n');
const resolve=require('./解析当前场景参考V1.cjs'),canonical=read('沙海追猎静态采用V1.json').entries;
const pending=[],placements=[],updatedPrompts=new Set();
for(const {id,file:ledgerFile,data:l} of ledgers){
 let ledgerChanged=false;
 for(const s of l.segments){const promptFile=path.join(root,s.prompt||s.promptFile),folder=path.dirname(promptFile);let body=fs.readFileSync(promptFile,'utf8'),changed=false;
  for(const r of s.refs){const m=maps.find(m=>m.origin===r.source||m.origin===r.path);if(!m)continue;const oldFile=r.file,newFile=path.basename(m.path),old=path.resolve(folder,oldFile),dest=path.resolve(folder,newFile);
   if(!old.startsWith(folder+path.sep)||!dest.startsWith(folder+path.sep))throw Error('副本越界');
   const oldBytes=fs.readFileSync(old);if(hash(oldBytes)!==r.sha256||r.sha256!==m.originalSha256)throw Error('旧副本已变 '+old);
   const base=canonical.find(x=>x.path===m.origin)||{path:m.origin,purpose:(r.purpose||'场景').replace(/；(?:2026-10-18古旧基底轻度提质|已按古旧低饱和方向轻度提质)[\s\S]*$/,'')},effective=resolve(base);
   if(r.purpose&&body.includes(r.purpose))body=body.replaceAll(r.purpose,effective.purpose);
   else {const lines=body.split('\n'),indices=lines.map((line,i)=>line.startsWith(oldFile+'：')?i:-1).filter(i=>i>=0);if(indices.length!==1)throw Error('无法唯一定位参考用途行 '+promptFile);lines[indices[0]]=oldFile+'：'+effective.purpose;body=lines.join('\n');}
   body=body.replaceAll(oldFile,newFile);
   r.previousSource=m.origin;r.source=m.path;if(r.path)r.path=m.path;r.file=newFile;r.sha256=m.sha256;r.purpose=effective.purpose;if(r.width)r.width=m.width;if(r.height)r.height=m.height;
   pending.push({old,dest,source:path.join(root,m.path),originalSha:m.originalSha256});placements.push({target:id+'-'+String(s.n).padStart(2,'0'),source:m.path,file:newFile});changed=true;
  }
  if(changed){pending.push({file:promptFile,body});updatedPrompts.add(promptFile);ledgerChanged=true;}
 }
 if(ledgerChanged)pending.push({file:ledgerFile,body:JSON.stringify(l,null,2)+'\n'});
}
for(const p of pending){if(p.dest){fs.copyFileSync(p.source,p.dest);if(p.old!==p.dest){if(hash(fs.readFileSync(p.old))!==p.originalSha)throw Error('移除前副本复核失败');fs.unlinkSync(p.old);}}else fs.writeFileSync(p.file,p.body);}
const sceneChanges=[];function walk(folder){for(const e of fs.readdirSync(folder,{withFileTypes:true})){const f=path.join(folder,e.name);if(e.isDirectory()){walk(f);continue;}if(!e.name.endsWith('.md')||/生成记录|生成提示词与检查|普查|回执/.test(e.name))continue;let s=fs.readFileSync(f,'utf8'),old=s;for(const m of maps)s=s.replaceAll(path.basename(m.origin),path.basename(m.path));if(s!==old){fs.writeFileSync(f,s);sceneChanges.push(path.relative(root,f).replaceAll('\\','/'));}}}walk(path.join(root,'场景资产/第一季'));
const currentPlacements=ledgers.flatMap(({id,data:l})=>l.segments.flatMap(s=>s.refs.filter(r=>maps.some(m=>m.path===(r.source||r.path))).map(r=>({target:id+'-'+String(s.n).padStart(2,'0'),source:r.source||r.path,file:r.file}))));
const result={date:'2026-10-18',adoptedNewSceneOriginals:maps.length,copyPlacements:currentPlacements.length,newReplacementsThisRun:placements.length,updatedSegmentPrompts:updatedPrompts.size,placements:currentPlacements,updatedSceneDocuments:sceneChanges,allSceneImagesRevised:false,formalCharacterCostumeImagesChanged:0,originalImagesDeleted:0,actualVideoGenerated:false};fs.writeFileSync(path.join(dir,'精工克制场景采用检查V2.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,placements:undefined,updatedSceneDocuments:sceneChanges.length}));
