import test from "node:test";
import assert from "node:assert/strict";
import {
  parseMarkdown,
  serialize,
  suggest,
  formatMarkdown,
  validate,
  assetName,
  rewriteAsset,
  warnings,
} from "../core.mjs";
const raw =
  "---\ntitle: MPC 实践\ndate: 2026-01-12 06:02:45\ncategories: [密码学与安全]\ntags: [MPC, EdDSA]\n---\n\n# MPC 实践\n\n使用 EdDSA 签名。";
test("frontmatter import and roundtrip preserve metadata/body", () => {
  const doc = parseMarkdown(raw, "eddsa-test.md");
  assert.equal(doc.title, "MPC 实践");
  assert.deepEqual(doc.tags, ["MPC", "EdDSA"]);
  const round = parseMarkdown(serialize(doc), "eddsa-test.md");
  assert.equal(round.body.trim(), doc.body.trim());
  assert.equal(round.date, doc.date);
});
test("metadata missing, Chinese names, scalar and list taxonomy", () => {
  const doc = parseMarkdown("# 我的文章\n\n正文", "中文.md");
  assert.match(doc.slug, /^note-/);
  assert.equal(doc.title, "我的文章");
  const d = parseMarkdown(
    "---\ntags: Git, Python\ncategory: 工程实践\n---\n正文",
  );
  assert.deepEqual(d.tags, ["Git", "Python"]);
  assert.deepEqual(d.categories, ["工程实践"]);
});
test("malformed metadata and dangerous Markdown rejected", () => {
  assert.throws(() => parseMarkdown("---\ntitle: foo"));
  for (const body of [
    "{% include /etc/passwd %}",
    "<script>alert(1)</script>",
    '<img onerror="x">',
  ])
    assert.throws(() => validate({ ...parseMarkdown(raw), body }));
  assert.throws(() => validate({ ...parseMarkdown(raw), slug: "../secret" }));
});
test("suggestions match local knowledge, do not mutate manual taxonomy", () => {
  const d = parseMarkdown(raw);
  d.categories = ["个人研究"];
  const s = suggest(d, { categories: [], tags: ["MPC", "EdDSA"] });
  assert.ok(s.categories.includes("密码学与安全"));
  assert.ok(s.tags.includes("MPC"));
  assert.deepEqual(d.categories, ["个人研究"]);
});
test("format preserves fenced code including blank lines and whitespace", () => {
  const code = "```go\nfunc x() {  \n\n\n\n}\n```";
  assert.ok(formatMarkdown("# Title   \n\n" + code + "\n").includes(code));
});
test("asset paths restricted and exact local references rewritten", () => {
  assert.throws(() => assetName("a.html"));
  assert.throws(() => assetName(".secret.png"));
  assert.equal(assetName("folder/a.png"), "a.png");
  assert.equal(
    rewriteAsset(
      "![x](./a.png) [a](https://example.com/a.png)",
      "a.png",
      "/files/new.png",
    ),
    "![x](/files/new.png) [a](https://example.com/a.png)",
  );
  assert.equal(
    rewriteAsset("[pic]: a.png", "a.png", "/files/new.png"),
    "[pic]: /files/new.png",
  );
});
test("credential warnings are explicit", () => {
  assert.ok(
    warnings({
      ...parseMarkdown(raw),
      body: "-----BEGIN PRIVATE KEY-----",
    }).some((x) => x.includes("私钥")),
  );
});
test("nested attachment links resolve only when unambiguous", () => {
  assert.equal(
    rewriteAsset("![x](images/a.png)", "a.png", "/files/new.png"),
    "![x](/files/new.png)",
  );
  assert.equal(
    rewriteAsset("![x](one/a.png) ![y](two/a.png)", "a.png", "/files/new.png"),
    "![x](one/a.png) ![y](two/a.png)",
  );
});
