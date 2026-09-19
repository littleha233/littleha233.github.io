import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { parseDocument, DomUtils } from "htmlparser2";
import { createPreviewPages } from "../preview.mjs";
import { diagnostics } from "../diagnostics.mjs";
import { start } from "../server.mjs";

test("complex preview is bounded, preserves every block and cross-page anchors without theme scripts", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "studio-preview-pages-"));
  const target = path.join(dir, "public/posts/long/index.html");
  await fs.mkdir(path.dirname(target), { recursive: true });
  const blocks = Array.from(
    { length: 500 },
    (_, i) =>
      `<h2 id="section-${i}">第${i}节</h2><img src="placeholder" data-src="/real.png"><p>${"<span>数学</span>".repeat(20)}</p><pre><code>const a = ${i};</code></pre>`,
  ).join("");
  const original = `<html><head><title>Long</title><link rel="stylesheet" href="/p/test/vendor/katex/katex.min.css"><script src="/theme.js"></script></head><body><article class="md-text"><a href="#section-499">跳转末尾</a>${blocks}</article></body></html>`;
  await fs.writeFile(target, original);
  try {
    const result = await createPreviewPages(dir, "long", "/p/test/");
    assert.ok(result.pages > 1);
    assert.equal(result.autoLoad, true);
    const texts = [],
      headings = [];
    for (let i = 1; i <= result.pages; i++) {
      const html = await fs.readFile(
        path.join(dir, `public/__studio_preview/page-${i}.html`),
        "utf8",
      );
      assert.ok(Buffer.byteLength(html) < 110 * 1024);
      assert.ok(!html.includes("<script"));
      assert.match(html, /katex.min.css/);
      const tree = parseDocument(html);
      for (const img of DomUtils.findAll((e) => e.name === "img", tree.children)) {
        assert.equal(img.attribs.src, "/real.png");
        assert.equal(img.attribs.loading, "lazy");
      }
      headings.push(
        ...DomUtils.findAll((e) => e.name === "h2", tree.children).map(
          (e) => e.attribs.id,
        ),
      );
      texts.push(
        ...DomUtils.findAll((e) => e.name === "code", tree.children).map(
          DomUtils.textContent,
        ),
      );
      if (i === 1)
        assert.match(
          html,
          new RegExp(
            `/p/test/__studio_preview/page-${result.pages}.html#section-499`,
          ),
        );
    }
    assert.deepEqual(
      headings,
      Array.from({ length: 500 }, (_, i) => `section-${i}`),
    );
    assert.deepEqual(
      texts,
      Array.from({ length: 500 }, (_, i) => `const a = ${i};`),
    );
    assert.equal(await fs.readFile(target, "utf8"), original);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test("small previews stay unchanged and an indivisible huge block does not auto-load", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "studio-preview-block-"));
  const target = path.join(dir, "public/posts/test/index.html");
  await fs.mkdir(path.dirname(target), { recursive: true });
  try {
    await fs.writeFile(
      target,
      '<article class="md-text"><p>small</p></article>',
    );
    assert.equal(
      (await createPreviewPages(dir, "test", "/p/test/")).path,
      "posts/test/",
    );
    await fs.writeFile(
      target,
      `<article class="md-text"><pre><code>${"x".repeat(300000)}</code></pre></article>`,
    );
    const result = await createPreviewPages(dir, "test", "/p/test/");
    assert.equal(result.autoLoad, false);
    assert.match(
      await fs.readFile(
        path.join(dir, "public/__studio_preview/page-1.html"),
        "utf8",
      ),
      /x{300000}/,
    );
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test("preview diagnostics exclude content and credentials", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "studio-preview-log-"));
  try {
    await diagnostics(dir)("prepare-success", {
      id: "example",
      durationMs: 12,
      nodes: 100,
      title: "private",
      body: "secret",
      token: "credential",
    });
    const raw = await fs.readFile(
      path.join(dir, "preview-diagnostics.jsonl"),
      "utf8",
    );
    assert.doesNotMatch(raw, /private|secret|credential/);
    assert.equal(JSON.parse(raw).nodes, 100);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test("local preview disables document snapshots and records only authenticated frame events", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "studio-preview-http-"));
  let app;
  try {
    app = await start({ dataRoot: dir, port: 15313, previewPort: 15314 });
    const key = "11111111-1111-4111-8111-111111111111";
    await fs.mkdir(path.join(dir, "public"));
    await fs.writeFile(
      path.join(dir, "public/index.html"),
      "<html><head></head><body>preview</body></html>",
    );
    app.publisher.previews.set(key, { dir });
    const r = await fetch(`http://127.0.0.1:15314/p/${key}/`);
    assert.equal(r.status, 200);
    assert.match(await r.text(), /@view-transition\{navigation:none\}/);
    assert.doesNotMatch(
      await fs.readFile(path.join(dir, "public/index.html"), "utf8"),
      /view-transition/,
    );
    const base = "http://127.0.0.1:15313";
    const { csrf } = await (await fetch(base + "/api/bootstrap")).json();
    const headers = {
      "Content-Type": "application/json",
      "X-Studio-Key": csrf,
    };
    assert.equal(
      (
        await fetch(base + "/api/preview-event", {
          method: "POST",
          headers,
          body: JSON.stringify({ key, event: "load", body: "must-not-log" }),
        })
      ).status,
      200,
    );
    assert.doesNotMatch(
      await fs.readFile(path.join(dir, "preview-diagnostics.jsonl"), "utf8"),
      /must-not-log/,
    );
    assert.equal(
      (
        await fetch(base + "/api/preview-event", {
          method: "POST",
          headers,
          body: JSON.stringify({ key, event: "forged" }),
        })
      ).status,
      400,
    );
    assert.equal(
      (await fetch(`http://127.0.0.1:15314/p/${key}/missing.html`)).status,
      404,
    );
    assert.equal((await fetch(base + "/api/bootstrap")).status, 200);
  } finally {
    await app?.close();
    await fs.rm(dir, { recursive: true, force: true });
  }
});
