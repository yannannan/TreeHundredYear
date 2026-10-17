const fs=require('fs'),path=require('path'),crypto=require('crypto');
const dir=__dirname,root=path.resolve(dir,'../../..');
const errors=[];
const files=fs.readdirSync(dir),docs=files.filter(p=>p.includes('_场景与15秒建立提示词V2.md'));
const common=fs.readFileSync(path.join(root,'剧集制作/第一季/全剧通用提示词.md'),'utf8').match(/```text\s*([\s\S]*?)```/)[1].trim();
for(const p of docs){const s=fs.readFileSync(path.join(dir,p),'utf8');const body=s.match(/```text\s*([\s\S]*?)```/);if(!body||!body[1].startsWith(common))errors.push(p+'未完整嵌入通用正文');if(!s.includes('15秒'))errors.push(p+'缺时长');if(!s.includes('无字幕'))errors.push(p+'缺无台词字幕说明');}
if(docs.length!==10)errors.push('完整建立提示词不是10份');
const layouts=files.filter(p=>/-LAYOUT02_行动布局V2_4K\.png$/.test(p));
const manifest=layouts.map(p=>{const b=fs.readFileSync(path.join(dir,p)),w=b.readUInt32BE(16),h=b.readUInt32BE(20);if(w!==3840||h!==2160)errors.push(p+'非3840x2160');return{file:p,width:w,height:h,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')};});
if(layouts.length!==9)errors.push('新增布局不是9份');
const s8=fs.readFileSync(path.join(dir,'SC-L08-LAYOUT02_行动布局V2.svg'),'utf8');if((s8.match(/rx="35"/g)||[]).length!==12)errors.push('八层布局不是12个编号舱');
const s9=fs.readFileSync(path.join(dir,'SC-L09-LAYOUT02_行动布局V2.svg'),'utf8');if((s9.match(/<ellipse /g)||[]).length!==9)errors.push('九层布局不是9环');
for(const p of [...docs,'九层星渊塔_全塔场景制作执行总册V2.md']){const t=fs.readFileSync(path.join(dir,p),'utf8');for(const m of t.matchAll(/\]\(([^)]+)\)/g)){const target=m[1];if(!/^https?:/.test(target)&&!target.startsWith('#')&&!fs.existsSync(path.resolve(dir,target)))errors.push(p+'缺链接 '+target);}}
const r={date:'2026-10-17',promptCount:docs.length,newLayoutCount:layouts.length,layoutCanvas:[3840,2160],scope:'文字、文件存在、像素、SVG对象数量检查；不替代写实图目视验数、演员走位或视频动态验证',errors,layouts:manifest};
fs.writeFileSync(path.join(dir,'全塔文件与像素验收V2.json'),JSON.stringify(r,null,2));console.log(JSON.stringify(r));if(errors.length)process.exit(1);
