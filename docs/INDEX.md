# 仓库文档索引

本文件用于指导 agent 渐进式探索本项目。
先用它判断当前 task 需要读取哪些文档和源码，不要默认读取整个仓库。

## 读取顺序

1. 先读根目录 `CLAUDE.md`，确认全局行为规则
2. 再读本文件，选择与当前 task 相关的入口
3. 如果要修改某个目录，检查该目录或父目录是否存在更近的 `CLAUDE.md`
4. 只读取相关源码、测试和文档；发现信息不足时再继续加载
5. 修改前简要说明已确认的 context、计划和验证方式

## 文档索引

- `docs/overview.md`：项目总介绍。
- `docs/architecture.md`：技术栈、架构。
- `docs/roadmap.md`：开发规划，按 phase 指导 agent 渐进式开发。
- `docs/playbooks/task-memory.md`：task memory 操作手册。
