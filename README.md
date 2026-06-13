# 微信公众号编辑器

在线 Markdown 编辑器，实时渲染为微信公众号可直接粘贴的 **inline style HTML**。
左侧写 Markdown，右侧所见即所得，一键复制到公众号后台。

## 功能

- Markdown 实时预览（CodeMirror 6 编辑，unified/remark/rehype 渲染）
- 3 套内置主题，可切换
- 样式微调：字体、字号、行高、段间距、主色、文字色、标题色
- 代码块语法高亮（颜色 inline 化，兼容微信）
- 一键复制为 `text/html`，可直接粘贴公众号
- 微信兼容性检查（残留 class、不支持标签、外链图片等提示）
- 草稿自动保存（localStorage），刷新不丢失
- 一键格式化 Markdown 源文本

## 技术栈

Vite + React + TypeScript + CodeMirror 6 + unified(remark/rehype) + lowlight。

核心约束：微信正文必须是 inline style HTML，不支持 class/`<style>`/JS。
因此渲染链路最后一步把主题样式注入到每个节点的 `style` 属性，预览与导出共用同一棵 hast。

## 开发

```bash
npm install
npm run dev      # 启动开发服务器
npm test         # 运行单测
npm run lint     # 代码检查
npm run build    # 生产构建（输出 dist/）
npm run preview  # 预览生产构建
```

## 部署

`npm run build` 产出纯静态文件到 `dist/`，可部署到任意静态托管（Nginx、Vercel、
GitHub Pages、对象存储等）。无后端依赖，所有处理在浏览器完成，草稿存于本地。

## 目录结构

```text
src/
  editor/         Markdown 输入（CodeMirror 6）
  markdown-core/  Markdown → 安全 hast → HTML
  themes/         主题定义与 inline style 注入、代码高亮
  clipboard/      复制 text/html
  storage/        草稿持久化
  checker/        微信兼容性检查
  app/            顶层布局与组装
```

更多设计与开发规划见 [docs/](docs/INDEX.md)。
