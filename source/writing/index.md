---
title: 写作指南
layout: page
menu_id: writing
description: 使用 Hexo 和 Stellar 记录工作与研究。
---

## 新建草稿

```bash
cd /Users/meng/codex/nicola-von-blog
npx hexo new draft my-topic
npm run dev -- --draft
```

草稿位于 `source/_drafts/my-topic.md`。本地打开 `http://localhost:1313/` 预览。草稿默认不参与正式构建。

## 文章信息

```yaml
---
title: "我的工程笔记"
date: 2026-09-14 10:00:00
description: "一句话说明这篇笔记的内容。"
categories: ["工程实践"]
tags: ["Go", "系统设计"]
---
```

用 `##`、`###` 组织层级，Stellar 会生成目录。代码块注明语言，可显示语法高亮与复制按钮。

已有分类：工程实践、区块链研究、密码学与安全、工作随记。新增分类和标签会自动进入导航。

## 图片与附件

图片放在 `source/images/`，用 `![图片说明](/images/diagram.png)` 引用。PDF 放在 `source/files/`，用 `[下载资料](/files/example.pdf)` 引用。

## 发布文章

```bash
npx hexo publish my-topic
npm run build
npm run check
git add source/_posts/my-topic.md
git commit -m "post: 新的工程笔记"
git push -u origin HEAD
```

发布后的文章位于 `source/_posts/`。**Hexo 的草稿存放在 `_drafts`，不要沿用 Hugo 的 `draft: true` 作为唯一的草稿开关。**

工作分支合入 `main` 后，GitHub Actions 会用相同的锁定依赖与配置生成站点并部署 Pages。自动部署成功后，公网地址为 https://littleha233.github.io/ 。

## 本地预览与主题配置

```bash
npm ci
npm run dev
```

站点信息位于 `_config.yml`，Stellar 主题设置位于 `_config.stellar.yml`。本地与公网使用同一套主题文件。正式构建保留公网 canonical 地址，所有内部页面和资源使用相对路径。
