// 历史原图/QA保留；当前真锚局部随完整事件移至05-03。
const migration=require('./第五集参考范围迁移V32.json');
module.exports=e=>{const m=migration.entries.find(x=>x.id===e.id&&x.path===e.path);return m?{...e,targets:m.currentTargets,purpose:m.currentPurpose,phase:m.currentPhase}:e;};
