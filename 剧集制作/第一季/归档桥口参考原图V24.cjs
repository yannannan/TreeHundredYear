const fs=require('fs'),path=require('path'),crypto=require('crypto'),sharp=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
module.exports=async function archive(j){
 const dir=__dirname,root=path.resolve(dir,'../..'),hash=b=>crypto.createHash('sha256').update(b).digest('hex'),read=n=>{const f=path.join(dir,n);return fs.existsSync(f)?JSON.parse(fs.readFileSync(f,'utf8')):[];},candidate=!!j.candidate;
 if(!j.qa?.startsWith(candidate?'候选':'采用'))throw Error('必须如实记录采用/候选QA');
 const bytes=fs.readFileSync(j.sourceCache),m=await sharp(bytes).metadata(),dest=path.resolve(root,j.path);if(!dest.startsWith(root+path.sep)||!j.path.endsWith('.png'))throw Error('输出路径越界');
 const sha256=hash(bytes),stem=candidate?'桥口五项参考候选':'桥口五项参考',rawFile=path.join(dir,stem+'原图清单V24.json'),jobsFile=path.join(dir,stem+'生成归档V24.json'),raw=read(stem+'原图清单V24.json'),jobs=read(stem+'生成归档V24.json');
 if(raw.some(r=>r.id===j.key)||jobs.some(x=>x.key===j.key))throw Error('记录已存在，不重复归档');
 if(fs.existsSync(dest)&&hash(fs.readFileSync(dest))!==sha256)throw Error('同名输出冲突');fs.copyFileSync(j.sourceCache,dest);
 const record={id:j.key,path:j.path,width:m.width,height:m.height,bytes:bytes.length,sha256,upscaled:false,purpose:j.qa,status:candidate?'candidate-not-adopted':'reviewed-static-await-adoption'};
 const inputs=j.submittedInputs||j.inputs;raw.push(record);jobs.push({key:j.key,path:j.path,source:j.sourceCache,inputs,prompt:j.prompt,qa:j.qa,phase:j.phase,targets:j.targets,candidate,actualOutputGenerated:true,width:m.width,height:m.height,sha256});
 fs.writeFileSync(rawFile,JSON.stringify(raw,null,2)+'\n');fs.writeFileSync(jobsFile,JSON.stringify(jobs,null,2)+'\n');
 fs.writeFileSync(dest.replace(/\.png$/,'_生成记录.md'),'# 桥口五项参考｜实际生成记录 V24\n\n工具：内置image_gen；原生'+m.width+'×'+m.height+'，未放大。\n\n原始输出：'+j.sourceCache+'\n\nSHA256：'+sha256+'\n\n## 实际输入\n\n'+inputs.join('\n')+'\n\n## 实际提交提示词\n\n'+j.prompt+'\n\n## 有限静态视检\n\n'+j.qa+'\n\n对应时点：'+j.phase+'\n\n本阶段'+(candidate?'仅候选归档、不入执行包':'完成有限视检、待统一采用')+'；不是视频、运动/受力/声音/口型或成片验收。\n');
 const planFile=path.join(dir,'第二集桥口待生成任务V18.json'),p=JSON.parse(fs.readFileSync(planFile,'utf8')),task=p.jobs.find(x=>x.key===(j.taskKey||j.key));if(!task)throw Error('未找到既定任务');
 task.attempted=true;task.actualOutputGenerated=true;task.latestOutputCache=j.sourceCache;task.latestOutputPath=j.path;task.latestQA=j.qa;
 if(!candidate){task.originalPlannedPath??=task.path;Object.assign(task,{status:'generated-reviewed-await-adoption',reviewedUsableOutput:true,reviewedRawId:j.key,path:j.path,source:j.sourceCache,sha256,actualSubmittedInputs:inputs});}else{task.status='candidate-needs-correction';task.reviewedUsableOutput=false;}
 p.actualGeneratedFromThisPlan=read('桥口五项参考原图清单V24.json').length+read('桥口五项参考候选原图清单V24.json').length;p.reviewedUsableTaskOutputs=p.jobs.filter(x=>x.reviewedUsableOutput).length;p.status=p.reviewedUsableTaskOutputs===p.jobs.length?'generated-reviewed-await-adoption':'in-progress-generation';
 p.workflow='按实际输出/QA/采用登记；原V18失败调用是历史记录，不将当前任务JSON当作仍运行的生成句柄。';fs.writeFileSync(planFile,JSON.stringify(p,null,2)+'\n');console.log(JSON.stringify(record));return record;
};

