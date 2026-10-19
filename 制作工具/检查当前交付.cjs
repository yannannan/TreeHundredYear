// Inspect the current editable delivery only. No historical generators, audio or video production.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/^\uFEFF/,'');
const json=p=>JSON.parse(read(p));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const errors=[],warnings=[],seen=new Set(),sourceHashes=new Map();
const index=json('文档/当前交付索引.json');
const common=read('剧集制作/第一季/全剧通用提示词.md').match(/```text\s*([\s\S]*?)```/)?.[1].trim();
let total=0,seconds=0,copies=0,previousEnd=null,previousEpisode=null,previousScene=null;
const resolve=(base,f)=>path.resolve(root,base,f);
function inside(f){const r=path.relative(root,f);return r&&!r.startsWith('..')&&!path.isAbsolute(r)&&r.split(path.sep)[0]!=='.git';}
function imageHash(f){if(!sourceHashes.has(f))sourceHashes.set(f,hash(fs.readFileSync(path.join(root,f))));return sourceHashes.get(f);}
for(const e of index.episodes){
 const o=json(e.ledger),source=read(e.script),budget=source.match(/成片预算(\d+)秒/);
 if(!budget||+budget[1]!==o.seconds||e.seconds!==o.seconds||o.seconds>180||o.seconds!==o.segments.length*15||e.segments!==o.segments.length)errors.push(e.episode+'集时长或源剧本预算不一致');
 let n=0,refs=0;
 for(const s of o.segments){
  if(s.n!==++n)errors.push(e.episode+'段号不连续');
  const f=s.prompt||s.promptFile;if(seen.has(f))errors.push('重复提示词：'+f);seen.add(f);
  const text=read(f),blocks=[...text.matchAll(/```text\s*([\s\S]*?)```/g)],body=blocks[0]?.[1]||'';
  if(blocks.length!==1||!common||!body.includes(common))errors.push(f+'缺单一完整通用正文');
  if(/\bundefined\b|\bNaN\b|\[object Object\]/.test(body))errors.push(f+'存在未展开字段');
  let t=0;const timeline=body.match(/【0—15秒[^】]*】\s*([\s\S]*?)\n\n【/);
  if(!timeline)errors.push(f+'缺时间轴');else for(const m of timeline[1].matchAll(/^(\d+)—(\d+)秒/gm)){if(+m[1]!==t||+m[2]<=t)errors.push(f+'时间轴不连续');t=+m[2];}
  if(t!==15)errors.push(f+'时间轴未覆盖15秒');
  const changed=s.sceneId&&previousScene&&previousEpisode===e.episode&&s.sceneId!==previousScene;
  if(previousEnd!==null&&s.start!==previousEnd&&!s.sceneCut&&!changed)errors.push(e.episode+'-'+s.n+'首尾断裂但没有说明切场');
  previousEnd=s.end;previousScene=s.sceneId||null;previousEpisode=e.episode;
  let speechEnd=0;const names={A:'周辰',B:'苏晚',C:'摊主',D:'老人',...(o.voiceNames||{})};
  for(const l of s.lines||[]){if(names[l[0]]!==l[1]||l[2]<speechEnd||l[3]>15||l[3]<=l[2]||!body.includes(l[4]))errors.push(e.episode+'-'+s.n+'对白身份/时码/正文异常');speechEnd=l[3];}
  const filenames=new Set();
  for(const r of s.refs){
   if(filenames.has(r.file))errors.push(f+'重复同名参考');filenames.add(r.file);
   const src=path.resolve(root,r.source),copy=resolve(path.dirname(f),r.file);
   if(!inside(src)||!inside(copy)){errors.push(f+'引用越界');continue;}
   if(!fs.existsSync(src)||!fs.existsSync(copy)){errors.push(f+'参考缺失');continue;}
   const expected=r.sha256.toLowerCase();if(imageHash(r.source)!==expected||hash(fs.readFileSync(copy))!==expected)errors.push(f+'当前源图/副本哈希不同');
   if(r.originalSource||r.previousSource)errors.push(f+'仍含已退役旧版源路径');copies++;refs++;
  }
 }
 if(refs!==e.referenceCopies)errors.push(e.episode+'索引参考数量不一致');total+=o.segments.length;seconds+=o.seconds;
}
if(index.episodes.length!==32||total!==index.segments||seconds!==index.seconds||copies!==index.referenceCopies)errors.push('全季索引统计不一致');
const outline=read('完整剧本/第一季/第一季32集完整剧本总纲（编剧完成版V3）.md');if(+outline.match(/合计(\d+)秒/)?.[1]!==seconds)errors.push('总纲预算不一致');
for(const a of index.assets){
 if(!fs.existsSync(path.join(root,a.path))){errors.push('资产不存在：'+a.path);continue;}
 const b=fs.readFileSync(path.join(root,a.path));if(hash(b)!==a.sha256||b.length!==a.bytes)errors.push('资产哈希/大小异常：'+a.path);
 if(a.path.endsWith('.png')&&(b.readUInt32BE(16)!==a.width||b.readUInt32BE(20)!==a.height))errors.push('PNG像素记录错误：'+a.path);
}
for(const name of ['周辰','苏晚']){
 const m=json(`人物资产/${name}/${name}_16格总板像素与来源V2.json`);
 if(m.tiles.length!==16||m.upscaled||m.mirrored)errors.push(name+'总板结构不符');
 for(const t of m.tiles)if(!fs.existsSync(path.join(root,'人物资产',t.source)))errors.push(name+'总板原图缺失：'+t.source);
}
let links=0,audio=0;const files=[];
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){if(e.name==='.git')continue;const f=path.join(d,e.name);if(e.isDirectory())walk(f);else files.push(f);}}walk(root);
// The report is a current output and is linked by the README/handoff.
const reportPath=path.join(root,'文档/当前交付检查.json');
if(!fs.existsSync(reportPath))fs.writeFileSync(reportPath,'{}\n');
for(const f of files){
 if(/\.(wav|mp3|m4a|aac|flac|ogg)$/i.test(f)){audio++;errors.push('范围外独立音频：'+path.relative(root,f));}
 if(!f.endsWith('.md'))continue;
 const text=fs.readFileSync(f,'utf8');for(const m of text.matchAll(/\[[^\]\n]*\]\(([^\n]*?)\)/g)){
  const t=m[1].trim().replace(/^<|>$/g,'');if(/^(https?:|mailto:|#|app:|codex:)/i.test(t))continue;
  const plain=t.split('#')[0].replace(/:\d+$/,'');let dest=/^[A-Za-z]:[\\/]/.test(plain)?plain:path.resolve(path.dirname(f),plain);
  links++;if(!fs.existsSync(dest))errors.push('本地链接失效：'+path.relative(root,f)+' → '+t);
 }
}
warnings.push('文件、时间轴和哈希检查不等于已完成全季语义导演复核或专用素材补齐。');
const result={date:'2026-10-19',episodes:index.episodes.length,segments:total,seconds,referenceCopies:copies,referencedSourceFiles:sourceHashes.size,currentAssetImages:index.assets.length,localLinksChecked:links,independentAudioFiles:audio,scope:index.scope,errors,warnings,allRequiredShotAssetsComplete:index.allRequiredShotAssetsComplete,projectComplete:false};
fs.writeFileSync(reportPath,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));if(errors.length)process.exitCode=1;
