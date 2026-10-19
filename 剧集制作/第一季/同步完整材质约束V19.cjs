const fs=require('fs'),path=require('path'),crypto=require('crypto');
const dir=__dirname,root=path.resolve(dir,'../..');
const anchor='必须保留本段已经发生且有剧情用途的局部故障：';
const rule='非剧情破损收敛（2026-10-19）：正常使用的地坪、台阶、栏杆、立柱、门框与机关外壳以完整、细磨、接合严密为默认状态；台阶保留正常分级，板缝表现为规整施工接缝，不画成随机深裂缝。删除无剧情依据的密集缺角、坑洞、起翘铺石、崩边栏杆、碎渣堆、墙面黑污与普遍锈斑，尤其避免前景大面积粗糙破石主导视觉。自然山岩可保留自然纹理；正在发生的落石、真实断口、危险缺口和已定事故战损按本段原位置保留。年代感用细刻纹、深浅层次、厚实材质及少量缝内包浆表现，建筑仍显工艺精良、可正常运行；低饱和、完整和精致不靠把画面改成白金仙宫或多彩霓虹实现。';
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const files=[path.join(dir,'全剧通用提示词.md'),path.join(dir,'同步精工克制美术基线V2.cjs')],ledgers=[];
for(let n=1;n<=32;n++){const id=String(n).padStart(2,'0'),v=n===1?'V2':'V1',file=path.join(dir,'第'+id+'集/执行包'+v+'/连续性与参考校核'+v+'.json');const b=fs.readFileSync(file);ledgers.push({path:path.relative(root,file).replaceAll('\\','/'),sha256:hash(b)});for(const s of JSON.parse(b).segments)files.push(path.join(root,s.prompt||s.promptFile));}
const scene=path.join(root,'场景资产/第一季/九层星渊塔');
for(const name of fs.readdirSync(scene))if(/^SC-L\d{2}_.*_场景与15秒建立提示词V2\.md$/.test(name))files.push(path.join(scene,name));
if(files.length!==325)throw Error('预期母版/历史同步器2+313段+10建立文本，共325文件，实际'+files.length);
const prepared=files.map(file=>{const before=fs.readFileSync(file,'utf8');if(!before.includes(anchor))throw Error('缺少美术锚点 '+file);const after=before.includes(rule)?before:before.replace(anchor,rule+'\n'+anchor);return{file,before,after};});
for(const p of prepared)if(p.before!==p.after)fs.writeFileSync(p.file,p.after);
for(const l of ledgers)if(hash(fs.readFileSync(path.join(root,l.path)))!==l.sha256)throw Error('不应改变台账 '+l.path);
const result={date:'2026-10-19',scope:'仅收敛非剧情破损的文字约束；不是图片修订完成证明',baselineCommit:'7fb07fe12c434514d3586031d0d0ce3d6387c52a',checkedFiles:files.length,segmentPrompts:313,establishingPrompts:10,rulePresentInAll:true,ledgersUnchanged:true,imageFilesModified:0,newImagesGenerated:0,actualVideoGenerated:false,files:prepared.map(p=>({path:path.relative(root,p.file).replaceAll('\\','/'),sha256:hash(fs.readFileSync(p.file))}))};
fs.writeFileSync(path.join(dir,'完整材质约束文字同步V19.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({...result,files:undefined}));

