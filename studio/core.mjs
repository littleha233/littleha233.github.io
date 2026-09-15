import yaml from "js-yaml";
import { createHash } from "node:crypto";

export const hash = (value) => createHash("sha256").update(value).digest("hex");
export const list = (value) =>
  [
    ...new Set(
      (Array.isArray(value)
        ? value.flat(4)
        : String(value || "").split(/[,，;；\n]/)
      )
        .map(String)
        .map((x) => x.trim())
        .filter(Boolean),
    ),
  ].slice(0, 16);
export function dateNow() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}
export function parseMarkdown(raw, filename = "新文章.md") {
  if (typeof raw !== "string" || Buffer.byteLength(raw) > 1024 * 1024)
    throw new Error("Markdown 请控制在 1 MB 以内");
  raw = raw.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  let meta = {},
    body = raw;
  if (raw.startsWith("---\n")) {
    const end = raw.indexOf("\n---", 4);
    if (end < 0) throw new Error("文章信息区缺少结束的 ---");
    meta = yaml.load(raw.slice(4, end), { schema: yaml.JSON_SCHEMA }) || {};
    if (typeof meta !== "object" || Array.isArray(meta))
      throw new Error("文章信息区必须是 YAML 对象");
    body = raw.slice(end + 4).replace(/^\n/, "");
  }
  return {
    title: String(
      meta.title ||
        body.match(/^#\s+(.+)$/m)?.[1] ||
        filename.replace(/\.md$/i, ""),
    ),
    slug: slugify(filename.replace(/\.md$/i, "")),
    date: String(meta.date || dateNow())
      .replace("T", " ")
      .replace(/(?:Z|\+08:00)$/, ""),
    description: String(meta.description || meta.excerpt || ""),
    categories: list(meta.categories || meta.category),
    tags: list(meta.tags),
    body,
  };
}
export function slugify(value) {
  const slug = String(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || `note-${Date.now().toString(36)}`;
}
export function validate(doc) {
  if (!doc || typeof doc !== "object") throw new Error("无效草稿");
  for (const field of ["title", "slug", "date", "description", "body"])
    if (typeof doc[field] !== "string")
      throw new Error(`字段 ${field} 必须是文本`);
  if (!doc.title.trim() || doc.title.length > 180)
    throw new Error("请填写 1–180 字的标题");
  if (!/^[a-z0-9][a-z0-9_-]{0,79}$/.test(doc.slug))
    throw new Error("文章地址只能包含小写字母、数字、- 和 _，最多 80 字符");
  if (
    !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(doc.date) ||
    !Number.isFinite(Date.parse(doc.date.replace(" ", "T") + "+08:00"))
  )
    throw new Error("日期格式应为 YYYY-MM-DD HH:mm:ss");
  if (Date.parse(doc.date.replace(" ", "T") + "+08:00") > Date.now() + 60000)
    throw new Error("第一版不支持定时发布，请使用当前或过去的日期");
  if (!doc.body.trim() || Buffer.byteLength(doc.body) > 1024 * 1024)
    throw new Error("正文不能为空，且不能超过 1 MB");
  if (doc.description.length > 600) throw new Error("摘要最多 600 字");
  // Imported Markdown is content, never a Hexo template with access to local files.
  if (/\{%|\{\{/.test(doc.body))
    throw new Error(
      "为保护本地文件，第一版不执行 Hexo 模板标签（{% 或 {{）；请改用普通 Markdown",
    );
  if (
    /<\s*(script|iframe|object|embed|form)\b|\son\w+\s*=|javascript\s*:/i.test(
      doc.body,
    )
  )
    throw new Error("请移除脚本、表单、iframe 或事件属性后再预览");
  return {
    ...doc,
    title: doc.title.trim(),
    categories: list(doc.categories),
    tags: list(doc.tags),
  };
}
export function serialize(doc) {
  doc = validate(doc);
  return (
    "---\n" +
    yaml.dump(
      {
        title: doc.title,
        date: doc.date,
        description: doc.description,
        categories: doc.categories,
        tags: doc.tags,
      },
      { lineWidth: -1, noRefs: true },
    ) +
    "---\n\n" +
    doc.body.trim() +
    "\n"
  );
}
export function formatMarkdown(body) {
  let fence = null;
  return (
    body
      .replace(/\r\n?/g, "\n")
      .split("\n")
      .map((line) => {
        const m = line.match(/^\s*(`{3,}|~{3,})/);
        if (m) {
          if (!fence) fence = m[1];
          else if (m[1][0] === fence[0] && m[1].length >= fence.length)
            fence = null;
          return line;
        }
        if (fence) return line;
        // Preserve Markdown's significant two trailing spaces and every code block.
        return line
          .replace(/\t+$/, "")
          .replace(/ +$/, (s) => (s.length >= 2 ? "  " : ""));
      })
      .join("\n")
      .trim() + "\n"
  );
}
const topics = [
  [
    "区块链研究",
    [
      "区块链",
      "blockchain",
      "智能合约",
      "ethereum",
      "solidity",
      "以太坊",
      "defi",
    ],
  ],
  [
    "密码学与安全",
    ["密码学", "加密", "签名", "eddsa", "mpc", "安全", "零知识", "zkp", "密钥"],
  ],
  [
    "工程实践",
    [
      "工程",
      "部署",
      "docker",
      "git",
      "数据库",
      "api",
      "测试",
      "node",
      "python",
      "rust",
      "golang",
    ],
  ],
  ["工作随记", ["工作", "总结", "复盘", "会议", "计划", "随记"]],
];
const knownTags = [
  "区块链",
  "智能合约",
  "云计算",
  "系统设计",
  "钱包工程",
  "算法",
  "学习记录",
  "工作记录",
  "MPC",
  "EdDSA",
  "Git",
  "Go",
  "Python",
  "Rust",
  "Docker",
  "Hexo",
  "Stellar",
  "DeFi",
  "Solidity",
];
function score(text, term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (
    text.match(
      new RegExp(/^[\w ]+$/.test(term) ? `\\b${escaped}\\b` : escaped, "gi"),
    ) || []
  ).length;
}
export function suggest(doc, taxonomy = { categories: [], tags: [] }) {
  const text = `${doc.title}\n${doc.title}\n${doc.body}`;
  const ranked = topics
    .map(([name, terms]) => ({
      name,
      score: terms.reduce((n, t) => n + score(text, t), 0),
    }))
    .filter((x) => x.score)
    .sort((a, b) => b.score - a.score);
  const categories = [
    ...new Set([
      ...ranked.map((x) => x.name),
      ...taxonomy.categories.filter((x) => score(text, x) > 0),
    ]),
  ].slice(0, 1);
  const tags = [...new Set([...taxonomy.tags, ...knownTags])]
    .map((name) => ({ name, score: score(text, name) }))
    .filter((x) => x.score)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((x) => x.name);
  const description = doc.body
    .replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#*>`_\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 150);
  return {
    categories: categories.length ? categories : ["工作随记"],
    tags,
    description,
    method: "本地关键词匹配 + 现有博客词库，不上传正文；建议请确认后采用",
  };
}
export function warnings(doc) {
  const items = [];
  if (
    /-----BEGIN .*PRIVATE KEY-----|\b(?:ghp_|github_pat_|sk-proj-)[A-Za-z0-9_]{16,}/.test(
      doc.body,
    )
  )
    items.push("检测到可能的私钥或访问令牌，请删除后发布");
  if (
    /\b(?:password|secret|api_key|token)\s*[:=]\s*["'][^"']{8,}["']/i.test(
      doc.body,
    )
  )
    items.push("疑似包含密码或密钥赋值，请人工检查");
  if (!doc.categories.length) items.push("尚未设置分类");
  if (!doc.tags.length) items.push("尚未设置标签");
  return items;
}
export function assetName(name) {
  const base = String(name).split(/[\\/]/).pop().normalize("NFKC");
  if (
    !/^[\p{L}\p{N}_. -]{1,150}\.(png|jpe?g|gif|webp|avif|pdf)$/iu.test(base) ||
    base.startsWith(".")
  )
    throw new Error(
      "附件仅支持 PNG、JPEG、GIF、WebP、AVIF、PDF，文件名不能包含特殊符号",
    );
  return base;
}
export function rewriteAsset(body, oldPath, url) {
  const basename = oldPath.split(/[\\/]/).pop();
  const candidates = [
    ...body.matchAll(/!?\[[^\]\n]*\]\((?:<([^>]+)>|([^\s)]+))/g),
  ].map((m) => m[1] || m[2]);
  candidates.push(
    ...[...body.matchAll(/^\s*\[[^\]]+\]:\s*(\S+)/gm)].map((m) => m[1]),
  );
  const paths = [
    ...new Set(
      candidates
        .map((p) => {
          try {
            return decodeURIComponent(p);
          } catch {
            return p;
          }
        })
        .filter(
          (p) =>
            !/^(?:https?:|data:|\/)/i.test(p) &&
            p.split("/").pop() === basename,
        ),
    ),
  ];
  const matches = (p) =>
    p === oldPath ||
    p === basename ||
    p === "./" + basename ||
    (paths.length === 1 && p === paths[0]);
  return body
    .replace(/(!?\[[^\]\n]*\]\()([^\n]*?)(\))/g, (all, start, target, end) => {
      const match = target.match(/^(?:<([^>]+)>|([^\s]+))(.*)$/);
      if (!match) return all;
      let p;
      try {
        p = decodeURIComponent(match[1] || match[2]);
      } catch {
        return all;
      }
      if (/^(?:https?:|data:|\/)/i.test(p)) return all;
      return matches(p) ? start + url + match[3] + end : all;
    })
    .replace(/^(\s*\[[^\]]+\]:\s*)(\S+)/gm, (all, prefix, p) =>
      matches(p) ? prefix + url : all,
    );
}
