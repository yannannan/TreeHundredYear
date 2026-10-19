// 仅维护当前使用阶段；不重写原图、文件名、历史生成提示词或QA。
const migration=require('./第二集参考范围迁移V31.json');
module.exports=e=>{const m=migration.entries.find(x=>x.id===e.id&&x.path===e.path);return m?{...e,targets:m.currentTargets,purpose:m.currentPurpose,phase:m.currentPhase}:e;};
