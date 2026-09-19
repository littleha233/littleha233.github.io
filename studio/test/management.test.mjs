import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Publisher, command } from "../publisher.mjs";
import { DraftStore } from "../store.mjs";
import { start } from "../server.mjs";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
// Exercise pending checker changes before committing, without any remote mutation.
class TestPublisher extends Publisher {
  // Stable migration fixture: later real edits/deletions must not break CI tests.
  async base() {
    return (await command("git", ["rev-parse", "9894ef6"], root)).trim();
  }
  async sync() {
    return this.base();
  }
  async post(file, base) {
    return super.post(file, base || (await this.base()));
  }
  async buildSupport(file) {
    return fs.readFile(path.join(root, file), "utf8");
  }
}
async function fixture(fn) {
  const dir = await fs.mkdtemp(
    path.join(os.tmpdir(), "studio-management-test-"),
  );
  const store = new DraftStore(dir);
  await store.init();
  const pub = new TestPublisher(root, store);
  await pub.init();
  try {
    await fn(pub, store);
  } finally {
    for (const p of pub.previews.values())
      if (p.dir) await fs.rm(p.dir, { recursive: true, force: true });
    await fs.rm(dir, { recursive: true, force: true });
  }
}
test("management API requires local session and routes explicit deletion confirmation", async () => {
  const dir = await fs.mkdtemp(
    path.join(os.tmpdir(), "studio-management-http-"),
  );
  let app;
  try {
    app = await start({ root, dataRoot: dir, port: 15313, previewPort: 15314 });
    const base = "http://127.0.0.1:15313";
    const { csrf } = await (await fetch(base + "/api/bootstrap")).json();
    for (const route of ["edit-post", "prepare-delete", "delete-post"]) {
      assert.equal(
        (
          await fetch(base + "/api/" + route, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{}",
          })
        ).status,
        403,
      );
    }
    const calls = [];
    for (const method of ["editPost", "prepareDelete", "deletePost"])
      app.publisher[method] = async (...args) => {
        calls.push({ method, args });
        return { ok: true };
      };
    const request = async (route, body) =>
      (
        await fetch(base + "/api/" + route, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Studio-Key": csrf },
          body: JSON.stringify(body),
        })
      ).json();
    await request("edit-post", {
      path: "source/_posts/example.md",
      contentHash: "expected",
    });
    await request("prepare-delete", {
      path: "source/_posts/example.md",
      contentHash: "expected",
    });
    await request("delete-post", {
      key: "key",
      slug: "example",
      confirmed: true,
    });
    assert.deepEqual(calls, [
      { method: "editPost", args: ["source/_posts/example.md", "expected"] },
      {
        method: "prepareDelete",
        args: ["source/_posts/example.md", "expected"],
      },
      { method: "deletePost", args: ["key", "example", true] },
    ]);
  } finally {
    if (app) await app.close();
    await fs.rm(dir, { recursive: true, force: true });
  }
});
test("edit published historical post preserves URL, metadata and local edits; checks remote hash", async () =>
  fixture(async (pub, store) => {
    const post = await pub.post("source/_posts/init-blog.md");
    await assert.rejects(pub.editPost(post.path, "stale"), /已变化/);
    await assert.rejects(
      pub.post("source/_posts/../../_config.yml"),
      /无效文章路径/,
    );
    const draft = await pub.editPost(post.path, post.contentHash);
    assert.equal(draft.publication.contentHash, post.contentHash);
    assert.equal(draft.originalMeta.legacy, true);
    const edited = await store.save(draft.id, {
      ...draft,
      body: draft.body + "\n\n测试编辑，不上传。\n",
      originalMeta: { legacy: false },
    });
    assert.equal(
      (await pub.editPost(post.path, post.contentHash)).body,
      edited.body,
    );
    assert.equal((await store.all()).length, 1);
    await assert.rejects(
      store.save(draft.id, { ...edited, slug: "new-slug" }),
      /不能更改地址/,
    );
    const result = await pub.prepare(draft.id);
    assert.equal(result.summary, "更新已发布文章");
    assert.match(result.after, /legacy: true/);
    assert.match(result.after, /测试编辑/);
    assert.ok(
      result.files.some((f) => f.path === "source/_data/studio-history.json"),
    );
    const p = pub.previews.get(result.key);
    const html = await fs.readFile(
      path.join(p.dir, "public/posts/init-blog/index.html"),
      "utf8",
    );
    assert.match(html, /测试编辑/);
    assert.ok(!result.files.some((f) => f.path.startsWith("content/posts/")));
    const actualPost = pub.post.bind(pub);
    pub.post = async () => ({ ...post, contentHash: "different" });
    await assert.rejects(pub.editPost(post.path, post.contentHash), /已变化/);
    pub.post = actualPost;
  }));

