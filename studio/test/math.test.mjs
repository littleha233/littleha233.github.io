import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import Hexo from "hexo";
import { DraftStore } from "../store.mjs";
import { Publisher } from "../publisher.mjs";
import { parseMarkdown } from "../core.mjs";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const fixturePath = path.join(root, "studio/test/fixtures/math.md");

test("existing Hexo renderer handles math before Markdown and preserves code and prose", async () => {
  const hexo = new Hexo(root, { silent: true });
  await hexo.init();
  try {
    const text = await fs.readFile(fixturePath, "utf8");
    const html = hexo.render.renderSync({ text, engine: "md" });
    assert.equal((html.match(/class="katex"/g) || []).length, 14);
    assert.equal((html.match(/class="katex-display"/g) || []).length, 9);
    assert.ok(!html.includes('class="katex-error"'));
    assert.match(html, /<math xmlns="http:\/\/www.w3.org\/1998\/Math\/MathML"/);
    for (const command of [
      "\\varphi",
      "\\frac",
      "\\sqrt",
      "\\gcd",
      "\\mathbb",
      "\\sum",
      "\\prod",
      "\\pmod",
      "\\left",
      "\\right",
      "a^2",
      "a_i",
    ])
      assert.ok(
        html.includes(command),
        command + " is preserved in the accessible TeX annotation",
      );
    const code = [
      ...html.matchAll(/<(?:pre|code)\b[\s\S]*?<\/(?:pre|code)>/g),
    ].map((m) => m[0]);
    assert.ok(code.length >= 5);
    for (const block of code) assert.ok(!block.includes('class="katex"'));
    assert.match(html, /<code>\$\\varphi\(n\)\$<\/code>/);
    assert.match(html, /\$HOME/);
    assert.match(html, /美元：\$5 和 \$10/);
    assert.match(html, /<strong>粗体<\/strong>/);
    assert.match(html, /<em>斜体<\/em>/);
    assert.match(html, /<blockquote>/);
    assert.match(html, /<table>/);
    assert.match(html, /<li>第一项<\/li>/);
    const toc = hexo.extend.helper.get("toc").call(hexo, html);
    assert.ok(!toc.includes("\\varphi"));
    assert.match(toc, /欧拉函数 φ\(n\)/);
    const failure = hexo.render.renderSync({
      text: "$\\notARealCommand{x}$",
      engine: "md",
    });
    assert.match(failure, /#cc0000/);
    assert.match(failure, /\\notARealCommand/);
    const unsafe = hexo.render.renderSync({
      text: "$\\href{javascript:alert(1)}{x}$",
      engine: "md",
    });
    assert.ok(!unsafe.includes('href="javascript:'));
  } finally {
    await hexo.exit();
  }
});

test("isolated Stellar math preview includes local CSS/fonts, protects code, and guards undeployed renderer", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "studio-math-test-"));
  const store = new DraftStore(dir);
  await store.init();
  const pub = new Publisher(root, store);
  await pub.init();
  try {
    const raw = await fs.readFile(fixturePath, "utf8");
    const draft = await store.create(
      parseMarkdown(raw, "math-rendering-check.md"),
    );
    const built = await pub.prepare(draft.id);
    const p = pub.previews.get(built.key);
    const html = await fs.readFile(
      path.join(p.dir, "public/posts/math-rendering-check/index.html"),
      "utf8",
    );
    assert.ok(!html.includes('class="katex-error"'));
    assert.ok((html.match(/class="katex-display"/g) || []).length >= 9);
    assert.ok(html.includes(`/p/${p.key}/vendor/katex/katex.min.css`));
    assert.ok(html.includes(`/p/${p.key}/css/math.css`));
    assert.ok(!html.includes("cdn.jsdelivr.net/npm/katex"));
    const css = await fs.readFile(
      path.join(p.dir, "public/vendor/katex/katex.min.css"),
      "utf8",
    );
    const fonts = [...css.matchAll(/url\(([^)]+)\)/g)].map((m) =>
      m[1].replace(/["']/g, ""),
    );
    assert.ok(fonts.length > 10);
    for (const font of fonts)
      await fs.access(path.join(p.dir, "public/vendor/katex", font));
    assert.match(
      await fs.readFile(path.join(p.dir, "public/css/math.css"), "utf8"),
      /overflow-x: auto/,
    );
    assert.equal((await store.get(draft.id)).body, raw);
    assert.ok(!built.files.some((f) => f.path === "scripts/math.js"));
    if (p.mathPending)
      await assert.rejects(pub.publish(built.key, true), /合并部署/);
  } finally {
    for (const p of pub.previews.values())
      if (p.dir) await fs.rm(p.dir, { recursive: true, force: true });
    await fs.rm(dir, { recursive: true, force: true });
  }
});
