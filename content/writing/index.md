---
title: "写作指南"
description: "用 Markdown 写作，用 Git 保存每一次积累。"
---

## 1. 新建一篇笔记

项目的工作目录是 `/Users/meng/codex/nicola-von-blog`。

```bash
cd /Users/meng/codex/nicola-von-blog
hugo new content posts/my-topic.md
```

如果文章包含图片，使用页面包，让图片和正文放在一起：

```bash
hugo new content posts/my-topic/index.md
```

将图片放在同一文件夹，用 `![图片说明](diagram.png)` 引用。

## 2. 填写文章信息

```yaml
---
title: "文章标题"
date: 2026-09-13T10:00:00+08:00
draft: true
description: "一句话说明文章的主题。"
categories: ["工程实践"]
tags: ["Go", "系统设计"]
---
```

分类用于组织长期主题，标签用于标注具体技术。当前分类包括「工程实践」「区块链研究」「密码学与安全」「工作随记」。新增分类或标签会自动生成对应页面。

`draft: true` 的文章不会进入正式站点、搜索或订阅。

## 3. 写作与预览

用 `##` 和 `###` 组织正文层级，文章目录会自动生成。代码块注明语言，可以显示语法高亮。

```bash
hugo server -D
```

打开终端显示的本地地址查看草稿。预览结束后，在终端按 `Ctrl+C`。

## 4. 检查并提交

准备发布时，将文章的 `draft` 改为 `false`，检查日期是否正确。

```bash
hugo --gc --minify
python3 scripts/verify.py
git status --short
git add content/posts/my-topic.md
git commit -m "post: 记录新的工程实践"
git push -u origin HEAD
```

如果使用页面包，暂存整个文章文件夹。只提交本次文章相关的文件。

## 5. 发布到博客

功能分支通过 Pull Request 合入 `main` 后，GitHub Actions 会构建并发布 GitHub Pages。请先查看 Actions 构建结果，成功后再访问正式博客。

仓库首次启用时，在 Settings → Pages 中将发布来源设为 **GitHub Actions**。本机推送需要先完成 GitHub 登录，可运行 `gh auth login`。

## 历史文章

迁移文章保留原始日期、正文及历史入口。2023 年的研究资料保留 PDF 下载，2026 年的文章继续使用原 `/posts/` 地址。
