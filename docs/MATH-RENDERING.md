# Markdown 数学公式

## 根因与实现

博客采用 Hexo 8.1.2 + Stellar 1.44.0。文章由 `hexo-renderer-marked@7.0.1` 内部的 Marked 15 解析；项目另有 Marked 13 用于工作台校验和主题浏览器依赖。原来没有数学 tokenizer，Stellar 的 KaTeX 开关也仅提供 CSS，因此美元分隔符被当作普通文字，公式里的 Markdown 特殊字符还可能被提前处理。没有 React hydration、remark/rehype 管线或启用的 DOMPurify 导致此问题。

现在的链路：原始 Markdown → 原有 `marked:extensions` 接口 → `marked-katex-extension@5.1.13` 识别数学 token → `katex@0.18.7` 在构建时生成 HTML + MathML → Stellar 页面。无需客户端数学脚本、额外 front matter 或修改文章。

`scripts/math.js` 注册扩展，并生成本地 KaTeX CSS 和配套字体；注入路径遵循 Hexo `root`，工作台独立预览也适用。`source/css/math.css` 继承主题文字颜色，长块级公式只在自身容器内横向滚动。目录使用公式的可视文字，避免重复 MathML / TeX 注释。

Node.js 最低版本为 22.12.0（KaTeX 的 CLI 依赖要求）；不升级原有框架、主题或解析器。

## 用法与限制

- 行内：`$\varphi(n)$`；支持与中文紧邻，无需两边空格。
- 块级：起始和结束 `$$` 各占一行，中间可多行书写 LaTeX；建议公式块前后留空行。
- 支持本次测试中的 `\varphi`、`\gcd`、`\mathbb{Z}`、`\frac`、`\sqrt`、上下标、`\sum`、`\prod`、`\pmod`、`\left` / `\right` 等。
- 围栏代码、缩进代码和行内反引号中的公式保持原样。普通金额应写 `\$5`，避免两个美元符号被解释为数学分隔符。
- KaTeX 不是完整 LaTeX 编译器：不支持任意 TeX 宏包、TikZ 等；本次仅承诺美元分隔语法，不承诺 `\(...\)` / `\[...\]`。
- 未支持命令或非法公式会显示红色错误提示/源码，不中断整站构建；需在预览中复核。禁用受信任 HTML / 外部资源命令，并限制宏展开与尺寸。显式 `\color` 指定的颜色不会自动跟随暗色模式。
- 不改变主题、文章内容、已有字体设置或无关依赖。

## 验证与部署

测试文章位于 `studio/test/fixtures/math.md`，只在临时目录构建，不会发布到博客。

```sh
npm run test:studio
npm run build
npm run check
```

额外浏览器验收覆盖桌面、390px / 320px 窄屏、暗色、目录、代码原文和控制台。实际结果以本次交付说明为准，不以此清单作为通过证明。

工作台可预览尚未部署的本地数学修复，但会阻止使用旧版远端渲染器发布含公式文章。先将修复合并到 `main` 并成功部署，再点击同步、重新预览和发布。此保护不会自动合并或部署代码；非公式文章保持原发布流程。

参考：[Marked 扩展](https://github.com/UziTech/marked-katex-extension)、[KaTeX 支持列表](https://katex.org/docs/supported)、[KaTeX 安全与渲染选项](https://katex.org/docs/options)。
