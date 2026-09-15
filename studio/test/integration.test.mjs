import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { DraftStore } from "../store.mjs";
import { Publisher } from "../publisher.mjs";
import { parseMarkdown } from "../core.mjs";
import { start } from "../server.mjs";
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const raw =
  '# 工作台验证\n\n这是本地测试，不会公开发布。Git 工程实践。\n\n```js\nconsole.log("hello")\n```\n';
test("draft optimistic revision, assets, backup and isolated Stellar build", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "studio-test-"));
  const store = new DraftStore(dir);
  await store.init();
  const publisher = new Publisher(root, store);
  await publisher.init();
  try {
    let draft = await store.create(
      parseMarkdown(raw, "studio-integration-check.md"),
    );
    const initial = draft;
    draft = await store.save(draft.id, {
      ...draft,
      tags: ["Git"],
      categories: ["工程实践"],
    });
    await assert.rejects(store.save(draft.id, initial), /另一窗口/);
    draft = await store.attach(draft.id, {
      name: "test.pdf",
      data: Buffer.from("%PDF-1.4\n%%EOF").toString("base64"),
    });
    assert.equal(draft.assets.length, 1);
    const built = await publisher.prepare(draft.id);
    assert.equal(built.files.length, 3);
    assert.match(built.after, /工程实践/);
    const preview = publisher.previews.get(built.key);
    const html = await fs.readFile(
      path.join(
        preview.dir,
        "public/posts/studio-integration-check/index.html",
      ),
      "utf8",
    );
    assert.match(html, /Stellar/);
    assert.match(html, /工作台验证/);
    assert.equal(
      (await fs.readdir(path.join(root, "source/_posts"))).includes(
        "studio-integration-check.md",
      ),
      false,
    );
    await store.save(draft.id, { ...draft, title: "发生修改" });
    await assert.rejects(publisher.publish(built.key, true), /草稿已变化/);
    await store.snapshot(draft.id);
    assert.equal(
      (await fs.readdir(path.join(store.folder(draft.id), "history"))).length,
      1,
    );
  } finally {
    for (const p of publisher.previews.values())
      await fs.rm(p.dir, { recursive: true, force: true });
    await fs.rm(dir, { recursive: true, force: true });
  }
});
test("publishing only selected files, fast-forward guard and durable job", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "studio-publish-test-"));
  const store = new DraftStore(dir);
  await store.init();
  let calls = [];
  const api = async (endpoint, options) => {
    calls.push({ endpoint, ...options });
    if (endpoint.endsWith("/git/ref/heads/main"))
      return { object: { sha: "base" } };
    if (endpoint.endsWith("/git/commits/base"))
      return { tree: { sha: "base-tree" } };
    if (endpoint.endsWith("/git/blobs")) return { sha: "blob" };
    if (endpoint.endsWith("/git/trees")) return { sha: "tree" };
    if (endpoint.endsWith("/git/commits")) return { sha: "new-sha" };
    return {};
  };
  try {
    const d = await store.create(parseMarkdown(raw, "publish-test.md"));
    const p = {
      id: d.id,
      base: "base",
      files: [
        { path: "source/_posts/publish-test.md", bytes: Buffer.from(raw) },
      ],
      contentHash: "content",
    };
    const pub = new Publisher(root, store, api);
    await pub.init();
    const job = { id: "test-job", title: d.title, state: "publishing" };
    await pub.runPublish(job, p, "fake-test-auth");
    assert.equal(job.state, "deploying");
    assert.equal(calls.find((x) => x.method === "PATCH").body.force, false);
    assert.equal(
      calls.find((x) => x.endpoint.endsWith("/git/trees")).body.tree.length,
      1,
    );
    assert.equal((await store.get(d.id)).publication.sha, "new-sha");
    calls = [];
    const stale = new Publisher(root, store, async () => ({
      object: { sha: "moved" },
    }));
    const failed = { id: "failed-job", title: d.title };
    await stale.runPublish(failed, p, "fake");
    assert.equal(failed.state, "failed");
    assert.match(failed.message, /已更新/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});
test("localhost API blocks cross-origin/unauthenticated calls, save and export", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "studio-http-test-"));
  let app;
  try {
    app = await start({ root, dataRoot: dir, port: 14313, previewPort: 14314 });
    const base = "http://127.0.0.1:14313";
    assert.equal((await fetch(base + "/api/library")).status, 403);
    assert.equal(
      (
        await fetch(base + "/api/bootstrap", {
          headers: { Origin: "https://evil.example" },
        })
      ).status,
      403,
    );
    const hostile = await new Promise((resolve, reject) => {
      http
        .get(
          base + "/api/bootstrap",
          { headers: { Host: "evil.example" } },
          (r) => {
            r.resume();
            resolve(r.statusCode);
          },
        )
        .on("error", reject);
    });
    assert.equal(hostile, 403);
    const { csrf } = await (await fetch(base + "/api/bootstrap")).json();
    const headers = {
      "X-Studio-Key": csrf,
      "Content-Type": "application/json",
    };
    const imported = await (
      await fetch(base + "/api/import", {
        method: "POST",
        headers,
        body: JSON.stringify({ raw, filename: "api-test.md" }),
      })
    ).json();
    assert.ok(imported.id);
    const exported = await (
      await fetch(base + "/api/export", {
        method: "POST",
        headers,
        body: JSON.stringify({ id: imported.id }),
      })
    ).json();
    assert.match(exported.markdown, /工作台验证/);
    assert.equal((await fetch(base + "/.blog-studio/drafts")).status, 400);
    const assets = await fetch(base + "/api/attach", {
      method: "POST",
      headers,
      body: JSON.stringify({
        id: imported.id,
        name: "evil.html",
        data: "YWJj",
      }),
    });
    assert.equal(assets.status, 400);
  } finally {
    if (app) await app.close();
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test("deployment only succeeds after matching revision is publicly available", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "studio-status-test-"));
  const store = new DraftStore(dir);
  await store.init();
  let revision = "old";
  let conclusion = "success";
  const api = async () => ({
    workflow_runs: [
      {
        id: 1,
        event: "push",
        path: ".github/workflows/hugo.yml",
        status: "completed",
        conclusion,
        html_url: "https://github.com/example/run",
      },
    ],
  });
  const web = async (url) =>
    new Response(
      url.includes("revision-") ? revision : '<link href="/css/main.css">',
      { status: 200 },
    );
  try {
    const p = new Publisher(root, store, api, web);
    await p.init();
    const job = {
      id: "status-test",
      sha: "sha",
      state: "deploying",
      url: "https://littleha233.github.io/posts/test/",
      marker: "files/revision-test.txt",
      contentHash: "current",
    };
    await p.persist(job);
    assert.equal((await p.status(job.id)).state, "deploying");
    revision = "current";
    assert.equal((await p.status(job.id)).state, "published");
    job.state = "deploying";
    conclusion = "failure";
    assert.equal((await p.status(job.id)).state, "deploy-failed");
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});
