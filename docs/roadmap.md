# 开发规划 (Roadmap)

本文件指导 agent 渐进式开发本项目。

它把 `docs/architecture.md` 中的模块拆解为有依赖关系、可独立验证的开发阶段（phase）。
每个 phase 都遵循「先读相关 context → 实现 → 验证 → 记录 task memory」的流程。

## 如何使用本文件

1. 先确认当前要做哪个 phase，phase 之间存在依赖，原则上顺序推进
2. 只读取该 phase「关键 context」列出的文档和源码，不要默认读取整个仓库
3. 实现完成后执行该 phase 的「验证」，通过后再进入下一个 phase
4. 若 phase 产生 durable decision，写回 `docs/architecture.md` 或相关 docs
5. 完成实质性工作后，按 `docs/playbooks/task-memory.md` 记录 task memory

## 贯穿全程的核心约束

这条约束影响几乎所有 phase，开发时必须始终牢记：

> 微信公众号正文必须是 **inline style HTML**，不能使用 CSS class、`<style>` 标签、外部样式表，也不能依赖 JS。

由此推导出的设计主线：

- `themes` 不能输出 CSS class，主题必须表达为「每类节点 → style 声明」的映射
- `markdown-core` 渲染链路的**最后一步**是把主题样式注入到每个 HTML 节点的 `style` 属性
- 预览区（preview）和最终复制产物（export）应共用同一套渲染结果，避免「预览正常、粘贴错乱」
- 任何 phase 引入新语法或新节点类型，都要同步在 themes 中补齐对应样式，否则该节点在微信端会丢失排版

## 阶段总览

```text
Phase 0  项目脚手架
Phase 1  双栏编辑器骨架        ← editor
Phase 2  Markdown 渲染管线      ← markdown-core
Phase 3  主题系统与 inline 注入 ← themes (核心难点)
Phase 4  复制到剪贴板          ← clipboard
Phase 5  草稿自动保存          ← storage
Phase 6  微信兼容性检查        ← checker
Phase 7  主题实时微调 UI        ← themes 增强
Phase 8  打磨与发布
```

依赖关系：Phase 2 依赖 1；Phase 3 依赖 2；Phase 4 依赖 3；Phase 5/6 依赖 4；Phase 7 依赖 3+6；Phase 8 收尾。
Phase 5、6 之间相互独立，可按需调整顺序。

---

## Phase 0 — 项目脚手架

**目标**：建立可运行的 Vite + React + TypeScript 工程，约定目录结构与代码规范。

**关键 context**：`docs/architecture.md` 的技术栈与模块清单。

**产出**：
- Vite + React + TS 工程，`npm run dev` 可启动空白页
- 按模块划分源码目录骨架：
  ```text
  src/
    editor/
    markdown-core/
    themes/
    clipboard/
    storage/
    checker/
    app/          # 顶层布局与组装
  ```
- 配置 ESLint + Prettier + TypeScript strict
- 配置测试框架 Vitest（后续 phase 的单测依赖它）
- 在各模块目录放置占位 `index.ts` 与简短说明

**验证**：`npm run dev` 启动成功；`npm run build`、`npm run lint`、`npm test` 均可执行（即使测试为空）。

---

## Phase 1 — 双栏编辑器骨架 (editor)

**目标**：左侧 Markdown 输入，右侧预览占位，布局可用。

**关键 context**：`docs/overview.md` 的「Markdown编辑器」一节。

**产出**：
- 集成 CodeMirror 6，支持 Markdown 语法高亮
- 左右双栏布局，可调分栏（或固定 50/50 起步）
- 编辑器内容通过 React state 向上传递，右侧先用 `<pre>` 原样回显
- 顶部预留工具栏占位（格式化、复制、主题选择，后续 phase 填充）

**验证**：输入 Markdown 文本，右侧实时回显；窗口缩放布局不破。

**Decisions 待定**：编辑器状态管理方式（本地 state vs 轻量 store），在本 phase 决定并记录。

---

## Phase 2 — Markdown 渲染管线 (markdown-core)

**目标**：把 Markdown 转换为**安全的** HTML AST，右侧预览渲染真实 HTML。

**关键 context**：`docs/architecture.md` 核心链路图；本文件「核心约束」。

**产出**：
- 基于 `unified` 搭建 `remark-parse → remark-rehype → rehype-sanitize → rehype-stringify` 管线
- `rehype-sanitize` 使用白名单 schema，明确允许微信支持的标签/属性
- 支持基础 Markdown：标题、段落、列表、引用、链接、行内代码、**代码块**、表格、分割线、图片
- 渲染产物以 HTML AST（hast）形式暴露，供 Phase 3 注入 style；预览区渲染该 AST
- 提供「一键格式化」（如 `prettier` 或 `remark` 格式化 Markdown 源文本）

