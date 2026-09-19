import fs from "node:fs/promises";
import path from "node:path";
import { parseDocument, DomUtils } from "htmlparser2";

const escape = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
const count = (node) => {
  let total = 0;
  const stack = [node];
  while (stack.length) {
    const current = stack.pop();
    total++;
    if (current.children)
      for (const child of current.children) stack.push(child);
  }
  return total;
};

// Split generated HTML, never Markdown: formulas, code fences and tables stay intact.
// These files live only in the isolated preview; publication still uses the full draft.
export async function createPreviewPages(dir, slug, prefix) {
  const fullPath = path.join(dir, "public", "posts", slug, "index.html");
  const html = await fs.readFile(fullPath, "utf8");
  const tree = parseDocument(html, {
    lowerCaseAttributeNames: false,
    lowerCaseTags: false,
  });
  const article = DomUtils.findOne(
    (el) =>
      el.name === "article" && el.attribs.class?.split(" ").includes("md-text"),
    tree.children,
  );
  const elements = count(tree);
  const metrics = { htmlBytes: Buffer.byteLength(html), nodes: elements };
  if (!article || (elements < 8000 && metrics.htmlBytes < 256 * 1024))
    return { ...metrics, pages: 1, autoLoad: true, path: `posts/${slug}/` };

  const groups = [];
  let group = [],
    nodes = 0,
    bytes = 0,
    autoLoad = true;
  for (const child of article.children) {
    const size = count(child),
      length = Buffer.byteLength(DomUtils.getOuterHTML(child));
    if (group.length && (nodes + size > 2200 || bytes + length > 96 * 1024)) {
      groups.push(group);
      group = [];
      nodes = 0;
      bytes = 0;
    }
    group.push(child);
    nodes += size;
    bytes += length;
    if (size > 6000 || length > 256 * 1024) autoLoad = false;
  }
  if (group.length) groups.push(group);
  const pagePath = (i) => `${prefix}__studio_preview/page-${i + 1}.html`;
  const anchors = new Map();
  groups.forEach((children, i) => {
    for (const el of DomUtils.findAll(
      (el) => Boolean(el.attribs?.id),
      children,
    ))
      anchors.set(el.attribs.id, i);
  });
  groups.forEach((children) => {
    // Lightweight pages have no theme lazy-loader; use native image loading.
    for (const el of DomUtils.findAll((el) => el.name === "img", children)) {
      if (el.attribs["data-src"]) el.attribs.src = el.attribs["data-src"];
      if (el.attribs["data-srcset"])
        el.attribs.srcset = el.attribs["data-srcset"];
      el.attribs.loading = "lazy";
    }
    for (const el of DomUtils.findAll(
      (el) => el.name === "a" && el.attribs.href?.startsWith("#"),
      children,
    )) {
      try {
        const target = anchors.get(
          decodeURIComponent(el.attribs.href.slice(1)),
        );
        if (target !== undefined)
          el.attribs.href = pagePath(target) + el.attribs.href;
      } catch {
        /* Leave malformed anchors unchanged, as on the published page. */
      }
    }
  });
  const styles = DomUtils.findAll(
    (el) => el.name === "link" && el.attribs.rel === "stylesheet",
    tree.children,
  )
    .map((el) => DomUtils.getOuterHTML(el))
    .join("\n");
  const title = DomUtils.textContent(
    DomUtils.findOne((el) => el.name === "title", tree.children) || {
      children: [],
    },
  );
  const targetDir = path.join(dir, "public", "__studio_preview");
  await fs.mkdir(targetDir, { recursive: true });
  for (let i = 0; i < groups.length; i++) {
    const nav = `<nav aria-label="预览分页">${i > 0 ? `<a href="${pagePath(i - 1)}">← 上一段</a>` : ""}<span>第 ${i + 1} / ${groups.length} 段 · 仅预览分段，发布为完整文章</span>${i + 1 < groups.length ? `<a href="${pagePath(i + 1)}">下一段 →</a>` : ""}</nav>`;
    await fs.writeFile(
      path.join(targetDir, `page-${i + 1}.html`),
      `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)} · 分段预览</title>${styles}<style>body{margin:0;padding:16px;background:var(--background);color:var(--text)}main{max-width:1100px;margin:auto;min-width:0}nav{display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between;padding:16px 0;font-size:14px}article{overflow-wrap:anywhere}pre{overflow:auto}img{max-width:100%}</style></head><body><main>${nav}<article class="md-text">${groups[i].map((el) => DomUtils.getOuterHTML(el)).join("")}</article>${nav}</main></body></html>`,
    );
  }
  return {
    ...metrics,
    pages: groups.length,
    autoLoad,
    path: "__studio_preview/page-1.html",
  };
}
