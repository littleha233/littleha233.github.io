import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

test("preview lifecycle releases hidden frames, handles timeout, and invalidates stale publication", async () => {
  const elements = new Map(),
    timers = new Map();
  let nextTimer = 0;
  const element = () => ({
    value: "",
    textContent: "",
    children: [],
    events: {},
    classList: { toggle() {}, add() {}, remove() {} },
    addEventListener(name, fn) {
      this.events[name] = fn;
    },
    removeAttribute(name) {
      delete this[name];
    },
    setAttribute(name, value) {
      this[name] = value;
    },
    replaceChildren(...children) {
      this.children = children;
    },
    append(...children) {
      this.children.push(...children);
    },
  });
  const get = (id) => {
    if (!elements.has(id)) elements.set(id, element());
    return elements.get(id);
  };
  const context = vm.createContext({
    document: { getElementById: get, createElement: element, body: element() },
    window: { addEventListener() {} },
    localStorage: {
      getItem() {
        return null;
      },
      setItem() {
        throw new Error("quota");
      },
      removeItem() {},
    },
    setTimeout(fn) {
      timers.set(++nextTimer, fn);
      return nextTimer;
    },
    clearTimeout(id) {
      timers.delete(id);
    },
    setInterval() {},
    fetch: async (url) => ({
      ok: true,
      json: async () =>
        url.includes("bootstrap")
          ? { csrf: "test" }
          : url.includes("library")
            ? { drafts: [], posts: [], jobs: [] }
            : { ok: true },
    }),
  });
  vm.runInContext(
    fs.readFileSync(new URL("../web/app.js", import.meta.url), "utf8"),
    context,
  );
  await new Promise((resolve) => setImmediate(resolve));
  vm.runInContext(
    'state.prepared={key:"test",url:"http://localhost/preview",display:{pages:12}}; loadPreview()',
    context,
  );
  assert.equal(get("preview").src, "http://localhost/preview");
  get("preview").events.load();
  assert.equal(timers.size, 0);
  assert.match(get("previewStatus").textContent, /12/);
  vm.runInContext("showMode(false)", context);
  assert.equal(get("preview").src, undefined);
  vm.runInContext("loadPreview()", context);
  [...timers.values()][0]();
  assert.equal(get("preview").src, undefined);
  assert.match(get("previewStatus").textContent, /超时/);
  vm.runInContext("loadPreview(); invalidate()", context);
  assert.equal(get("preview").src, undefined);
  assert.equal(get("publish").disabled, true);
  assert.equal(vm.runInContext("state.prepared", context), null);
  vm.runInContext('state.current={id:"draft"}; changed()', context);
  assert.equal(
    timers.size,
    1,
    "storage quota must not prevent scheduled disk save",
  );
});
