# CLAUDE.md

本文件定义 agent 进入、探索、理解和修改本 repository 的最小规则

项目索引从 `docs/INDEX.md` 开始查找

## 核心原则

1. repository 是项目事实来源；有证据时不要猜测
2. 只读取当前 task 需要的最小相关 context，按需渐进加载
3. 用最少的代码解决当前问题，不要 over-engineering
4. 如果不确定，询问而不是猜测，当存在歧义时，不要默默选择
5. 完成 task 后，更新相关的 docs

## 探索规则

1. 先阅读本文件
2. 阅读 `docs/INDEX.md`，判断需要哪些 project docs
3. 只读取与当前 task 相关的 docs 和 files
4. 总结已发现的 context，再提出修改方案

不要默认读取所有 docs，渐进式加载

## 文档更新规则

1. 如果 task 产生新的 durable project knowledge，需要写回 docs 中相关文档
2. 按照 `docs/playbooks/task-memory.md` 更新 task memory
3. 小型文档调整、规则措辞调整、问答或无代码变更的小任务默认不创建 task memory，除非用户明确要求
4. 新的 durable project knowledge 仍然写回相关 docs，不要只写在 task memory

## 结束说明

每个 task 结束时，简要说明：

1. 完成工作
2. 修改的文件
3. 验证结果
4. 后续跟进
