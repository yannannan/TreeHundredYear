const fs=require('fs'),path=require('path');
const ep=require('./第二集执行数据V31.cjs');
require('./逐段执行包生成器V1.cjs')(ep);
// 通用生成器在用途后补句号；已有带句号的当前道具用途只保留一次，供V20严格匹配。
const root=path.resolve(__dirname,'../..'),lf=path.join(__dirname,'第02集/执行包V1/连续性与参考校核V1.json');
const ledger=JSON.parse(fs.readFileSync(lf,'utf8'));
for(const s of ledger.segments){let body=fs.readFileSync(path.join(root,s.prompt),'utf8');for(const r of s.refs)if(r.source.startsWith('道具资产/')&&r.purpose.endsWith('。'))body=body.replace(r.file+'：'+r.purpose+'。',r.file+'：'+r.purpose);fs.writeFileSync(path.join(root,s.prompt),body);}
require('./应用全季混合道具引用V20.cjs')();
const stats=require('./当前执行包统计V31.cjs')(),guide=path.join(__dirname,'第02集/执行包V1/第二集执行清单V1.md');
let text=fs.readFileSync(guide,'utf8');text+='\nV31当前：第二集9段135秒、'+stats.episodes['02'].referenceCopies+'份参考。原02段拆为攀回与再生对白两段，旧03—08顺延04—09；原图文件名保留历史段号，使用阶段以当前提示词为准。旧V14—V18及V24静态按V31范围迁移，不重生成图片。实际动作、普通话、字幕及成片未验。\n';fs.writeFileSync(guide,text);

// V24按明确时点接入桥口五项静态，后置于旧批次用途/缺项写入。
require('./采用桥口五项参考V24.cjs')();

// V25开场局部状态，后置于V24旧缺项写入。
require('./采用第三集开场接触V25.cjs')();

// V26侧向重力/右掌阶段，后置于V24/V25旧缺项和指南写入。
require('./采用第三集侧向重力接触V26.cjs')();