**验证**：单测覆盖各类 Markdown 元素的解析输出；预览区正确渲染；恶意输入（如 `<script>`）被 sanitize 移除。

**Decisions 待定**：渲染产物在 preview 与 export 之间如何共用（建议统一产出 hast，再分别 stringify）。

---

## Phase 3 — 主题系统与 inline 注入 (themes) — 核心难点

**目标**：实现「主题 → inline style」机制，预览即所见即所得，且产物为纯 inline style HTML。

**关键 context**：`docs/overview.md` 的「样式主题」「微信公众号适配层」；本文件「核心约束」。

**产出**：
- 定义主题数据结构：按节点类型（h1~h6、p、blockquote、ul/ol/li、code、pre、a、img、hr、table 等）声明 style 键值
- 主题需包含可参数化的 token：字体 family、字号、主色、文字色、行高、段间距等（为 Phase 8 微调铺路）
- 实现 inline 注入步骤：遍历 Phase 2 的 hast，按节点类型把主题 style 合并进每个节点的 `style` 属性，输出不含 class 的 HTML
- 内置 3~5 套主题，含**代码块样式**（代码高亮在 inline 约束下的方案需在此决策）
- 顶部工具栏接入主题切换，切换后预览立即生效

**验证**：切换主题预览即时变化；导出 HTML 中**不存在** class、`<style>`、外链样式；代码块在主题下样式正确。

**Decisions 待定**：
- 代码高亮方案——微信不支持 `<style>`，需在 token 级别把高亮色写成 inline（如用 lowlight 产出 hast 后逐节点注入色值）
- style 合并优先级（节点自带 vs 主题 vs 用户微调）

---

## Phase 4 — 复制到剪贴板 (clipboard)

**目标**：一键把渲染产物作为 `text/html` 写入剪贴板，可直接粘贴进公众号后台。

**关键 context**：Phase 3 的 inline HTML 产物。

**产出**：
- 基于 Clipboard API 写入 `text/html`（同时写 `text/plain` 兜底）
- 工具栏「一键复制」按钮，含成功/失败反馈
- 处理浏览器权限与降级（不支持时提供手动复制弹层）

**验证**：复制后粘贴到公众号编辑器（或富文本目标）排版保持；在主流浏览器验证权限路径。

**Not Validated 提示**：真实公众号后台粘贴需人工验证，记录在 task memory。

---

## Phase 5 — 草稿自动保存 (storage)

**目标**：编辑内容与主题选择自动持久化，刷新不丢失。

**关键 context**：`docs/overview.md`「自动保存草稿」。

**产出**：
- 基于 localStorage 保存 Markdown 源文本、当前主题、微调参数
- 防抖自动保存 + 手动保存入口
- 启动时恢复上次草稿；提供清空/新建

**验证**：编辑后刷新页面内容与主题恢复；防抖不造成卡顿。

---

## Phase 6 — 微信兼容性检查 (checker)

**目标**：在复制前检查产物是否符合微信约束，给出可读提示。

**关键 context**：本文件「核心约束」；公众号已知排版限制。

**产出**：
- 检查规则集：是否残留 class/`<style>`、是否含不支持标签、表格等高风险元素提示
- 在 UI 给出 warning 列表，不阻断但提醒
- 规则以可扩展结构组织，便于后续新增

**验证**：构造违例输入触发对应 warning；正常输入无误报。

---

## Phase 7 — 主题实时微调 UI (themes 增强)

**目标**：用户可实时调整字体、字号、颜色、间距等，预览即时反映。

**关键 context**：Phase 3 的主题 token；`docs/overview.md`「主题样式可以实时微调」。

**产出**：
- 微调面板，绑定 Phase 3 定义的 token
- 调整后实时重渲染预览，并参与导出
- 微调参数随草稿持久化（接 Phase 5）

**验证**：调整任一 token 预览即时变化且导出生效；刷新后微调恢复。

---

## Phase 8 — 打磨与发布

**目标**：体验、性能、可访问性与构建产物收尾。

**产出**：
- 大文档渲染性能优化（必要时对渲染管线做防抖/增量）
- 键盘可访问性与基础 a11y
- 错误边界与空状态
- 构建产物与部署说明

**验证**：`npm run build` 产物可部署；主流程端到端走通一遍。

---

## 每个 phase 的收尾清单

- [ ] 该 phase「验证」全部通过
- [ ] 新增/变更的节点类型已在 themes 补齐样式（若涉及）
- [ ] durable decision 已写回相关 docs
- [ ] 按 `docs/playbooks/task-memory.md` 记录 task memory
