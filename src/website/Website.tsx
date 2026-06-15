// 官网落地页：照 design/website.png 制作。
// 主色微信绿 (#07c160)，结构：导航栏 → Hero → 产品展示 → 功能特性 →
// 功能卡片 → CTA → Footer。「打开编辑器」按钮在新标签页打开 editor.html。

// 编辑器页面地址。Vite MPA 下 editor.html 与 index.html 同级，构建后保持相对路径。
const EDITOR_URL = 'editor.html'

function openEditor() {
  window.open(EDITOR_URL, '_blank', 'noopener')
}

export function Website() {
  return (
    <>
      <header className="site-header">
        <div className="wrap">
          <a className="logo" href="/">
            <span className="logo-mark">W</span>
            <span>微信公众号编辑器</span>
          </a>
          <nav className="nav">
            <a href="#features">功能特性</a>
            <a href="#how">使用方式</a>
            <a href="#start">开始使用</a>
          </nav>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={openEditor}
          >
            打开编辑器
          </button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="hero">
          <div className="wrap">
            <span className="badge">免费 · 开源 · 无需注册</span>
            <h1>
              让 Markdown 一键变成
              <br />
              <span className="accent">精美的公众号排版</span>
            </h1>
            <p>
              专注写作，无需操心排版。在线编写
              Markdown，实时渲染为优美统一的微信公众号文章，
              一键复制粘贴到后台即可发布。
            </p>
            <div className="hero-actions">
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={openEditor}
              >
                立即使用 →
              </button>
              <a className="btn btn-ghost btn-lg" href="#features">
                了解功能
              </a>
            </div>
          </div>
        </section>

        {/* 产品截图展示 */}
        <section className="showcase">
          <div className="wrap">
            <div className="showcase-frame">
              <div className="window">
                <div className="window-bar">
                  <span className="dot r" />
                  <span className="dot y" />
                  <span className="dot g" />
                  <span className="window-title">微信公众号编辑器</span>
                </div>
                <div className="window-body">
                  <div className="pane edit">
                    <span className="h"># 春日随笔</span>
                    {'\n\n'}
                    在左侧编写 <span className="b">**Markdown**</span>
                    ，右侧实时预览排版效果。
                    {'\n\n'}
                    <span className="q">&gt; 引用一段值得记住的话。</span>
                    {'\n\n'}- 自动统一字号与行距
                    {'\n'}- 代码块自带高亮
                    {'\n\n'}
                    <span className="f">```js</span>
                    {'\n'}console.log(
                    <span className="s">&#39;hello wechat&#39;</span>){'\n'}
                    <span className="f">```</span>
                  </div>
                  <div className="pane preview">
                    <h3>春日随笔</h3>
                    <p>
                      在左侧编写 <b>Markdown</b>，右侧实时预览排版效果。
                    </p>
                    <blockquote>引用一段值得记住的话。</blockquote>
                    <ul>
                      <li>列表自动转换</li>
                      <li>代码块自带高亮</li>
                    </ul>
                    <div className="pv-code">
                      <div className="pv-code-bar">
                        <span className="dot r" />
                        <span className="dot y" />
                        <span className="dot g" />
                        <span className="pv-code-lang">js</span>
                      </div>
                      <pre>
                        <span className="ck-fn">console</span>.
                        <span className="ck-fn">log</span>(
                        <span className="ck-str">&#39;hello wechat&#39;</span>)
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 功能特性（分栏） */}
        <section className="section alt" id="how">
          <div className="wrap">
            <div className="section-head">
              <h2>所见即所得，粘贴即用</h2>
              <p>从写作到发布，整个流程只需复制粘贴一步。</p>
            </div>
            <div className="split">
              <div>
                <h3>专注内容，排版交给我们</h3>
                <ul>
                  <li>
                    <span className="tick">✓</span>
                    <span>左侧写 Markdown，右侧实时预览最终效果</span>
                  </li>
                  <li>
                    <span className="tick">✓</span>
                    <span>生成纯 inline style HTML，完美适配公众号后台</span>
                  </li>
                  <li>
                    <span className="tick">✓</span>
                    <span>一键格式化、一键复制，自动保存草稿</span>
                  </li>
                  <li>
                    <span className="tick">✓</span>
                    <span>内置兼容性检查，粘贴不再排版错乱</span>
                  </li>
                </ul>
              </div>
              <div className="split-visual">
                <div className="chip">
                  📝 <strong>实时预览</strong> · 输入即渲染
                </div>
                <div className="chip">
                  🎨 <strong>多套主题</strong> · 字体字号颜色随心微调
                </div>
                <div className="chip">
                  📋 <strong>一键复制</strong> · 粘贴到公众号即用
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 功能卡片 */}
        <section className="section" id="features">
          <div className="wrap">
            <div className="section-head">
              <h2>为公众号写作打造</h2>
              <p>每一个功能都为了让你更快产出精美文章。</p>
            </div>
            <div className="cards">
              <div className="card">
                <div className="icon">⚡</div>
                <h3>实时渲染</h3>
                <p>
                  边写边看，Markdown 输入即刻渲染成公众号文章样式，所见即所得。
                </p>
              </div>
              <div className="card">
                <div className="icon">🎨</div>
                <h3>多主题与微调</h3>
                <p>
                  内置多套精选主题，字体、字号、颜色、间距均可实时微调，风格统一。
                </p>
              </div>
              <div className="card">
                <div className="icon">📋</div>
                <h3>一键复制粘贴</h3>
                <p>
                  生成纯 inline style HTML，一键复制后直接粘贴到公众号后台发布。
                </p>
              </div>
              <div className="card">
                <div className="icon">💾</div>
                <h3>自动保存草稿</h3>
                <p>
                  编辑内容与主题设置自动保存，刷新关闭都不丢失，随时接着写。
                </p>
              </div>
              <div className="card">
                <div className="icon">🖥️</div>
                <h3>代码块高亮</h3>
                <p>
                  支持多语言语法高亮与窗口装饰风格，技术文章代码展示更专业。
                </p>
              </div>
              <div className="card">
                <div className="icon">✅</div>
                <h3>兼容性检查</h3>
                <p>
                  自动检查微信不支持的标签与样式，提前提示，避免粘贴后错乱。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta" id="start">
          <div className="wrap">
            <div className="cta-inner">
              <h2>开始用 Markdown 写公众号文章</h2>
              <p>完全免费，无需注册，打开即用。</p>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={openEditor}
              >
                打开编辑器 →
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="wrap">
          <span>© 2026 微信公众号编辑器 · 免费开源</span>
          <div className="foot-links">
            <a href="#features">功能特性</a>
          </div>
        </div>
      </footer>
    </>
  )
}
