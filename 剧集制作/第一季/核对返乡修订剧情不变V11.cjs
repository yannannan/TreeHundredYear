const fs=require('fs'),path=require('path'),cp=require('child_process');
const root=path.resolve(__dirname,'../..'),read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,p),'utf8')),errors=[];
let checkedSegments=0;
for(let n=1;n<=32;n++){const id=String(n).padStart(2,'0'),v=n===1?'V2':'V1',p='剧集制作/第一季/第'+id+'集/执行包'+v+'/连续性与参考校核'+v+'.json',r=cp.spawnSync('git',['show','7f20fd8:'+p],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});if(r.status!==0)throw Error(r.stderr);const old=JSON.parse(r.stdout),now=JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));for(const s of old.segments)delete s.refs;for(const s of now.segments)delete s.refs;if(JSON.stringify(old)!==JSON.stringify(now))errors.push('除参考以外的剧情字段发生变化 '+id);checkedSegments+=now.segments.length;}
const raw=read('返乡与检修精工修订原图清单V11.json'),jobs=read('返乡与检修精工修订生成归档V11.json'),maps=read('精工克制场景采用映射V2.json').filter(m=>m.sourceCatalog==='返乡与检修精工修订原图清单V11.json');
if(raw.length!==11||jobs.length!==11||maps.length!==11)errors.push('本批应11真实修订原图');
const targets=maps.flatMap(m=>m.expectedTargets),segments=[...new Set(targets)].sort();
if(targets.length!==12||segments.length!==6)errors.push('本批应6段12替换引用');
const kept=read('场景原图合规视检登记V1.json').find(r=>r.id===read('父女返乡原图视检任务V1.json')[0].id);
if(!kept||kept.imageEdited||kept.generatedThisBatch||kept.expectedTargets.length!==1)errors.push('父女原图保留登记错');
const out={date:'2026-10-19',baseline:'7f20fd8',checkedSegments,newRefinedImages:raw.length,newCopiedPlacements:targets.length,updatedSegments:segments,keptUneditedImagesThisBatch:1,keptUneditedPlacementsThisBatch:kept?.expectedTargets.length||0,dialogueFirstLastAndOtherNonReferenceLedgerFieldsUnchanged:errors.length===0,actualVideoGenerated:false,errors};
fs.writeFileSync(path.join(__dirname,'返乡修订剧情与引用复核V11.json'),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out));if(errors.length)process.exitCode=1;

