const fs=require('fs'),path=require('path'),cp=require('child_process');
const root=path.resolve(__dirname,'../..'),read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,p),'utf8')),errors=[];
let checkedSegments=0,checkedPurposeRows=0;
const selectedPaths=new Set([...read('塔外开篇精工修订原图清单V13.json').map(r=>r.path),...read('塔外空鞘接触原图视检任务V13.json').map(r=>r.path)]);
for(let n=1;n<=32;n++){const id=String(n).padStart(2,'0'),v=n===1?'V2':'V1',p='剧集制作/第一季/第'+id+'集/执行包'+v+'/连续性与参考校核'+v+'.json',r=cp.spawnSync('git',['show','42cd229:'+p],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});if(r.status!==0)throw Error(r.stderr);const old=JSON.parse(r.stdout),now=JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));for(const s of now.segments){const prompt=fs.readFileSync(path.join(root,s.prompt||s.promptFile),'utf8');for(const r of s.refs){if(!selectedPaths.has(r.source))continue;const marker=r.file+'：',rows=prompt.split('\n').filter(line=>{const at=line.indexOf(marker);return at>=0&&/^[ \t]*(?:\d+[.)、]\s*|[-*]\s*)?$/.test(line.slice(0,at));});if(rows.length!==1||!rows[0].includes(r.purpose))errors.push('用途未准确绑定当前图片行 '+id+'-'+s.n+' '+r.file);checkedPurposeRows++;}}for(const s of old.segments)delete s.refs;for(const s of now.segments)delete s.refs;if(JSON.stringify(old)!==JSON.stringify(now))errors.push('除参考以外的剧情字段变化 '+id);checkedSegments+=now.segments.length;}
const raw=read('塔外开篇精工修订原图清单V13.json'),jobs=read('塔外开篇精工修订生成归档V13.json'),maps=read('精工克制场景采用映射V2.json').filter(m=>m.sourceCatalog==='塔外开篇精工修订原图清单V13.json'),candidates=read('塔外开篇修订候选原图清单V13.json');
if(raw.length!==13||jobs.length!==13||maps.length!==13||candidates.length!==2)errors.push('本批应13采用/2候选');
const targets=maps.flatMap(m=>m.expectedTargets),segments=[...new Set(targets)].sort(),resolve=require('./解析当前场景参考V1.cjs');
if(targets.length!==25||segments.length!==17)errors.push('本批应17段25替换引用');
const kept=read('场景原图合规视检登记V1.json').find(r=>r.id==='OUT-SCABBARD-CONTACT-ASIS-V13');
if(!kept||kept.imageEdited||kept.generatedThisBatch||JSON.stringify(kept.expectedTargets)!=='["02-01"]')errors.push('空鞘原图保留登记错误');
const through=kept&&resolve({path:kept.path,purpose:'只锁空鞘与两只手握持接触/袖口材质，不决定全身左右手姿态或承重是否安全。'});
if(!through||through.purpose.includes('旧尺度场景待按')||!through.purpose.includes(kept.review))errors.push('原图合规解析仍带过期待审标记');
const out={date:'2026-10-19',baseline:'42cd229',checkedSegments,checkedPurposeRows,newRefinedImages:raw.length,archivedRejectedVariants:candidates.length,actualNewGeneratedOutputs:raw.length+candidates.length,newCopiedPlacements:targets.length,updatedSegmentCount:segments.length,updatedSegments:segments,keptUneditedImagesThisBatch:1,keptUneditedPlacementsThisBatch:1,dialogueFirstLastAndOtherNonReferenceLedgerFieldsUnchanged:errors.length===0,actualVideoGenerated:false,errors};
fs.writeFileSync(path.join(__dirname,'塔外开篇修订剧情与引用复核V13.json'),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out));if(errors.length)process.exitCode=1;

