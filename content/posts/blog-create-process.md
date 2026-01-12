---
title: "个人博客创建复用流程"
date: 2026-01-12T06:02:45+08:00
draft: false
---

### 0. 前置约定

- 仓库：`littleha233/littleha233.github.io`
- 分支：`main`（源码分支）
- 发布：GitHub Actions 自动部署到 Pages
- 本地目录示例：`~/Desktop/blog/nicola-von-blog`

------

### 1.开始写之前：同步仓库

```bash
cd ~/Desktop/blog/nicola-von-blog
git checkout main
git pull --rebase
git submodule update --init --recursive
```

------

### 2. 新建文章（两种推荐方式）

#### A. 普通文章（纯 md，无本地图片）

```bash
hugo new posts/my-topic.md
```

#### B. “页面包”文章（强烈推荐，方便放图）

会创建一个文件夹作为文章目录，图片就放同目录里，最省心：

```bash
hugo new posts/my-topic/index.md
```

目录会像这样：

```
content/posts/my-topic/
  index.md
  cover.png
  arch.png
```

------

### 3. 编辑文章（关键点：front matter）

打开新建的 md，把头部（front matter）补齐，至少保证：

```yaml
---
title: "标题"
date: 2026-01-12
draft: true
tags: ["tag1", "tag2"]
---
```

写完准备发布时，把：

```yaml
draft: true
```

改成：

```yaml
draft: false
```

------

### 4. 本地预览

启动本地服务：

```bash
hugo server
```

如果想连草稿一起看：

```bash
hugo server -D
```

------

### 5. 本地“上线前检查”

模拟线上构建（会生成 `public/`）：

```bash
hugo --minify
```

快速检查文章是否被编进来了：

- 看 `public/posts/.../index.html` 是否存在
- 或者直接本地访问预览确认

------

### 6. 提交并发布

```bash
git status
git add .
git commit -m "post: <标题或主题>"
git push
```

然后去 GitHub：

- 仓库 → **Actions** → 看最新 workflow 是否绿色成功
  成功后访问：
- https://littleha233.github.io/

