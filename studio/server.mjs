import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { DraftStore } from "./store.mjs";
import { Publisher, authentication, REPO, SITE } from "./publisher.mjs";
import { importContent, conversationChoices } from "./content.mjs";
import { suggest, formatMarkdown, serialize, dateNow } from "./core.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".pdf": "application/pdf",
  ".xml": "application/xml",
};
export function allowed(req, port) {
  return (
    ["127.0.0.1:" + port, "localhost:" + port].includes(req.headers.host) &&
    (!req.headers.origin ||
      ["http://127.0.0.1:" + port, "http://localhost:" + port].includes(
        req.headers.origin,
      )) &&
    (!req.headers["sec-fetch-site"] ||
      ["same-origin", "none"].includes(req.headers["sec-fetch-site"]))
  );
}
async function jsonBody(req) {
  if (!String(req.headers["content-type"]).startsWith("application/json"))
    throw new Error("只接受 JSON 请求");
  let bytes = 0,
    chunks = [];
  for await (const part of req) {
    bytes += part.length;
    if (bytes > 16 * 1024 * 1024) throw new Error("请求过大");
    chunks.push(part);
  }
  return JSON.parse(Buffer.concat(chunks).toString());
}
function json(res, value, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(value));
}
async function serve(res, base, pathname) {
  let file = path.resolve(base, "." + decodeURIComponent(pathname));
  if (file !== base && !file.startsWith(base + path.sep))
    throw new Error("非法路径");
  if ((await fs.stat(file)).isDirectory()) file = path.join(file, "index.html");
  const real = await fs.realpath(file);
  if (!real.startsWith((await fs.realpath(base)) + path.sep))
    throw new Error("非法链接");
  res.writeHead(200, {
    "Content-Type": MIME[path.extname(file)] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  res.end(await fs.readFile(file));
}
export async function start({
  root = ROOT,
  port = 4313,
  previewPort = 4314,
  dataRoot = path.join(root, ".blog-studio"),
} = {}) {
  const store = new DraftStore(dataRoot);
  await store.init();
  const publisher = new Publisher(root, store);
  publisher.previewOrigin = `http://127.0.0.1:${previewPort}`;
  await publisher.init();
  const csrf = randomBytes(32).toString("hex");
  let mutation = Promise.resolve();
  const server = http.createServer(async (req, res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader(
      "Content-Security-Policy",
      `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-src http://127.0.0.1:${previewPort}; object-src 'none'; base-uri 'none'; frame-ancestors 'none'`,
    );
    if (!allowed(req, port)) {
      json(res, { error: "仅允许本机同源访问" }, 403);
      return;
    }
    try {
      const url = new URL(req.url, "http://localhost");
      if (url.pathname === "/api/bootstrap" && req.method === "GET") {
        json(res, { csrf, repo: REPO, site: SITE, date: dateNow() });
        return;
      }
      if (url.pathname.startsWith("/api/")) {
        if (req.headers["x-studio-key"] !== csrf) {
          json(res, { error: "会话已失效，请刷新页面" }, 403);
          return;
        }
        const route = async () => {
          if (req.method === "GET" && url.pathname === "/api/library")
            return {
              drafts: await store.all(),
              posts: await publisher.library(),
              jobs: [...publisher.jobs.values()],
            };
          if (req.method === "GET" && url.pathname === "/api/auth")
            return authentication();
          if (req.method === "GET" && url.pathname === "/api/job")
            return publisher.status(url.searchParams.get("id"));
          if (req.method !== "POST") throw new Error("接口不存在");
          const body = await jsonBody(req);
          switch (url.pathname) {
            case "/api/edit-post":
              return publisher.editPost(body.path, body.contentHash);
            case "/api/prepare-delete":
              return publisher.prepareDelete(body.path, body.contentHash);
            case "/api/delete-post":
              return publisher.deletePost(body.key, body.slug, body.confirmed);
            case "/api/import": {
              const imported = importContent(body);
              return {
                ...(await store.create(imported.doc)),
                importNotes: imported.notes,
              };
            }
            case "/api/import-choices":
              return { choices: conversationChoices(body.raw) };
            case "/api/save":
              return store.save(body.id, body);
            case "/api/attach":
              return store.attach(body.id, body);
            case "/api/suggest": {
              const posts = await publisher.library();
              return suggest(body, {
                categories: [...new Set(posts.flatMap((x) => x.categories))],
                tags: [...new Set(posts.flatMap((x) => x.tags))],
              });
            }
            case "/api/format":
              return { body: formatMarkdown(String(body.body)) };
            case "/api/export":
              return { markdown: serialize(await store.get(body.id)) };
            case "/api/sync":
              return { sha: await publisher.sync() };
            case "/api/prepare": {
              const result = await publisher.prepare(body.id, {
                sync: !!body.sync,
              });
              return {
                ...result,
                url: `http://127.0.0.1:${previewPort}/p/${result.key}/posts/${result.slug}/`,
              };
            }
            case "/api/publish":
              return publisher.publish(body.key, body.confirmed === true);
            default:
              throw new Error("接口不存在");
          }
        };
        // Serialize mutations to make draft revisions and uploads race-safe.
        const work = req.method === "POST" ? mutation.then(route) : route();
        if (req.method === "POST") mutation = work.catch(() => {});
        json(res, await work);
        return;
      }
      if (req.method !== "GET") throw new Error("不支持此请求");
      await serve(
        res,
        path.join(ROOT, "studio", "web"),
        url.pathname === "/" ? "/index.html" : url.pathname,
      );
    } catch (error) {
      json(
        res,
        { error: error.code === "ENOENT" ? "文件不存在" : error.message },
        400,
      );
    }
  });
  const preview = http.createServer(async (req, res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader(
      "Content-Security-Policy",
      `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors http://127.0.0.1:${port} http://localhost:${port}`,
    );
    if (
      !["127.0.0.1:" + previewPort, "localhost:" + previewPort].includes(
        req.headers.host,
      ) ||
      req.method !== "GET"
    ) {
      res.writeHead(403);
      res.end();
      return;
    }
    try {
      const url = new URL(req.url, "http://localhost");
      const match = url.pathname.match(/^\/p\/([a-f0-9-]{36})(\/.*)$/);
      const p = match && publisher.previews.get(match[1]);
      if (!p) throw new Error("请先生成预览");
      await serve(res, path.join(p.dir, "public"), match[2]);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("预览不存在或已过期，请回到编辑器重新生成");
    }
  });
  const listen = (s, p) =>
    new Promise((resolve, reject) => {
      s.once("error", reject);
      s.listen(p, "127.0.0.1", resolve);
    });
  await listen(server, port);
  try {
    await listen(preview, previewPort);
  } catch (e) {
    server.close();
    throw e;
  }
  return {
    server,
    preview,
    store,
    publisher,
    close: () =>
      Promise.all([
        new Promise((r) => server.close(r)),
        new Promise((r) => preview.close(r)),
      ]),
  };
}
if (process.argv[1] === fileURLToPath(import.meta.url))
  start()
    .then(() =>
      console.log(
        "博客工作台：http://127.0.0.1:4313\n仅本机可访问；Ctrl+C 停止。",
      ),
    )
    .catch((e) => {
      console.error("无法启动：" + e.message);
      process.exitCode = 1;
    });
