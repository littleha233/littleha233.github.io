# 迁移记录

迁移日期：2026-09-13。

## 来源

1. 桌面 Hugo 博客 `/Users/meng/Desktop/blog/nicola-von-blog`，原始提交 `ae92b49`。复制 Git 仓库至规范目录，保留历史。
2. 同一远程仓库的旧学术网站分支 `master`，提交 `4d292ed`。

## 迁移清单

| 来源 | 新入口 | 处理 |
| --- | --- | --- |
| `content/posts/init-blog.md` | `/posts/init-blog/` | 正文、标题、日期不变；补充分类、标签和摘要 |
| `content/posts/blog-create-process.md` | `/posts/blog-create-process/` | 原文保留；页面提示参阅当前写作指南 |
| `content/posts/eddsa_mpc.md` | `/posts/eddsa_mpc/` | 正文、标题、日期不变；代码高亮与复制 |
| `_publications/Blockchain&Cloud.md` | `/posts/blockchain-cloud/` | 原文保留，附件 URL 改为站内地址 |
| `_publications/Blockchain&MPC.md` | `/posts/blockchain-mpc/` | 原文保留，附件 URL 改为站内地址 |
| `_talks/normal-algorithm.md` | `/posts/normal-algorithm/` | 原文保留，附件 URL 改为站内地址 |

旧入口 `/publication/Blockchain&Cloud`、`/publication/Blockchain&MPC`、`/talks/normal-algorithm` 生成重定向页；三份 PDF 保持原 `/files/` 地址，文件字节与历史 Git 对象一致。

## 未导入的内容

旧学术主题的五篇示例博客（2012–2015 年的 “Blog Post number” 与 2199 年未来示例）是模板内容，未导入；仍可在 `origin/master` 找到。主题示例图片、示例 `paper3.pdf`、示例导航文档不作为个人笔记发布。

电脑中搜到的 BlogSpringBoot 等区块链应用代码并非个人文章站，保持原样。

## 核验与约定

`scripts/verify.py` 比较六篇文章正文与来源提交，忽略首尾空白；仅允许旧附件链接本地化。PDF 使用 SHA-256 比较。不修订历史技术结论，页面标示原始日期与历史记录。旧文章不因迁移获得新的发表日期。

旧桌面目录、远程 main/master 均未覆盖。新开发在 `codex/blog-redesign-migration` 分支。
