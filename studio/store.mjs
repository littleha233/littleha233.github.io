import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { validate, assetName, hash, rewriteAsset } from "./core.mjs";

export class DraftStore {
  constructor(root) {
    this.root = root;
  }
  folder(id) {
    if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error("无效草稿编号");
    return path.join(this.root, "drafts", id);
  }
  async init() {
    await fs.mkdir(path.join(this.root, "drafts"), {
      recursive: true,
      mode: 0o700,
    });
  }
  async get(id) {
    return {
      contentType: "article",
      source: "",
      ...JSON.parse(
        await fs.readFile(path.join(this.folder(id), "draft.json"), "utf8"),
      ),
    };
  }
  async all() {
    await this.init();
    const out = [];
    for (const id of await fs.readdir(path.join(this.root, "drafts"))) {
      try {
        out.push(await this.get(id));
      } catch {}
    }
    return out.sort((a, b) => b.updated.localeCompare(a.updated));
  }
  async write(doc) {
    const folder = this.folder(doc.id);
    await fs.mkdir(folder, { recursive: true, mode: 0o700 });
    const tmp = path.join(folder, randomUUID() + ".tmp");
    await fs.writeFile(tmp, JSON.stringify(doc, null, 2), { mode: 0o600 });
    await fs.rename(tmp, path.join(folder, "draft.json"));
    return doc;
  }
  async create(input) {
    const doc = validate(input);
    return this.write({
      title: doc.title,
      slug: doc.slug,
      date: doc.date,
      description: doc.description,
      categories: doc.categories,
      tags: doc.tags,
      body: doc.body,
      contentType: doc.contentType,
      source: doc.source,
      id: randomUUID(),
      version: 1,
      updated: new Date().toISOString(),
      assets: [],
      publication: null,
    });
  }
  async save(id, input) {
    const old = await this.get(id);
    if (input.version !== old.version)
      throw new Error("草稿已被另一窗口修改，请重新打开后再保存");
    const doc = validate(input);
    if (old.publication && doc.slug !== old.slug)
      throw new Error("已发布文章不能更改地址，请另建草稿");
    return this.write({
      ...old,
      ...Object.fromEntries(
        [
          "title",
          "slug",
          "date",
          "description",
          "categories",
          "tags",
          "body",
          "contentType",
          "source",
        ].map((k) => [k, doc[k]]),
      ),
      version: old.version + 1,
      updated: new Date().toISOString(),
    });
  }
  async attach(id, { name, data, originalPath }) {
    const doc = await this.get(id);
    name = assetName(name);
    if (
      typeof data !== "string" ||
      data.length > 15 * 1024 * 1024 ||
      !/^[A-Za-z0-9+/]*={0,2}$/.test(data)
    )
      throw new Error("附件编码无效或超过 10 MB");
    const bytes = Buffer.from(data, "base64");
    if (!bytes.length || bytes.length > 10 * 1024 * 1024)
      throw new Error("附件不能为空且最大 10 MB");
    if (doc.assets.length >= 30) throw new Error("每篇文章最多 30 个附件");
    const key = hash(bytes).slice(0, 16) + "-" + name;
    const url = "/files/studio/" + doc.id + "/" + encodeURIComponent(key);
    await fs.mkdir(path.join(this.folder(id), "assets"), { recursive: true });
    await fs.writeFile(path.join(this.folder(id), "assets", key), bytes);
    if (!doc.assets.some((x) => x.key === key))
      doc.assets.push({ name, key, url, size: bytes.length });
    doc.body = rewriteAsset(doc.body, String(originalPath || name), url);
    doc.version++;
    doc.updated = new Date().toISOString();
    return this.write(doc);
  }
  async snapshot(id) {
    const doc = await this.get(id);
    await fs.mkdir(path.join(this.folder(id), "history"), { recursive: true });
    await fs.writeFile(
      path.join(this.folder(id), "history", `${Date.now()}.json`),
      JSON.stringify(doc),
      { mode: 0o600 },
    );
  }
  async published(id, publication) {
    const doc = await this.get(id);
    doc.publication = publication;
    return this.write(doc);
  }
}