test("delete builds tombstone, preserves archives, requires exact confirmation and never resurrects deleted draft", async () =>
  fixture(async (pub, store) => {
    const post = await pub.post("source/_posts/init-blog.md");
    await assert.rejects(pub.prepareDelete(post.path, "stale"), /已变化/);
    const plan = await pub.prepareDelete(post.path, post.contentHash);
    assert.equal(plan.slug, post.slug);
    assert.deepEqual(
      plan.files.filter((f) => f.action === "删除"),
      [{ path: post.path, action: "删除" }],
    );
    assert.ok(!plan.files.some((f) => f.path.startsWith("content/posts/")));
    await assert.rejects(
      pub.deletePost(plan.key, "wrong", true),
      /完整文章地址/,
    );
    await assert.rejects(
      pub.deletePost(plan.key, post.slug, false),
      /完整文章地址/,
    );
    await assert.rejects(pub.publish(plan.key, true), /专用确认/);
    const p = pub.previews.get(plan.key);
    p.created = 0;
    await assert.rejects(pub.deletePost(plan.key, post.slug, true), /过期/);
    p.created = Date.now();
    // Stub dispatch only; explicit confirmation also leaves a durable local original.
    pub.publish = async () => ({ id: "confirmed" });
    assert.equal(
      (await pub.deletePost(plan.key, post.slug, true)).id,
      "confirmed",
    );
    const backup = JSON.parse(
      await fs.readFile(path.join(store.root, "trash", plan.key + ".json")),
    );
    assert.equal(backup.markdown, post.raw);
    const doc = await store.create({ ...post, slug: "studio-deleted-test" });
    await store.published(doc.id, { contentHash: "previous" });
    await assert.rejects(pub.prepare(doc.id), /线上文章/);
  }));

test("delete commit sends only selected deletion, no force; remote movement stops writes", async () =>
  fixture(async (pub, store) => {
    const calls = [];
    pub.api = async (endpoint, opts = {}) => {
      calls.push({ endpoint, ...opts });
      if (endpoint.endsWith("/git/ref/heads/main"))
        return { object: { sha: "base" } };
      if (endpoint.endsWith("/git/commits/base"))
        return { tree: { sha: "base-tree" } };
      return { sha: "new-sha" };
    };
    const p = {
      operation: "delete",
      base: "base",
      files: [
        { path: "source/_posts/example.md", bytes: null },
        {
          path: "source/posts/example/index.md",
          bytes: Buffer.from("removed"),
        },
      ],
    };
    const job = { id: "delete-test", title: "测试", operation: "delete" };
    await pub.runPublish(job, p, "mock");
    assert.equal(job.state, "deploying");
    const tree = calls.find((c) => c.endpoint.endsWith("/git/trees")).body.tree;
    assert.equal(tree[0].sha, null);
    assert.equal(calls.find((c) => c.method === "PATCH").body.force, false);
    assert.equal((await store.all()).length, 0);
    calls.length = 0;
    pub.api = async (endpoint, opts = {}) => {
      calls.push(opts);
      return { object: { sha: "moved" } };
    };
    const stale = { id: "delete-stale", title: "测试" };
    await pub.runPublish(stale, p, "mock");
    assert.equal(stale.state, "failed");
    assert.equal(calls.length, 1);
  }));

test("delete status waits for matching public tombstone and revision", async () =>
  fixture(async (pub) => {
    pub.api = async () => ({
      workflow_runs: [
        {
          id: 1,
          event: "push",
          path: ".github/workflows/hugo.yml",
          status: "completed",
          conclusion: "success",
        },
      ],
    });
    let removed = false;
    pub.web = async (url) =>
      new Response(
        url.includes("revision")
          ? "revision"
          : `<link href="/css/main.css">${removed ? '<p id="studio-removed">已移除</p>' : "旧文章"}`,
      );
    await pub.persist({
      id: "delete-status",
      state: "deploying",
      operation: "delete",
      sha: "sha",
      marker: "revision",
      contentHash: "revision",
      url: "https://example.com/posts/test/",
    });
    assert.equal((await pub.status("delete-status")).state, "deploying");
    removed = true;
    assert.equal((await pub.status("delete-status")).state, "deleted");
  }));
