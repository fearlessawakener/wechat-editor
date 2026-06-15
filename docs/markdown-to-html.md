# Markdown → HTML 转换说明

本文档说明编辑器把 Markdown 转换为什么样的 HTML，以及主题如何注入 inline style。
内容基于实际渲染管线输出，非推测。

## 转换链路

```text
Markdown 源文本
  ↓ remark-parse            解析为 mdast
  ↓ remark-gfm              支持表格 / 删除线 / 任务列表 / 自动链接
  ↓ remark-rehype           mdast → hast（HTML 语义树）
  ↓ rehype-sanitize         按微信白名单过滤（放行 style，移除 class）
  = 裸 hast（无样式）
  ↓ highlightCodeBlocks     对 pre>code 语法高亮，高亮色 inline 化
  ↓ applyTheme              按 tagName 注入主题 inline style，删除所有 class
  = themed hast
  ↓ hastToReact / hastToHtml   预览 / 复制导出（同源一致）
```

源码入口：`markdown-core/render.ts`（解析+sanitize）、`themes/render-themed.ts`
（高亮+主题注入）、`app/useThemedRender.ts`（统一组合）。

## 块级元素映射

下表是 sanitize 后的**裸 HTML**（尚未注入主题 style）。

| Markdown | HTML |
| --- | --- |
| `# 标题` ~ `###### 标题` | `<h1>…</h1>` ~ `<h6>…</h6>` |
| 普通段落 | `<p>…</p>` |
| `- a` / `* a` / `+ a` | `<ul><li>a</li></ul>` |
| `1. a` | `<ol><li>a</li></ol>` |
| 嵌套列表 | `<li>` 内再嵌 `<ul>`/`<ol>` |
| `> 引用` | `<blockquote><p>引用</p></blockquote>` |
| ` ```js\n…\n``` ` | `<pre><code class="language-js">…</code></pre>` |
| `---` / `***` | `<hr>` |
| GFM 表格 | `<table><thead><tr><th>…</th></tr></thead><tbody><tr><td>…</td></tr></tbody></table>` |

说明：

- 代码块的语言写在 `<code>` 的 `class="language-xxx"` 上，仅用于高亮阶段识别语言，
  最终会被 `applyTheme` 删除（微信不认 class）。
- 表格列对齐（`:--` / `--:` / `:-:`）会落到 `<th>`/`<td>` 的 `align` 属性，
  例如 `<th align="left">`、`<td align="right">`，该属性予以保留。

## 行内元素映射

| Markdown | HTML |
| --- | --- |
| `**粗**` / `__粗__` | `<strong>粗</strong>` |
| `*斜*` / `_斜_` | `<em>斜</em>` |
| `` `代码` `` | `<code>代码</code>` |
| `~~删除~~` | `<del>删除</del>` |
| `[文字](url)` | `<a href="url">文字</a>` |
| `![alt](url)` | `<img src="url" alt="alt">`（包在 `<p>` 内） |
| `<https://a.com>` | `<a href="https://a.com">https://a.com</a>` |

## GFM 任务列表

```text
- [ ] 待办
- [x] 完成
```

裸 HTML（注意带 class，会在 applyTheme 阶段被移除）：

```html
<ul class="contains-task-list">
  <li class="task-list-item"><input type="checkbox" disabled> 待办</li>
  <li class="task-list-item"><input type="checkbox" checked disabled> 完成</li>
</ul>
```

class 被移除后 `<input type="checkbox">` 仍保留。注意：微信公众号正文通常会过滤
表单控件，任务列表的勾选框在公众号端不保证显示，兼容性以 checker 检查为准。

## 安全过滤（sanitize）

`rehype-sanitize` 使用微信友好白名单（`markdown-core/sanitize-schema.ts`）：

- 放行所有元素的 `style` 属性（inline 注入和微信正文都依赖它）。
- 移除 `className`（微信不支持 class）。
- 剥离 `<script>`、事件处理属性（如 `onclick`/`onerror`）等危险内容。

