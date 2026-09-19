import { parseMarkdown, slugify } from "./core.mjs";

export const TYPES = {
  article: "文章",
  snippet: "代码片段",
  conversation: "对话摘录",
};
const languages = {
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  tsx: "tsx",
  jsx: "jsx",
  py: "python",
  go: "go",
  rs: "rust",
  java: "java",
  sh: "bash",
  zsh: "bash",
  bash: "bash",
  sql: "sql",
  html: "html",
  css: "css",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  toml: "toml",
  xml: "xml",
  c: "c",
  h: "c",
  cpp: "cpp",
  cs: "csharp",
  rb: "ruby",
  php: "php",
  swift: "swift",
  kt: "kotlin",
  r: "r",
  vue: "html",
};
export function languageFor(filename = "") {
  return languages[filename.split(".").pop().toLowerCase()] || "text";
}
export function codeBlock(code, language = "text") {
  if (typeof code !== "string" || !code.trim())
    throw new Error("请填写代码内容");
  if (!/^[a-z0-9_+-]{1,24}$/i.test(language))
    throw new Error("代码语言仅支持英文名称，如 python、javascript、go");
  const longest = Math.max(
    2,
    ...[...code.matchAll(/`+/g)].map((m) => m[0].length),
  );
  const fence = "`".repeat(longest + 1);
  return `${fence}${language.toLowerCase()}\n${code}${code.endsWith("\n") ? "" : "\n"}${fence}`;
}
function bounded(raw) {
  if (typeof raw !== "string" || Buffer.byteLength(raw) > 5 * 1024 * 1024)
    throw new Error("导入内容最大 5 MB；大导出文件请先提取需要的一段对话");
  if (!raw.trim()) throw new Error("请先输入或选择内容");
}
function readExport(raw) {
  bounded(raw);
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("不是有效的 JSON，请选择普通文本或代码片段模式");
  }
  if (
    Array.isArray(data) &&
    data.length &&
    data.every((x) => x && typeof x.role === "string")
  )
    return [{ title: "导入的对话", messages: data }];
  const conversations = Array.isArray(data) ? data : [data];
  if (
    !conversations.length ||
    conversations.length > 2000 ||
    conversations.some(
      (x) =>
        !x ||
        typeof x !== "object" ||
        (!x.mapping && !Array.isArray(x.messages)),
    )
  )
    throw new Error(
      "支持 messages 数组，或包含 mapping / current_node 的对话导出格式",
    );
  return conversations;
}
export function conversationChoices(raw) {
  return readExport(raw).map((c, index) => ({
    index,
    title: String(c.title || `对话 ${index + 1}`).slice(0, 180),
  }));
}
function selectedMessages(conversation) {
  if (Array.isArray(conversation.messages)) return conversation.messages;
  const mapping = conversation.mapping;
  if (!mapping || typeof mapping !== "object" || !conversation.current_node)
    throw new Error(
      "此对话缺少 current_node，无法确定分支；请改用 messages 格式或粘贴所需文本",
    );
  const result = [],
    seen = new Set();
  let cursor = conversation.current_node;
  while (cursor) {
    if (seen.has(cursor) || seen.size > 5000 || !Object.hasOwn(mapping, cursor))
      throw new Error("对话分支数据损坏或过大，无法安全导入");
    seen.add(cursor);
    const node = mapping[cursor];
    if (node.message) result.push(node.message);
    cursor = node.parent;
  }
  return result.reverse();
}
function visibleText(message) {
  const role = message.role || message.author?.role;
  if (
    !["user", "assistant"].includes(role) ||
    message.metadata?.is_visually_hidden_from_conversation ||
    (message.channel && !["final"].includes(message.channel))
  )
    return null;
  const content = message.content;
  const parts =
    typeof content === "string"
      ? [content]
      : Array.isArray(content)
        ? content
        : Array.isArray(content?.parts)
          ? content.parts
          : [];
  const text = parts
    .map((p) =>
      typeof p === "string"
        ? p
        : p?.type === "text" && typeof p.text === "string"
          ? p.text
          : null,
    )
    .filter((x) => x !== null)
    .join("\n");
  if (!text.trim()) return null;
  return {
    role,
    text,
    omittedParts: parts.some(
      (p) =>
        typeof p !== "string" &&
        !(p?.type === "text" && typeof p.text === "string"),
    ),
  };
}
function renderTurns(turns) {
  return turns
    .map(
      (turn, i) =>
        `## ${i + 1}. ${turn.role === "user" ? "我" : "GPT / 助手"}\n\n${turn.text.trim()}`,
    )
    .join("\n\n---\n\n");
}
export function parseDialogueText(raw) {
  bounded(raw);
  let fence = null;
  const turns = [];
  let preamble = [];
  for (const line of raw.replace(/\r\n?/g, "\n").split("\n")) {
    const fm = line.match(/^\s*(`{3,}|~{3,})/);
    const marker =
      !fence &&
      line.match(
        /^(?:#{1,6}\s*)?(?:\*\*)?(用户|我|你说|You said|User|ChatGPT said|ChatGPT|GPT|助手|Assistant)(?:\*\*)?(?:\s*[:：]\s*(.*)|\s*)$/i,
      );
    if (marker) {
      turns.push({
        role: /^(用户|我|你说|You said|User)$/i.test(marker[1])
          ? "user"
          : "assistant",
        lines: [marker[2] || ""],
      });
    } else if (turns.length) turns.at(-1).lines.push(line);
    else preamble.push(line);
    if (fm) {
      if (!fence) fence = fm[1];
      else if (fm[1][0] === fence[0] && fm[1].length >= fence.length)
        fence = null;
    }
  }
  if (!turns.length)
    return {
      body: raw,
      notes: [
        "未识别出说话人标记，保留原文；可自行添加“我：”“GPT：”后再转换。",
      ],
    };
  const body = [
    preamble.join("\n").trim(),
    renderTurns(turns.map((t) => ({ role: t.role, text: t.lines.join("\n") }))),
  ]
    .filter(Boolean)
    .join("\n\n");
  return {
    body,
    notes: [`已识别 ${turns.length} 条发言；请检查角色和摘录范围。`],
  };
}
export function importContent(input) {
  const { raw, filename = "新内容.md" } = input;
  bounded(raw);
  const ext = filename.split(".").pop().toLowerCase();
  const mode =
    input.mode ||
    (["md", "markdown", "txt"].includes(ext)
      ? "article"
      : ext === "json"
        ? "conversation-json"
        : "snippet");
  let doc,
    notes = [];
  if (mode === "article") doc = parseMarkdown(raw, filename);
  else if (mode === "snippet") {
    const language = input.language || languageFor(filename);
    doc = parseMarkdown(
      codeBlock(raw, language),
      filename.replace(/\.[^.]+$/, ".md"),
    );
    doc.title =
      filename
        .split(/[\\/]/)
        .pop()
        .replace(/\.[^.]+$/, "") || "代码片段";
    doc.contentType = "snippet";
    doc.tags = [language];
    doc.categories = ["代码片段"];
  } else if (mode === "conversation-text") {
    const parsed = parseDialogueText(raw);
    doc = parseMarkdown(parsed.body, filename);
    doc.contentType = "conversation";
    notes = parsed.notes;
  } else if (mode === "conversation-json") {
    const conversations = readExport(raw);
    const index = input.conversationIndex;
    if (!Number.isInteger(index) || index < 0 || index >= conversations.length)
      throw new Error("请先选择一段对话，不会批量导入或发布整份记录");
    const c = conversations[index],
      messages = selectedMessages(c);
    const turns = messages.map(visibleText).filter(Boolean);
    if (!turns.length) throw new Error("所选对话没有可导入的用户或助手文本");
    doc = parseMarkdown(renderTurns(turns), filename);
    doc.title = String(c.title || "对话摘录").slice(0, 180);
    doc.slug = slugify(doc.title) + "-" + Date.now().toString(36);
    doc.contentType = "conversation";
    notes = [
      `仅导入所选对话当前分支的 ${turns.length} 条用户 / 助手文本。`,
      ...(turns.length !== messages.length || turns.some((x) => x.omittedParts)
        ? [
            "系统消息、工具消息、隐藏消息或非文本附件已跳过；不会从链接下载附件。",
          ]
        : []),
    ];
  } else throw new Error("未知导入类型");
  if (input.title?.trim()) doc.title = input.title.trim();
  if (doc.contentType === "conversation") {
    doc.categories = ["对话摘录"];
    doc.tags = ["GPT对话"];
  }
  if (input.source !== undefined) doc.source = input.source;
  return { doc, notes };
}
