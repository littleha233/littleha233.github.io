import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import { serialize, hash, parseMarkdown, warnings } from "./core.mjs";
const exec = promisify(execFile);
export const REPO = "littleha233/littleha233.github.io";
export const SITE = "https://littleha233.github.io";
const historical = new Set([
  "init-blog",
  "blog-create-process",
  "eddsa_mpc",
  "blockchain-cloud",
  "blockchain-mpc",
  "normal-algorithm",
]);
export async function command(file, args, cwd) {
  return (
    await exec(file, args, {
      cwd,
      timeout: 120000,
      maxBuffer: 8 * 1024 * 1024,
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
    })
  ).stdout;
}
export async function token() {
  if (process.env.GH_TOKEN || process.env.GITHUB_TOKEN)
    return process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  try {
    return (await command("gh", ["auth", "token"], undefined)).trim();
  } catch {
    return null;
  }
}
export async function github(endpoint, { method = "GET", body, auth } = {}) {
  auth = auth || (await token());
  if (method !== "GET" && !auth)
    throw new Error("尚未登录 GitHub。请在终端运行 gh auth login 后重试");
  const response = await fetch("https://api.github.com" + endpoint, {
    method,
    signal: AbortSignal.timeout(25000),
    headers: {
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(
      `GitHub ${response.status}：${result.message || "请求失败"}`,
    );
  return result;
}
export async function authentication() {
  const auth = await token();
  if (!auth)
    return {
      ready: false,
      message: "运行 gh auth login 完成一次登录；无需把令牌交给本应用。",
    };
  try {
    const repo = await github("/repos/" + REPO, { auth });
    return {
      ready: !!repo.permissions?.push,
      message: repo.permissions?.push
        ? "GitHub 已连接，可以发布"
        : "当前账号没有此仓库的写权限",
    };
  } catch (error) {
    return { ready: false, message: error.message };
  }
}
export class Publisher {
  constructor(root, store, api = github, web = fetch) {
    this.root = root;
    this.store = store;
    this.api = api;
    this.web = web;
    this.previewOrigin = "http://127.0.0.1:4314";
    this.previews = new Map();
    this.jobs = new Map();
    this.busy = false;
  }
  async init() {
    await fs.mkdir(path.join(this.store.root, "jobs"), { recursive: true });
    for (const file of await fs.readdir(path.join(this.store.root, "jobs"))) {
      try {
        const job = JSON.parse(
          await fs.readFile(path.join(this.store.root, "jobs", file)),
        );
        if (job.state === "publishing")
          job.state = job.sha ? "deploying" : "interrupted";
        this.jobs.set(job.id, job);
      } catch {}
    }
  }
  async persist(job) {
    this.jobs.set(job.id, job);
    const target = path.join(this.store.root, "jobs", job.id + ".json");
    await fs.writeFile(target + ".tmp", JSON.stringify(job), { mode: 0o600 });
    await fs.rename(target + ".tmp", target);
  }
  async sync() {
    await command("git", ["fetch", "origin", "main"], this.root);
    return this.base();
  }
  async base() {
    return (
      await command("git", ["rev-parse", "origin/main"], this.root)
    ).trim();
  }
  async library() {
    const names = (
      await command(
        "git",
        ["ls-tree", "-r", "--name-only", "origin/main", "source/_posts"],
        this.root,
      )
    )
      .trim()
      .split("\n")
      .filter((x) => x.endsWith(".md"));
    return Promise.all(
      names.map(async (file) => {
        const raw = await command(
          "git",
          ["show", `origin/main:${file}`],
          this.root,
        );
        const doc = parseMarkdown(raw, path.basename(file));
        return { ...doc, path: file, contentHash: hash(raw) };
      }),
    );
  }
  async post(file, base = "origin/main") {
    if (
      typeof file !== "string" ||
      !/^source\/_posts\/[a-z0-9][a-z0-9_-]{0,79}\.md$/.test(file)
    )
      throw new Error("无效文章路径");
    const raw = await command("git", ["show", `${base}:${file}`], this.root);
    return {
      ...parseMarkdown(raw, path.basename(file)),
      raw,
      path: file,
      contentHash: hash(raw),
    };
  }
  async editPost(file, expectedHash) {
    if (this.busy) throw new Error("正在构建或发布，请稍后重试");
    const base = await this.sync();
    const post = await this.post(file, base);
    if (post.contentHash !== expectedHash)
      throw new Error("线上文章已变化，请同步列表后重新打开");
    const existing = (await this.store.all()).find(
      (d) => d.slug === post.slug && d.publication,
    );
    // Never overwrite an existing local edit when opening the remote library.
    if (existing) return existing;
    const draft = await this.store.create(post);
    await this.store.write({ ...draft, originalMeta: post.originalMeta });
    await this.store.published(draft.id, {
      sha: base,
      contentHash: post.contentHash,
      url: `${SITE}/posts/${post.slug}/`,
    });
    return this.store.get(draft.id);
  }
  async managementFiles(base, slug, markdown, operation) {
    const files = [];
    if (historical.has(slug)) {
      const recordPath = "source/_data/studio-history.json";
      let records = {};
      try {
        records = JSON.parse(
          await command("git", ["show", `${base}:${recordPath}`], this.root),
        );
      } catch (error) {
        const present = await command(
          "git",
          ["ls-tree", "--name-only", base, recordPath],
          this.root,
        );
        if (present.trim()) throw error;
      }
      records[slug] =
        operation === "delete"
          ? { deleted: true }
          : { contentHash: hash(markdown) };
      files.push({
        path: recordPath,
        bytes: Buffer.from(JSON.stringify(records, null, 2) + "\n"),
      });
    }
    // Fixed, committed build support only; never include unrelated working-tree edits.
    if (historical.has(slug) || operation === "delete") {
      for (const file of ["tools/verify-stellar.py"]) {
        const next = await this.buildSupport(file);
        const before = await command(
          "git",
          ["show", `${base}:${file}`],
          this.root,
        );
        if (next !== before) {
          const ancestor = (
            await command("git", ["merge-base", "HEAD", base], this.root)
          ).trim();
          const known = await command(
            "git",
            ["show", `${ancestor}:${file}`],
            this.root,
          );
          if (before !== known)
            throw new Error(
              "远端构建检查器已更新，请先更新工作台代码，避免覆盖",
            );
          files.push({ path: file, bytes: Buffer.from(next) });
        }
      }
    }
    return files;
  }
  async buildSupport(file) {
    return command("git", ["show", `HEAD:${file}`], this.root);
  }
  async prepareDelete(file, expectedHash) {
    if (this.busy) throw new Error("正在构建或发布，请稍后重试");
    this.busy = true;
    let dir;
    try {
      const base = await this.sync();
      const post = await this.post(file, base);
      if (post.contentHash !== expectedHash)
        throw new Error("线上文章已变化，请同步后重新确认删除");
      const key = randomUUID();
      const marker = `files/studio/deletions/${key}.txt`;
      const contentHash = hash(post.raw + key);
      const tombstone = `source/posts/${post.slug}/index.md`;
      if (
        (
          await command(
            "git",
            ["ls-tree", "--name-only", base, tombstone],
            this.root,
          )
        ).trim()
      )
        throw new Error("原地址已有独立页面，请先检查，避免覆盖");
      const files = [
        { path: file, bytes: null },
        {
          path: tombstone,
          bytes: Buffer.from(
            '---\ntitle: 文章已移除\nlayout: page\ncomments: false\ndisableNunjucks: true\n---\n\n<p id="studio-removed">这篇文章已由作者移除。</p>\n',
          ),
        },
        { path: "source/" + marker, bytes: Buffer.from(contentHash) },
        ...(await this.managementFiles(base, post.slug, null, "delete")),
      ];
      dir = await fs.mkdtemp(path.join(os.tmpdir(), "nicola-studio-delete-"));
      const archive = path.join(dir, "snapshot.tar");
      await command(
        "git",
        ["archive", "--format=tar", "-o", archive, base],
        this.root,
      );
      await command("tar", ["-xf", archive, "-C", dir], this.root);
      await fs.unlink(archive);
      await fs.symlink(
        path.join(this.root, "node_modules"),
        path.join(dir, "node_modules"),
        "dir",
      );
      for (const f of files) {
        if (f.bytes === null) await fs.unlink(path.join(dir, f.path));
        else {
          await fs.mkdir(path.dirname(path.join(dir, f.path)), {
            recursive: true,
          });
          await fs.writeFile(path.join(dir, f.path), f.bytes);
        }
      }
      await command(
        process.execPath,
        [path.join(this.root, "node_modules/hexo/bin/hexo"), "generate"],
        dir,
      );
      await command("python3", ["tools/verify-stellar.py"], dir);
      const html = await fs.readFile(
        path.join(dir, "public/posts", post.slug, "index.html"),
        "utf8",
      );
      if (!html.includes('id="studio-removed"'))
        throw new Error("删除提示页未生成");
      const p = {
        key,
        operation: "delete",
        base,
        files,
        marker,
        contentHash,
        slug: post.slug,
        title: post.title,
        before: post.raw,
        created: Date.now(),
      };
      this.previews.set(key, p);
      return {
        key,
        title: post.title,
        slug: post.slug,
        before: post.raw,
        files: files.map((f) => ({
          path: f.path,
          action: f.bytes === null ? "删除" : "更新",
        })),
      };
    } finally {
      if (dir) await fs.rm(dir, { recursive: true, force: true });
      this.busy = false;
    }
  }
  async deletePost(key, slug, confirmed) {
    const p = this.previews.get(key);
    if (!p || p.operation !== "delete" || p.slug !== slug || confirmed !== true)
      throw new Error("请检查删除清单并输入完整文章地址确认");
    const trash = path.join(this.store.root, "trash");
    await fs.mkdir(trash, { recursive: true, mode: 0o700 });
    await fs.writeFile(
      path.join(trash, key + ".json"),
      JSON.stringify({ slug, base: p.base, markdown: p.before }),
      { mode: 0o600 },
    );
    return this.publish(key, true, true);
  }
  async prepare(id, { sync = false } = {}) {
    if (this.busy) throw new Error("正在构建或发布，请稍后重试");
    this.busy = true;
    let dir;
    try {
      const doc = await this.store.get(id),
        markdown = serialize(doc);
      if (warnings(doc).some((x) => /私钥|令牌/.test(x)))
        throw new Error("检测到疑似密钥，已阻止预览和发布，请先移除");
      let offline = false;
      if (sync) {
        try {
          await this.sync();
        } catch {
          offline = true;
        }
      }
      const base = await this.base();
      let old = null;
      try {
        old = await command(
          "git",
          ["show", `${base}:source/_posts/${doc.slug}.md`],
          this.root,
        );
      } catch {}
      if (
        (old !== null &&
          (!doc.publication || hash(old) !== doc.publication.contentHash)) ||
        (old === null && doc.publication)
      )
        throw new Error(
          "文章地址已存在，或线上文章已被其他人修改。请换新地址，避免覆盖",
        );
      dir = await fs.mkdtemp(path.join(os.tmpdir(), "nicola-studio-"));
      const archive = path.join(dir, "snapshot.tar");
      await command(
        "git",
        ["archive", "--format=tar", "-o", archive, base],
        this.root,
      );
      await command("tar", ["-xf", archive, "-C", dir], this.root);
      await fs.unlink(archive);
      // Only the selected draft enters the isolated build; working-tree changes never enter publication.
      await fs.symlink(
        path.join(this.root, "node_modules"),
        path.join(dir, "node_modules"),
        "dir",
      );
      const files = [
        { path: `source/_posts/${doc.slug}.md`, bytes: Buffer.from(markdown) },
        ...(await this.managementFiles(base, doc.slug, markdown, "edit")),
      ];
      if (
        (
          await command(
            "git",
            [
              "ls-tree",
              "--name-only",
              base,
              `source/posts/${doc.slug}/index.md`,
            ],
            this.root,
          )
        ).trim()
      )
        throw new Error("此地址已有独立页面或已删除文章的提示页，请使用新地址");
      const marker = `files/studio/${id}/revision-${hash(markdown).slice(0, 16)}.txt`;
      files.push({
        path: "source/" + marker,
        bytes: Buffer.from(hash(markdown)),
      });
      for (const asset of doc.assets)
        files.push({
          path: `source/files/studio/${id}/${asset.key}`,
          bytes: await fs.readFile(
            path.join(this.store.folder(id), "assets", asset.key),
          ),
        });
      for (const file of files) {
        await fs.mkdir(path.dirname(path.join(dir, file.path)), {
          recursive: true,
        });
        await fs.writeFile(path.join(dir, file.path), file.bytes);
      }
      await command(
        process.execPath,
        [path.join(this.root, "node_modules/hexo/bin/hexo"), "generate"],
        dir,
      );
      await command("python3", ["tools/verify-stellar.py"], dir);
      const target = path.join(dir, "public", "posts", doc.slug, "index.html");
      await fs.access(target);
      // Each browser tab gets a distinct preview namespace, including assets/search.
      const key = randomUUID();
      const prefix = `/p/${key}/`;
      await fs.writeFile(
        path.join(dir, "_studio_preview.yml"),
        `url: ${this.previewOrigin}${prefix}\nroot: ${prefix}\n`,
      );
      await command(
        process.execPath,
        [path.join(this.root, "node_modules/hexo/bin/hexo"), "clean"],
        dir,
      );
      await command(
        process.execPath,
        [
          path.join(this.root, "node_modules/hexo/bin/hexo"),
          "generate",
          "--config",
          "_config.yml,_studio_preview.yml",
        ],
        dir,
      );
      const preview = {
        key,
        id,
        version: doc.version,
        base,
        dir,
        files,
        marker,
        contentHash: hash(markdown),
        created: Date.now(),
        slug: doc.slug,
      };
      this.previews.set(key, preview);
      for (const [k, p] of this.previews)
        if (k !== key && Date.now() - p.created > 3600000) {
          if (p.dir) await fs.rm(p.dir, { recursive: true, force: true });
          this.previews.delete(k);
        }
      return {
        key,
        id,
        version: doc.version,
        base,
        slug: doc.slug,
        files: files.map((x) => ({ path: x.path, size: x.bytes.length })),
        warnings: [
          ...warnings(doc),
          ...(files.some((f) => f.path === "tools/verify-stellar.py")
            ? [
                "本次同时更新文章管理所需的构建检查器，详见文件清单；迁移原稿仍保留在 content/posts",
              ]
            : []),
          ...(offline
            ? ["网络暂不可用，使用上次同步的主题构建。发布时仍会检查远端版本"]
            : []),
        ],
        summary: old === null ? "新增文章" : "更新已发布文章",
        before: old,
        after: markdown,
      };
    } catch (e) {
      if (dir) await fs.rm(dir, { recursive: true, force: true });
      throw new Error("构建检查失败：" + (e.stderr?.slice(-2400) || e.message));
    } finally {
      this.busy = false;
    }
  }
  async publish(key, confirmed, deletionConfirmed = false) {
    if (!confirmed) throw new Error("请先确认发布内容");
    if (this.busy) throw new Error("已有任务进行中");
    const p = this.previews.get(key);
    if (!p || Date.now() - p.created > 3600000)
      throw new Error("预览已过期，请重新检查");
    if (p.operation === "delete" && !deletionConfirmed)
      throw new Error("删除必须通过专用确认入口");
    const doc =
      p.operation === "delete"
        ? { title: p.title }
        : await this.store.get(p.id);
    if (p.operation !== "delete" && doc.version !== p.version)
      throw new Error("草稿已变化，请重新预览后发布");
    const auth = await token();
    if (!auth) throw new Error("请先在终端运行 gh auth login，再点击检查连接");
    const existing = [...this.jobs.values()].find(
      (j) => j.key === key && j.sha,
    );
    if (existing) return existing;
    this.busy = true;
    const job = {
      id: randomUUID(),
      key,
      draftId: p.id,
      operation: p.operation || "publish",
      marker: p.marker,
      contentHash: p.contentHash,
      title: doc.title,
      state: "publishing",
      message: "正在检查远端并提交",
      url: `${SITE}/posts/${p.slug}/`,
      created: new Date().toISOString(),
    };
    await this.persist(job);
    this.runPublish(job, p, auth)
      .catch(() => {
        job.state = "uncertain";
        job.message = "本地记录写入异常，请先查看 GitHub 提交记录，勿重复发布";
      })
      .finally(() => {
        this.busy = false;
      });
    return job;
  }
  async runPublish(job, p, auth) {
    try {
      const api = (endpoint, opts = {}) =>
        this.api("/repos/" + REPO + endpoint, { ...opts, auth });
      const ref = await api("/git/ref/heads/main");
      if (ref.object.sha !== p.base)
        throw new Error("线上主分支已更新，请重新预览后发布");
      const base = await api("/git/commits/" + p.base);
      const tree = [];
      for (const file of p.files) {
        if (file.bytes === null) {
          tree.push({
            path: file.path,
            mode: "100644",
            type: "blob",
            sha: null,
          });
          continue;
        }
        const blob = await api("/git/blobs", {
          method: "POST",
          body: { content: file.bytes.toString("base64"), encoding: "base64" },
        });
        tree.push({
          path: file.path,
          mode: "100644",
          type: "blob",
          sha: blob.sha,
        });
      }
      const result = await api("/git/trees", {
        method: "POST",
        body: { base_tree: base.tree.sha, tree },
      });
      const commit = await api("/git/commits", {
        method: "POST",
        body: {
          message: `blog: ${p.operation === "delete" ? "remove " : ""}${job.title}`,
          tree: result.sha,
          parents: [p.base],
        },
      });
      // Persist the candidate before moving the branch so a lost response is recoverable.
      job.sha = commit.sha;
      job.message = "正在提交到主分支";
      await this.persist(job);
      try {
        await api("/git/refs/heads/main", {
          method: "PATCH",
          body: { sha: commit.sha, force: false },
        });
      } catch (error) {
        const current = await api("/git/ref/heads/main");
        if (current.object.sha !== commit.sha) {
          job.sha = null;
          throw error;
        }
      }
      if (p.operation !== "delete") {
        await this.store.snapshot(p.id);
        await this.store.published(p.id, {
          sha: commit.sha,
          contentHash: p.contentHash,
          url: job.url,
        });
      }
      job.state = "deploying";
      job.message = "代码已提交，等待 GitHub Pages 部署";
      await this.persist(job);
    } catch (error) {
      job.state = job.sha ? "uncertain" : "failed";
      job.message = error.message;
      await this.persist(job);
    }
  }
  async status(id) {
    const job = this.jobs.get(id);
    if (!job) throw new Error("任务不存在");
    if (
      ["deploying", "uncertain", "deploy-failed"].includes(job.state) &&
      job.sha
    ) {
      try {
        const data = await this.api(
          `/repos/${REPO}/actions/runs?head_sha=${job.sha}`,
        );
        const runs = data.workflow_runs.filter(
          (x) => x.event === "push" && x.path === ".github/workflows/hugo.yml",
        );
        const run = runs.sort((a, b) => b.id - a.id)[0];
        if (run) {
          job.actionsUrl = run.html_url;
          if (run.status === "completed") {
            job.state =
              run.conclusion === "success" ? "verifying" : "deploy-failed";
            job.message =
              run.conclusion === "success"
                ? "部署成功，检查线上文章"
                : "部署未成功：" + run.conclusion;
          }
        }
        if (job.state === "verifying") {
          const response = await this.web(job.url + "?studio=" + job.sha, {
            signal: AbortSignal.timeout(15000),
          });
          const html = await response.text();
          const marker = await this.web(SITE + "/" + job.marker, {
            signal: AbortSignal.timeout(15000),
          });
          const revision = await marker.text();
          if (
            response.ok &&
            html.includes("/css/main.css") &&
            (job.operation !== "delete" ||
              html.includes('id="studio-removed"')) &&
            marker.ok &&
            revision === job.contentHash
          ) {
            job.state = job.operation === "delete" ? "deleted" : "published";
            job.message =
              job.operation === "delete"
                ? "文章已移除，旧链接显示删除提示；Git 历史及附件保留"
                : "文章已上线";
            if (job.draftId && job.contentHash)
              await this.store.published(job.draftId, {
                sha: job.sha,
                contentHash: job.contentHash,
                url: job.url,
              });
          } else {
            job.state = "deploying";
            job.message = "部署成功，等待公网缓存更新";
          }
        }
        await this.persist(job);
      } catch {
        job.message = "暂时无法查询部署状态；提交记录已保留，可稍后刷新";
      }
    }
    return job;
  }
}
