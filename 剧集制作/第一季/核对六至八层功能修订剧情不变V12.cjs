const fs=require('fs'),path=require('path'),cp=require('child_process');
const root=path.resolve(__dirname,'../..'),read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,p),'utf8')),errors=[];
let checkedSegments=0;
for(let n=1;n<=32;n++){const id=String(n).padStart(2,'0'),v=n===1?'V2':'V1',p='剧集制作/第一季/第'+id+'集/执行包'+v+'/连续性与参考校核'+v+'.json',r=cp.spawnSync('git',['show','3189e0e:'+p],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});if(r.status!==0)throw Error(r.stderr);const old=JSON.parse(r.stdout),now=JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));for(const s of old.segments)delete s.refs;for(const s of now.segments)delete s.refs;if(JSON.stringify(old)!==JSON.stringify(now))errors.push('除参考以外的剧情字段发生变化 '+id);checkedSegments+=now.segments.length;}
const raw=read('六至八层功能精工修订原图清单V12.json'),jobs=read('六至八层功能精工修订生成归档V12.json'),maps=read('精工克制场景采用映射V2.json').filter(m=>m.sourceCatalog==='六至八层功能精工修订原图清单V12.json'),candidates=read('六至八层功能修订候选原图清单V12.json');
if(raw.length!==8||jobs.length!==8||maps.length!==8||candidates.length!==2)errors.push('本批应8采用/2候选');
const targets=maps.flatMap(m=>m.expectedTargets),segments=[...new Set(targets)].sort(),resolve=require('./解析当前场景参考V1.cjs');
if(targets.length!==49||segments.length!==41)errors.push('本批应41段49替换引用');
const closed=maps.find(m=>m.id==='L06-GATE-CLOSED-REFINED-R4'),through=closed&&resolve({path:closed.origin,purpose:'闭态环境'});
if(!through||!through.purpose.includes('精工克制R4当前采用'))errors.push('闭门R4版本解析错误');
const out={date:'2026-10-19',baseline:'3189e0e',checkedSegments,newRefinedImages:raw.length,archivedRejectedVariants:candidates.length,newCopiedPlacements:targets.length,updatedSegmentCount:segments.length,updatedSegments:segments,dialogueFirstLastAndOtherNonReferenceLedgerFieldsUnchanged:errors.length===0,actualVideoGenerated:false,errors};
fs.writeFileSync(path.join(__dirname,'六至八层功能修订剧情与引用复核V12.json'),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out));if(errors.length)process.exitCode=1;

