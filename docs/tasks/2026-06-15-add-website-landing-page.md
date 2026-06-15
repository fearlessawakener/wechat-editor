# Task: 新增官网落地页（单页 → Vite MPA）

## Goal

项目原本只有编辑器一个页面。本次新增一个官网落地页（照 `design/website.png` 制作），
用户在官网点击按钮可在新标签页打开编辑器页面。

## Context

- `docs/INDEX.md`、`docs/overview.md`、`docs/architecture.md`：确认技术栈为
  Vite + React + TS，原为单页（`index.html` → `src/main.tsx` → `app/App`），无路由库。
- `design/website.png`：微信绿主色落地页，结构为 导航栏 → Hero → 产品截图 →
  功能特性分栏 → 功能卡片 → CTA → Footer。
- `src/app/App.tsx`、`Toolbar.tsx`：现有编辑器入口与组件样式风格。

## Files Changed

- `index.html`：改为官网入口，指向 `src/website-entry.tsx`。
- `editor.html`（新增）：编辑器入口，指向 `src/editor-entry.tsx`。
- `src/editor-entry.tsx`（新增，由原 `src/main.tsx` 迁移而来）。
- `src/main.tsx`（删除）。
- `src/website-entry.tsx`（新增）：官网入口。
- `src/website/Website.tsx`（新增）：官网组件。
- `src/website/website.css`（新增）：官网样式（class + hover + 响应式）。
- `vite.config.ts`：新增 `build.rollupOptions.input`（`index` + `editor` 双入口）。
- `docs/architecture.md`：补充「页面结构（Vite MPA）」与 website 模块说明。

## Validation

- `npm run build`：成功，产出 `dist/index.html` + `dist/editor.html` 两页。
- `npm run lint`：无错误。
- `npm test`：8 文件 83 测试全部通过。
- dev server：`/` 返回官网 title，`/editor.html` 返回编辑器 title，均正常。

## Not Validated

- 浏览器内官网视觉与 `design/website.png` 的逐像素一致性未做人工比对；
  产品截图区为 CSS 仿真编辑器界面（非真实截图）。
- 不同浏览器下 `window.open(..., '_blank')` 弹窗拦截行为未实测。

## Decisions

- 采用 **Vite MPA**（多 HTML 入口）而非引入前端路由库：需求是「打开一个新的编辑器
  页面」，MPA 下两页独立打包、官网不背负编辑器依赖，最贴合且零新增依赖。已写回
  `docs/architecture.md`。
- 官网用常规 CSS class，「微信正文仅 inline style」约束只作用于编辑器导出产物，不约束
  官网自身。

## Follow-ups

- 如需真实产品截图替换 Hero 下方的 CSS 仿真界面，放入 `design/` 或 `public/` 后替换。
- 官网文案（功能数量、版权年份）可按实际情况调整。
