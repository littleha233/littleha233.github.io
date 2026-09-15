const $ = (id) => document.getElementById(id);
const state = {
  csrf: "",
  current: null,
  drafts: [],
  posts: [],
  tab: "drafts",
  revision: 0,
  savedRevision: 0,
  saving: null,
  prepared: null,
  suggestion: null,
  jobs: [],
  busy: false,
};
const fields = [
  "title",
  "slug",
  "date",
  "categories",
  "tags",
  "description",
  "body",
];
const split = (x) => [
  ...new Set(
    x
      .split(/[,，;；\n]/)
      .map((s) => s.trim())
      .filter(Boolean),
  ),
];
function message(text, error = false) {
  $("message").hidden = false;
  $("message").textContent = text;
  $("message").className = error ? "error" : "";
}
async function api(route, data) {
  const r = await fetch("/api/" + route, {
    method: data === undefined ? "GET" : "POST",
    headers: {
      "X-Studio-Key": state.csrf,
      ...(data === undefined ? {} : { "Content-Type": "application/json" }),
    },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
  const value = await r.json();
  if (!r.ok) throw new Error(value.error || "请求失败");
  return value;
}
function element(tag, text, className) {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (className) el.className = className;
  return el;
}
function bind(id, fn) {
  $(id).addEventListener("click", () => run(fn));
}
async function run(fn) {
  if (state.busy) return;
  state.busy = true;
  document.body.setAttribute("aria-busy", "true");
  const locked = fields.filter((f) => !$(f).readOnly);
  for (const f of locked) $(f).readOnly = true;
  try {
    await fn();
  } catch (e) {
    message(e.message, true);
  } finally {
    for (const f of locked) $(f).readOnly = false;
    $("slug").readOnly = !!state.current?.publication;
    state.busy = false;
    document.body.removeAttribute("aria-busy");
  }
}
function read() {
  return {
    ...state.current,
    ...Object.fromEntries(
      fields.map((f) => [
        f,
        ["categories", "tags"].includes(f) ? split($(f).value) : $(f).value,
      ]),
    ),
  };
}
function counters() {
  $("slugHint").textContent = $("slug").value;
  $("wordCount").textContent =
    $("body").value.replace(/\s/g, "").length.toLocaleString() + " 字";
}
function invalidate() {
  state.prepared = null;
  $("release").hidden = true;
  $("confirm").checked = false;
  $("publish").disabled = true;
}
let timer;
function changed() {
  if (!state.current) return;
  state.revision++;
  invalidate();
  counters();
  $("saveState").textContent = "待保存";
  localStorage.setItem("studio-recovery", JSON.stringify(read()));
  clearTimeout(timer);
  timer = setTimeout(
    () =>
      save().catch((e) => {
        $("saveState").textContent = "保存失败 · 请手动保存";
        message(e.message, true);
      }),
    1400,
  );
}
async function save() {
  clearTimeout(timer);
  if (state.saving) await state.saving;
  if (!state.current || state.revision === state.savedRevision)
    return state.current;
  const revision = state.revision,
    doc = read();
  state.saving = api("save", doc);
  $("saveState").textContent = "保存中…";
  try {
    const result = await state.saving;
    state.current = result;
    state.savedRevision = revision;
    state.drafts = state.drafts.filter((x) => x.id !== result.id);
    state.drafts.unshift(result);
    renderLibrary();
    if (state.revision === revision) {
      localStorage.removeItem("studio-recovery");
      $("saveState").textContent = "已自动保存";
    }
    return result;
  } finally {
    state.saving = null;
  }
}
function renderLibrary() {
  const container = $("library");
  container.replaceChildren();
  $("draftCount").textContent = state.drafts.length;
  $("postCount").textContent = state.posts.length;
  const q = $("search").value.toLowerCase();
  const items = state[state.tab].filter((p) =>
    (p.title + " " + p.categories.join(" ") + " " + p.tags.join(" "))
      .toLowerCase()
      .includes(q),
  );
  if (!items.length)
    container.append(
      element("p", q ? "没有匹配的文章" : "还没有草稿，开始写作吧。", "hint"),
    );
  for (const p of items) {
    const button = element(
      "button",
      undefined,
      "article-item" + (state.current?.id === p.id && p.id ? " active" : ""),
    );
    button.append(
      element("strong", p.title),
      element(
        "small",
        (p.date || "").slice(0, 10) +
          " · " +
          (p.publication
            ? "已提交"
            : state.tab === "posts"
              ? "已发布"
              : "草稿") +
          " · " +
          (p.categories[0] || "未分类"),
      ),
    );
    button.onclick = () =>
      run(async () => {
        await save();
        if (state.tab === "posts") {
          const text =
            "---\ntitle: " +
            JSON.stringify(p.title + "（新稿）") +
            "\ncategories: " +
            JSON.stringify(p.categories) +
            "\ntags: " +
            JSON.stringify(p.tags) +
            "\n---\n" +
            p.body;
          open(
            await api("import", { raw: text, filename: p.slug + "-new.md" }),
          );
          message(
            "已复制为新草稿，原文未修改。若是本工具发布的文章，请从“草稿”打开原稿进行更新。",
          );
          await refresh();
        } else open(state.drafts.find((x) => x.id === p.id) || p);
      });
    container.append(button);
  }
}
async function refresh() {
  const library = await api("library");
  state.drafts = library.drafts;
  state.posts = library.posts;
  state.jobs = library.jobs;
  renderLibrary();
  renderJobs();
  for (const [id, values] of [
    ["categoryOptions", state.posts.flatMap((p) => p.categories)],
    ["tagOptions", state.posts.flatMap((p) => p.tags)],
  ]) {
    $(id).replaceChildren(
      ...[...new Set(values)].map((x) => {
        const o = element("option");
        o.value = x;
        return o;
      }),
    );
  }
}
function open(doc) {
  clearTimeout(timer);
  state.current = doc;
  state.revision = state.savedRevision = 0;
  state.suggestion = null;
  invalidate();
  $("suggestions").hidden = true;
  $("welcome").hidden = true;
  $("workspace").hidden = false;
  $("saveState").textContent = "已保存到本机";
  $("articleState").textContent = doc.publication
    ? "已发布 · 可编辑更新"
    : "本地草稿";
  for (const f of fields)
    $(f).value = Array.isArray(doc[f]) ? doc[f].join(", ") : doc[f];
  $("slug").readOnly = !!doc.publication;
  $("undoFormat").hidden = true;
  showMode(false);
  counters();
  renderAssets();
  renderLibrary();
}
function renderAssets() {
  $("assetList").replaceChildren();
  for (const asset of state.current.assets) {
    const li = element(
      "li",
      asset.name + " · " + Math.ceil(asset.size / 1024) + " KB",
    );
    const insert = element("button", "插入正文");
    insert.onclick = () => {
      const syntax =
        (asset.name.toLowerCase().endsWith(".pdf") ? "" : "!") +
        "[" +
        asset.name +
        "](" +
        asset.url +
        ")";
      $("body").value += "\n\n" + syntax + "\n";
      changed();
    };
    li.append(insert);
    $("assetList").append(li);
  }
}
function showMode(preview) {
  $("body").hidden = preview;
  $("previewPanel").hidden = !preview;
  $("editMode").classList.toggle("selected", !preview);
  $("previewMode").classList.toggle("selected", preview);
}
async function prepare() {
  await save();
  message("正在隔离构建并检查文章、附件与内部链接…");
  const p = await api("prepare", { id: state.current.id, sync: true });
  state.prepared = p;
  $("preview").src = p.url;
  $("previewLink").href = p.url;
  showMode(true);
  $("release").hidden = false;
  $("fileList").replaceChildren(
    ...p.files.map((f) =>
      element("li", f.path + " · " + Math.ceil(f.size / 1024) + " KB"),
    ),
  );
  $("warnings").textContent = p.warnings.length
    ? "请注意：" + p.warnings.join("；")
    : "内容检查通过。敏感信息仍需你人工复核。";
  $("releaseMarkdown").textContent = p.after;
  message(
    "检查通过：" + p.summary + "。请查看主题预览，下方确认后才能公开发布。",
  );
}
async function newArticle() {
  await save();
  open(
    await api("import", {
      raw: "# 未命名文章\n\n从这里开始记录。\n",
      filename: "note-" + Date.now().toString(36) + ".md",
    }),
  );
  await refresh();
  $("title").focus();
  $("title").select();
}
bind("new", newArticle);
bind("start", newArticle);
$("import").onchange = () =>
  run(async () => {
    const file = $("import").files[0];
    if (!file) return;
    await save();
    open(await api("import", { raw: await file.text(), filename: file.name }));
    await refresh();
    message("Markdown 已导入。已有分类和标签已保留，可手动调整或提取建议。");
    $("import").value = "";
  });
for (const f of fields) $(f).addEventListener("input", changed);
bind("save", async () => {
  await save();
  message("草稿已保存到本机。");
});
bind("draftTab", () => {
  state.tab = "drafts";
  $("draftTab").classList.add("selected");
  $("postTab").classList.remove("selected");
  renderLibrary();
});
bind("postTab", () => {
  state.tab = "posts";
  $("postTab").classList.add("selected");
  $("draftTab").classList.remove("selected");
  renderLibrary();
});
$("search").oninput = renderLibrary;
bind("suggest", async () => {
  state.suggestion = await api("suggest", read());
  $("suggestions").hidden = false;
  $("suggestMethod").textContent = state.suggestion.method;
  $("suggestText").textContent =
    "分类：" +
    state.suggestion.categories.join(" / ") +
    "；标签：" +
    (state.suggestion.tags.join("、") || "未找到明显关键词，可手动填写") +
    "。摘要：" +
    state.suggestion.description;
});
bind("applySuggest", () => {
  for (const f of ["categories", "tags"])
    $(f).value = [
      ...new Set([...split($(f).value), ...state.suggestion[f]]),
    ].join(", ");
  if (!$("description").value.trim())
    $("description").value = state.suggestion.description;
  changed();
  $("suggestions").hidden = true;
});
bind("dismissSuggest", () => {
  $("suggestions").hidden = true;
});
let unformatted = "";
bind("format", async () => {
  unformatted = $("body").value;
  $("body").value = (await api("format", { body: unformatted })).body;
  changed();
  $("undoFormat").hidden = false;
  message("已整理换行和行尾空格；未润色正文。可以撤销。");
});
bind("undoFormat", () => {
  $("body").value = unformatted;
  changed();
  $("undoFormat").hidden = true;
});
bind("export", async () => {
  await save();
  const { markdown } = await api("export", { id: state.current.id });
  const url = URL.createObjectURL(
    new Blob([markdown], { type: "text/markdown;charset=utf-8" }),
  );
  const a = element("a");
  a.href = url;
  a.download = state.current.slug + ".md";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
$("attachments").onchange = () =>
  run(async () => {
    const files = [...$("attachments").files];
    if (!files.length) return;
    await save();
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024)
        throw new Error(file.name + " 超过 10 MB");
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const next = await api("attach", {
        id: state.current.id,
        name: file.name,
        data,
      });
      open(next);
    }
    await refresh();
    $("attachments").value = "";
    message(
      "附件已保存，相匹配的 Markdown 相对引用已替换。可点击“插入正文”添加引用。",
    );
  });
bind("prepare", prepare);
bind("editMode", () => showMode(false));
bind("previewMode", async () => {
  if (state.prepared) showMode(true);
  else await prepare();
});
$("confirm").onchange = () => {
  $("publish").disabled = !$("confirm").checked || !state.prepared;
};
bind("publish", async () => {
  await save();
  if (!state.prepared) throw new Error("请重新检查并预览");
  const auth = await api("auth");
  if (!auth.ready) {
    $("authState").textContent = auth.message;
    $("help").showModal();
    return;
  }
  const job = await api("publish", {
    key: state.prepared.key,
    confirmed: $("confirm").checked,
  });
  state.jobs.unshift(job);
  invalidate();
  renderJobs();
  message(
    "发布任务已启动。页面下方可以查看部署结果；关闭页面不会撤销已提交的文章。",
  );
});
function renderJobs() {
  $("jobPanel").hidden = !state.jobs.length;
  $("jobList").replaceChildren();
  for (const job of [...state.jobs]
    .sort((a, b) => b.created.localeCompare(a.created))
    .slice(0, 10)) {
    const row = element("div", undefined, "job-row");
    row.append(element("strong", job.title), element("span", job.message));
    if (job.state === "published") {
      const a = element("a", "查看文章 ↗");
      a.href = job.url;
      a.target = "_blank";
      a.rel = "noreferrer";
      row.append(a);
    }
    if (job.actionsUrl) {
      const a = element("a", "部署日志 ↗");
      a.href = job.actionsUrl;
      a.target = "_blank";
      a.rel = "noreferrer";
      row.append(a);
    }
    if (job.sha) {
      const a = element("a", "提交记录 ↗");
      a.href =
        "https://github.com/littleha233/littleha233.github.io/commit/" +
        job.sha;
      a.target = "_blank";
      a.rel = "noreferrer";
      row.append(a);
    }
    if (
      ["deploying", "uncertain", "deploy-failed", "interrupted"].includes(
        job.state,
      )
    ) {
      const button = element("button", "刷新状态");
      button.onclick = () =>
        run(async () => {
          const updated = await api("job?id=" + job.id);
          state.jobs = state.jobs.map((j) => (j.id === job.id ? updated : j));
          renderJobs();
        });
      row.append(button);
    }
    if (job.state === "failed")
      row.append(element("span", "草稿仍在。修复问题后重新预览并发布。"));
    $("jobList").append(row);
  }
}
bind("sync", async () => {
  await save();
  message("正在同步远端内容…");
  await api("sync", {});
  await refresh();
  message("远端文章列表已同步，本地未提交的代码未改动。");
});
bind("settings", async () => {
  $("help").showModal();
  $("authState").textContent = (await api("auth")).message;
});
bind("closeHelp", () => $("help").close());
bind("checkAuth", async () => {
  $("authState").textContent = (await api("auth")).message;
});
window.addEventListener("beforeunload", (event) => {
  if (state.revision !== state.savedRevision) {
    event.preventDefault();
    event.returnValue = "";
  }
});
async function boot() {
  const r = await fetch("/api/bootstrap");
  const boot = await r.json();
  state.csrf = boot.csrf;
  await refresh();
  const raw = localStorage.getItem("studio-recovery");
  if (raw) {
    try {
      const backup = JSON.parse(raw);
      const existing = state.drafts.find((x) => x.id === backup.id);
      if (existing) {
        open({
          ...backup,
          version: existing.version,
          assets: existing.assets,
          publication: existing.publication,
        });
        state.revision = 1;
        $("saveState").textContent = "已恢复未保存内容";
        message("发现上次未保存的编辑，已恢复。请检查并保存。");
      }
    } catch {
      message("上次恢复数据无法读取，服务器草稿仍保留。", true);
    }
  }
  setInterval(async () => {
    for (const job of state.jobs.filter((x) =>
      ["publishing", "deploying", "uncertain"].includes(x.state),
    )) {
      try {
        const updated = await api("job?id=" + job.id);
        state.jobs = state.jobs.map((x) => (x.id === job.id ? updated : x));
      } catch {}
    }
    renderJobs();
  }, 10000);
}
boot().catch((e) => message(e.message, true));
