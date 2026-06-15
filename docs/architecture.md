# 技术架构

技术栈：

- Node.js
- Vite
- TypeScript
- React
- CodeMirror 6
- unified + remark + rehype + rehype-sanitize
- 自研 theme renderer
- Clipboard API
- localStorage

## 核心链路

```text
Markdown 输入
  ↓
Markdown 解析
  ↓
HTML AST 转换
  ↓
微信公众号主题渲染
  ↓
生成 inline style HTML
  ↓
复制到剪贴板
  ↓
粘贴到微信公众号后台
```

## 模块

```text
editor           负责 Markdown 输入
markdown-core    负责 Markdown → 微信 HTML
themes           负责不同公众号样式
clipboard        负责复制 text/html
storage          负责草稿保存
checker          负责微信兼容性检查
website          官网落地页（独立页面，引流到编辑器）
```

## 页面结构（Vite MPA）

项目为 Vite 多页应用（multi-page app），两个独立入口：

```text
index.html   → src/website-entry.tsx → website/Website   官网落地页
editor.html  → src/editor-entry.tsx  → app/App           编辑器（核心产品）
```

- 多入口在 `vite.config.ts` 的 `build.rollupOptions.input` 中声明（`index` + `editor`）。
- 官网「打开编辑器」按钮通过 `window.open('editor.html', '_blank')` 在新标签页打开编辑器，
  两页各自独立打包、互不影响。
- 官网为纯展示页，仅依赖 React，不引入编辑器相关依赖（CodeMirror / markdown 管线）。
  样式走常规 CSS class（`website/website.css`），与「微信正文仅 inline style」约束无关——
  该约束只作用于编辑器导出的文章 HTML，不约束官网自身。

## 关键实现决策

- **统一 hast**：`markdownToHast` 产出安全 hast；预览（`hastToReact`）、导出/复制
  （`hastToHtml`）、兼容性检查（checker）共用同一棵 themed hast，保证所见即所得。
  组合入口为 `app/useThemedRender.ts`。
- **渲染顺序**：`renderThemedHast` 先 `highlightCodeBlocks`（代码高亮并把 hljs class
  转 inline color），再 `applyTheme`（按 tagName 注入主题 style 并删除所有 className）。
  深拷贝输入，不污染共享树。
- **inline 优先级**：节点已有 inline style 覆盖主题 style（见 `themes/style-utils.ts`
  的 `mergeStyle`），使代码高亮颜色不被主题底色抹掉。
- **微调以 overrides 形式存在**：`Partial<ThemeTokens>` 覆盖主题默认 token；切换主题时
  清空 overrides，避免跨主题数值/颜色错配。
- **复制降级**：优先 `ClipboardItem` 写 text/html + text/plain，失败降级到
  `execCommand('copy')`（隐藏 contenteditable 节点保留富文本）。
- **编辑器不加载 `@codemirror/language-data`**：编辑区只需 markdown 高亮，代码语言
  高亮由预览侧 lowlight 完成，以此控制 bundle 体积。
- **lowlight 按需注册语言**：不使用 `common` 全量语言包，仅注册常用语言
  （见 `themes/highlight.ts`）。
- **代码主题与文章主题正交**：代码块高亮配色（Atom One Dark/Light，见
  `themes/code-themes.ts`）和窗口装饰风格（Mac/Windows）独立于文章主题，由
  `renderThemedHast` → `highlightCodeBlocks` 透传。`highlightCodeBlocks` 把
  `pre` 替换为「窗口装饰容器（标题栏 + 圆点/方块 + 语言标签）+ 代码区」的
  inline-style 结构，借 `mergeStyle` 优先级盖过文章主题的代码底色。