示例：`<div onclick="x">hi</div>` 经过滤后 `onclick` 被移除，不安全标签按白名单处理。
因此用户在 Markdown 中内嵌的裸 HTML 不能保证原样保留，以白名单结果为准。

## 代码高亮

`highlightCodeBlocks`（`themes/highlight.ts`）对 `pre > code` 用 lowlight 高亮，
并把整个代码块包进带「窗口装饰」的容器：

- 按 `class="language-xxx"` 识别语言；未标语言时走 `highlightAuto`。
- 仅注册常用语言（js/ts/xml/css/json/bash/python/java/go/rust/sql/markdown），
  控制 bundle 体积。
- 高亮产生的 `hljs-*` class 被映射为 inline `color`（配色来自 `themes/code-themes.ts`
  的代码主题），再删除 class。
- 代码主题与窗口风格由调用方传入（默认 Atom One Dark + Mac），与文章主题正交。
  详见 `themes/code-themes.ts`。

输出结构（简化）：

```html
<section style="background:#282c34;border-radius:6px;overflow:hidden;margin:16px 0">
  <section style="display:flex;align-items:center;padding:10px 14px;…">
    <span style="…;background:#ff5f56;…"></span>  <!-- Mac 红黄绿圆点 -->
    <span style="…;background:#ffbd2e;…"></span>
    <span style="…;background:#27c93f;…"></span>
    <span style="…;margin-left:auto">js</span>     <!-- 语言标签 -->
  </section>
  <pre style="margin:0;background:#282c34;color:#abb2bf;…"><code …>
    <span style="color:#c678dd">const</span> a = 1
  </code></pre>
</section>
```

- 代码块底色 / 文字色来自代码主题，借 `mergeStyle`「已有 inline style 优先」
  规则盖过文章主题对 `pre`/`code` 的 token 底色。
- Windows 风格则把红黄绿圆点换成右侧的 `—` `☐` `✕` 三个控件，语言标签靠左。
- `<section>` / `<span>` 均在微信正文白名单内，全程 inline style，无 class。

## 主题 inline style 注入

`applyTheme`（`themes/apply-theme.ts`）按 tagName 查主题 styles 表，把样式
合并进节点 `style` 属性，并删除全部 className。受控标签：

```text
h1-h6, p, a, strong, em, ul, ol, li, blockquote,
code, pre, hr, img, table, thead, tr, th, td
```

以「微信经典绿」主题为例，注入后的部分结果：

```html
<h1 style="font-size:24px;font-weight:700;color:#1f2329;line-height:1.4;margin:28px 0 16px">标题</h1>
<p style="font-size:15px;color:#3f3f3f;line-height:1.75;margin:16px 0">段落</p>
<blockquote style="margin:16px 0;padding:10px 16px;border-left:4px solid #07c160;background:#f7f8fa;color:#6a737d;font-size:15px;line-height:1.75"><p style="…">引用</p></blockquote>
<a href="https://a.com" style="color:#07c160;text-decoration:none;word-break:break-all">链接</a>
```

要点：

- 具体数值/颜色随主题（classic / elegant / warm）和用户微调 overrides 变化，
  上例仅示意结构。各标签精确样式见 `themes/themes.ts` 的 `baseStyles`。
- 节点已有的 inline style 优先级高于主题 style（`themes/style-utils.ts` 的
  `mergeStyle`），保证代码高亮颜色不被主题底色覆盖。
- `thead`/`tr` 无独立样式函数，仅清除 class；视觉由 `table`/`th`/`td` 承担。
- 最终 HTML 全程无 class、无 `<style>` 标签，全部为 inline style，符合微信正文要求。

## 相关文档

- `docs/architecture.md`：整体架构与关键实现决策。
- 复制导出与兼容性检查共用同一棵 themed hast，所见即所得。
