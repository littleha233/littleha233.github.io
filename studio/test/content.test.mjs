import test from "node:test";
import assert from "node:assert/strict";
import { marked } from "marked";
import {
  importContent,
  codeBlock,
  conversationChoices,
  parseDialogueText,
} from "../content.mjs";
import {
  parseMarkdown,
  serialize,
  validate,
  suggest,
  warnings,
} from "../core.mjs";

test("code imports preserve text and nested Markdown fences", () => {
  const code = "const text = `\n```md\nHello\n```\n`;\n\n  // keep spacing  \n";
  const imported = importContent({ raw: code, filename: "example.js" });
  assert.equal(imported.doc.contentType, "snippet");
  assert.match(imported.doc.body, /^````javascript/);
  const token = marked.lexer(imported.doc.body).find((t) => t.type === "code");
  assert.equal(token.text, code.replace(/\n$/, ""));
  assert.equal(parseMarkdown(serialize(imported.doc)).contentType, "snippet");
  assert.throws(() => codeBlock("foo", "js\n```"), /代码语言/);
});
test("conversation text respects roles and ignores role markers in code blocks", () => {
  const result = parseDialogueText(
    "我：问题\n\nGPT：回答\n```text\nUser: this is code\n```\n我：追问",
  );
  assert.match(result.body, /## 1\. 我/);
  assert.match(result.body, /## 2\. GPT \/ 助手/);
  assert.match(result.body, /## 3\. 我/);
  assert.match(result.body, /User: this is code/);
  assert.equal(result.notes.length, 1);
  assert.equal(
    parseDialogueText("无角色标识的一段文字").body,
    "无角色标识的一段文字",
  );
});
test("JSON imports require explicit selection and exclude unrelated conversations", () => {
  const raw = JSON.stringify([
    {
      title: "第一段",
      messages: [
        { role: "user", content: "阅读问题" },
        { role: "assistant", content: "回答" },
      ],
    },
    {
      title: "另一段",
      messages: [{ role: "user", content: "不应导入的内容" }],
    },
  ]);
  assert.equal(conversationChoices(raw).length, 2);
  assert.throws(
    () => importContent({ raw, filename: "export.json" }),
    /选择一段/,
  );
  const { doc } = importContent({
    raw,
    filename: "export.json",
    conversationIndex: 0,
  });
  assert.equal(doc.title, "第一段");
  assert.equal(doc.contentType, "conversation");
  assert.ok(!doc.body.includes("不应导入"));
  assert.ok(warnings(doc).some((x) => x.includes("对话将公开")));
});
test("mapping export follows current branch and skips hidden/system/non-text messages", () => {
  const raw = JSON.stringify({
    title: "选中分支",
    current_node: "end",
    mapping: {
      root: {
        parent: null,
        message: {
          author: { role: "system" },
          content: { parts: ["system secret"] },
        },
      },
      u: {
        parent: "root",
        message: { author: { role: "user" }, content: { parts: ["问题"] } },
      },
      hidden: {
        parent: "u",
        message: {
          author: { role: "assistant" },
          channel: "analysis",
          content: { parts: ["hidden analysis"] },
        },
      },
      end: {
        parent: "hidden",
        message: {
          author: { role: "assistant" },
          content: { parts: ["最终回答", { image: "not fetched" }] },
        },
      },
      other: {
        parent: "u",
        message: {
          author: { role: "assistant" },
          content: { parts: ["另一个分支"] },
        },
      },
    },
  });
  const { doc, notes } = importContent({
    raw,
    filename: "chat.json",
    conversationIndex: 0,
  });
  assert.match(doc.body, /问题/);
  assert.match(doc.body, /最终回答/);
  for (const forbidden of [
    "system secret",
    "hidden analysis",
    "另一个分支",
    "not fetched",
  ])
    assert.ok(!doc.body.includes(forbidden));
  assert.ok(notes.some((x) => x.includes("跳过")));
});
test("invalid/cyclic conversation data and huge imports fail safely", () => {
  assert.throws(() => conversationChoices("{no json}"), /JSON/);
  assert.throws(
    () => conversationChoices(JSON.stringify({ other: [] })),
    /支持/,
  );
  assert.throws(
    () =>
      importContent({
        raw: JSON.stringify({
          mapping: { a: { parent: "a" } },
          current_node: "a",
        }),
        filename: "chat.json",
        conversationIndex: 0,
      }),
    /损坏/,
  );
  assert.throws(
    () => importContent({ raw: "x".repeat(5 * 1024 * 1024 + 1) }),
    /5 MB/,
  );
});
test("source links and content type survive export/reimport without duplicate footers", () => {
  const doc = importContent({
    raw: "今天读书，记录生活与思考。",
    filename: "reading.md",
  }).doc;
  doc.source = "https://example.com/reading";
  doc.contentType = "conversation";
  const exported = serialize(doc);
  const imported = parseMarkdown(exported, "reading.md");
  assert.equal(imported.source, doc.source);
  assert.equal(imported.contentType, "conversation");
  assert.equal(serialize(imported), exported);
  assert.throws(
    () => validate({ ...doc, source: "javascript:alert(1)" }),
    /HTTP/,
  );
  assert.throws(
    () => validate({ ...doc, source: "https://user:password@example.com/" }),
    /账号密码/,
  );
  assert.throws(() => validate({ ...doc, contentType: "unknown" }), /内容类型/);
  assert.ok(
    suggest(doc).categories.some((c) => ["阅读与思考", "生活随记"].includes(c)),
  );
});
test("JSON code remains a snippet when explicitly selected", () => {
  const { doc } = importContent({
    raw: '{"enabled":true}',
    filename: "config.json",
    mode: "snippet",
  });
  assert.equal(doc.contentType, "snippet");
  assert.match(doc.body, /```json/);
});
