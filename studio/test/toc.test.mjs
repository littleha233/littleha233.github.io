import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Hexo from "hexo";
import yaml from "js-yaml";
import { parseDocument, DomUtils } from "htmlparser2";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
test("TOC keeps Markdown H1–H6 order, nesting and anchors, excluding code examples", async () => {
  const { toc: options } = yaml.load(
    await fs.readFile(path.join(root, "source/_data/widgets.yml"), "utf8"),
  );
  assert.equal(options.min_depth, 1);
  assert.equal(options.max_depth, 6);
  assert.equal(options.list_number, false);
  assert.equal(options.collapse, false);
  const hexo = new Hexo(root, { silent: true });
  await hexo.init();
  try {
    const markdown = [
      "## 一、Shor 算法究竟解决什么问题",
      "",
      "# 二、模运算",
      "",
      "## 2.1 为什么模运算如此重要",
      "",
      "### 三级标题",
      "#### 四级标题",
      "##### 五级标题",
      "###### 六级标题",
      "",
      "# 三、最大公约数与互质",
      "",
      "## 重复标题",
      "## 重复标题",
      "",
      "## 公式 $\\varphi(n)$",
      "",
      "```markdown",
      "# 代码中的假标题",
      "```",
      "",
      "    ## 缩进代码中的假标题",
    ].join("\n");
    const html = hexo.render.renderSync({ text: markdown, engine: "md" });
    const headings = DomUtils.findAll(
      (el) => /^h[1-6]$/.test(el.name || ""),
      parseDocument(html).children,
    );
    const toc = hexo.extend.helper.get("toc").call(hexo, html, options);
    const tree = parseDocument(toc);
    const links = DomUtils.findAll((el) => el.name === "a", tree.children);
    assert.equal(links.length, 11);
    assert.deepEqual(
      links.map((a) => decodeURI(a.attribs.href.slice(1))),
      headings.map((h) => h.attribs.id),
    );
    assert.deepEqual(
      links.map((a) =>
        Number(a.parent.attribs.class.match(/toc-level-(\d)/)[1]),
      ),
      headings.map((h) => Number(h.name.slice(1))),
    );
    assert.equal(links[2].parent.parent.attribs.class, "toc-child");
    assert.notEqual(links[8].attribs.href, links[9].attribs.href);
    assert.ok(!toc.includes("假标题"));
    assert.ok(!toc.includes("toc-number"));
    assert.equal(
      DomUtils.textContent(links[0]),
      "一、Shor 算法究竟解决什么问题",
    );
    assert.equal(DomUtils.textContent(links[1]), "二、模运算");
    assert.equal(DomUtils.textContent(links[10]), "公式 φ(n)");
  } finally {
    await hexo.exit();
  }
});
