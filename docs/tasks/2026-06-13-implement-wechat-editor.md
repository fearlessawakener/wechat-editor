# Task: 按 roadmap 实现微信公众号编辑器

## Goal

按 `docs/roadmap.md` 从零实现微信公众号在线编辑器：Markdown 输入 → 实时渲染为
inline style HTML → 一键复制到公众号。覆盖 Phase 0~8。

## Context

- `docs/roadmap.md`：分 9 个 phase（0~8）的开发规划
- `docs/architecture.md`：技术栈与模块划分，本次补充了「关键实现决策」一节
- `docs/overview.md`：产品能力（图片上传已应用户要求移除）
- 核心约束：微信正文必须 inline style，无 class/`<style>`/JS

## Files Changed

脚手架与配置：
- `package.json`、`tsconfig*.json`、`vite.config.ts`、`eslint.config.js`、
  `.prettierrc.json`、`index.html`、`.gitignore`

源码（按模块）：
- `src/editor/MarkdownEditor.tsx`：CodeMirror 6 受控封装
- `src/markdown-core/`：`render.ts`（unified 管线 → hast）、`sanitize-schema.ts`
  （放行 style、移除 class）、`to-react.tsx`、`format.ts`
- `src/themes/`：`tokens.ts`、`types.ts`、`themes.ts`（3 套主题）、
  `style-utils.ts`、`apply-theme.ts`（inline 注入 + 删 class）、
  `highlight.ts`（lowlight 高亮 inline 化）、`highlight-colors.ts`、`render-themed.ts`
- `src/clipboard/copy.ts`：Clipboard API + execCommand 降级
- `src/storage/`：`draft.ts`（localStorage）、`useDebouncedSave.ts`
- `src/checker/`：`rules.ts`、`check.ts`、`types.ts`（可扩展规则集）
- `src/app/`：`App.tsx`、`Toolbar.tsx`、`Preview.tsx`、`CompatibilityBar.tsx`、
  `TuningPanel.tsx`、`useThemedRender.ts`、`ErrorBoundary.tsx`
- 各模块 `*.test.ts`：共 37 个单测

文档：
- `docs/architecture.md`：补「关键实现决策」
- `README.md`：功能、技术栈、开发与部署说明

## Validation

- `npm test`：37 passed（render/themes/clipboard/storage/checker）
- `npm run lint`：无错误
- `npm run build`：成功，无 chunk 体积告警（manualChunks 分包 + 移除
  language-data + lowlight 按需语言）
- `npm run dev`：可启动

## Not Validated

- 真实微信公众号后台粘贴效果：jsdom/构建无法模拟，需人工把复制结果粘贴到
  公众号编辑器确认排版。
- 浏览器真实剪贴板权限路径：单测以 mock 覆盖，未在真实浏览器逐一验证。

## Decisions

见 `docs/architecture.md` 的「关键实现决策」（统一 hast、渲染顺序、inline 优先级、
微调 overrides、复制降级、编辑器不加载 language-data、lowlight 按需注册）。

编辑器状态管理：用 App 顶层 useState，未引入额外 store（规模不需要）。

## Follow-ups

- 人工验证公众号粘贴效果，必要时按真实表现调整主题/兼容规则
- 可选：CodeMirror chunk 仍 ~500kB，如需进一步瘦身可考虑路由级懒加载
- 可选：增加更多主题、表格/代码块更多样式细节
- 可选：a11y 与键盘可访问性进一步打磨（Phase 8 已做基础错误边界）
