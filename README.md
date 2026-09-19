# Nicola Von · 工程笔记

使用 **Hexo 8.1.2 + 官方 Stellar 1.44.0**。本地预览与 GitHub Pages 采用相同配置和锁定依赖。

- 公网：https://littleha233.github.io/
- 本地：http://localhost:1313/
- 仓库：https://github.com/littleha233/littleha233.github.io
- 目录：/Users/meng/codex/nicola-von-blog

## 本地预览

需要 Node.js 22 或更高版本。

```bash
npm ci
npm run dev
```

## 写作

```bash
npx hexo new draft my-topic
npm run dev -- --draft
npx hexo publish my-topic
```

文章在 `source/_posts/`，草稿在 `source/_drafts/`，附件在 `source/files/`。详细说明见 `source/writing/index.md`，或打开博客中的「写作」。Hexo 不使用 Hugo 的 `draft: true` 作为草稿开关。

## 检查与发布

```bash
npm run build
npm run check
```

工作分支提交后合入 `main`，GitHub Actions 自动执行 `npm ci`、构建、完整性检查并部署 GitHub Pages。仓库 Pages 来源为 GitHub Actions。工作流保留文件名 `.github/workflows/hugo.yml`，实际内容已完全改为 Hexo/Stellar。

普通 Git 推送需要 `gh auth login` 或已配置的 SSH 密钥。Codex 也可通过已授权的 GitHub 连接提交与发布。

## 主题设置

- `_config.yml`：站点信息、地址、文章链接与标签映射。
- `_config.stellar.yml`：Stellar 侧栏、导航、配色、搜索和阅读功能。
- `source/_data/widgets.yml`：简介、最近记录和目录。
- `scripts/`：Hexo 扩展，兼容旧地址与提供本地浏览器依赖。
- `tools/verify-stellar.py`：迁移文章、日期、附件、搜索与链接校验。

不修改主题包源码，升级时调整锁定版本并重新验证即可。核心浏览器依赖随网站一起提供，避免读取文章时等待第三方 CDN。

## 历史内容

6 篇文章、3 份 PDF 已迁移，原文章地址和旧学术文章入口继续可用。日期转为 Hexo 的上海时区格式，保持原始日期与时间。见 `docs/STELLAR-MIGRATION.md`。

`content/`、`layouts/`、`assets/`、`static/` 和 `config.toml` 是上一版 Hugo 快照，供核验与回溯，不参与当前发布。后续只编辑 `source/` 下的文章。旧验证脚本移动到 `tools/verify-hugo.py`，避免被 Hexo 当作 JavaScript 执行。
# 本地博客工作台

现在可以双击 `启动博客工作台.command`，或运行 `npm run studio`，访问 http://127.0.0.1:4313/。
支持文章/生活随记、代码片段、GPT 对话摘录，提供文件与粘贴导入、分类标签建议与手填、附件、自动保存、Stellar 预览及确认发布。
首次发布先执行 `gh auth login`。[完整使用说明](docs/BLOG-STUDIO.md)。
