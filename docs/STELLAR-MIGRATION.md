# Stellar 主题切换

2026-09-14：由 Hugo 自定义模板迁移至 Hexo 8.1.2 与官方 `hexo-theme-stellar` 1.44.0（MIT）。原主题地址：https://github.com/xaoxuu/hexo-theme-stellar 。依赖版本由 `package-lock.json` 锁定。

## 内容保持

- 6 篇文章复制到 `source/_posts/`，正文未更改。
- 日期由带 +08:00 的 ISO 格式转为 Hexo 站点上海时区的本地格式，避免两次时区转换造成日期提前一天；原日历日期与时间保持不变。
- 三份 PDF 在 `source/files/`，文件字节与上一版一致。
- 旧 EdDSA 原文末尾没有闭合代码围栏，在渲染时自动补全，恢复代码高亮与复制；源 Markdown 保持不变。
- 原 `/posts/<slug>/`、`/categories/`、`/tags/`、`/archives/`、`/about/`、`/writing/`、`/index.xml` 继续可用。
- 旧学术站 `/publication/Blockchain&Cloud`、`/publication/Blockchain&MPC`、`/talks/normal-algorithm` 跳转至迁移文章。
- `/posts/` 跳转首页文章列表；`/search/` 跳转首页搜索输入框。
- `tag_map` 保持 EdDSA、MPC、Git、Go、Hugo 的小写 URL，避免 macOS 不区分大小写导致重定向覆盖真实标签页。

## 发布与回溯

Hexo 发布的唯一内容源为 `source/`。保留上一版 Hugo 文件作为核验快照，不参与构建。`scripts/` 仅保留 Hexo JavaScript 扩展，Python 验证位于 `tools/`。

GitHub Actions 使用 Node 22 与 `npm ci`，PR 验证、main 发布。主题和核心浏览器依赖由 npm 包提供，未修改上游主题源码。关闭第三方入场动画，确保文章卡片无需等待外部服务便能显示。

## 检查

`npm run check` 校验文章、显示日期、附件哈希、搜索索引、资源、旧链接与目录锚点。浏览器检查按主题的桌面和移动布局执行。
