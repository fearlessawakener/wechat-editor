# Task: 修复 markdown render 的构建失败

## Goal

修复 `pnpm run build` 时 `src/markdown-core/render.ts` 的 TypeScript 类型错误，使生产构建恢复通过。

## Context

- `AGENTS.md`、`docs/INDEX.md`：确认按最小上下文读取并在 bug fix 完成后补 task memory。
- `src/markdown-core/render.ts`：报错点位于 `createElement` 和两个 `flatMap` 处理 `children` 的逻辑。
- `node_modules/.pnpm/@types+hast@3.0.4/node_modules/@types/hast/index.d.ts`：
  确认 `Content` 实际等同于 `RootContent`，包含 `Doctype`；而 `Element.children`
  只能接受 `ElementContent[]`。
- `src/themes/highlight.ts`：已有使用 `ElementContent` 的现有模式，可作为同类参考。

## Files Changed

- `src/markdown-core/render.ts`：将 `Content` 改为精确的 `ElementContent` /
  `RootContent`，并把 `root.children` 与 `element.children` 的 `flatMap` 处理拆开。

## Validation

- `pnpm run build`：成功，`tsc -b && vite build` 完整通过并产出 `dist/`。

## Not Validated

- 未单独运行 `render.ts` 相关测试；本次以生产构建通过作为直接验收。

## Decisions

- 在 `hast` 场景中不再使用宽泛的 `Content` 作为 element 子节点类型，避免把
  `root` 专属节点（如 `Doctype`）混入 `Element.children`。
- 对同时支持 `HastRoot | Element` 的遍历逻辑，显式区分 `root.children` 与
  `element.children` 分支，减少联合类型推断带来的构建错误。

## Follow-ups

- 如果后续继续扩展 markdown AST 处理逻辑，优先沿用 `ElementContent` /
  `RootContent` 的精确类型，而不是回退到 `Content`。
