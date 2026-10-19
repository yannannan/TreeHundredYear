// Restore current reference copies from the adopted source. Never regenerate prompts or replay prior versions.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const index=read('文档/当前交付索引.json');let restored=0,unchanged=0;
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const e of index.episodes)for(const s of read(e.ledger).segments)for(const r of s.refs){
 const f=s.prompt||s.promptFile,src=path.resolve(root,r.source),dest=path.resolve(root,path.dirname(f),r.file);
 for(const target of [src,dest]){const rel=path.relative(root,target);if(!rel||rel.startsWith('..')||path.isAbsolute(rel)||rel.split(path.sep)[0]==='.git')throw Error('引用路径越界');}
 const bytes=fs.readFileSync(src);if(hash(bytes)!==r.sha256.toLowerCase())throw Error('当前源图已变，请先明确修订账本与提示词：'+r.source);
 if(fs.existsSync(dest)&&hash(fs.readFileSync(dest))===r.sha256.toLowerCase()){unchanged++;continue;}
 fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,bytes);restored++;
}
console.log(JSON.stringify({restored,unchanged,promptsOverwritten:0,independentAudioGenerated:false}));
