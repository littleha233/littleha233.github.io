import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const script = fs.readFileSync(new URL('../../source/js/reading-layout.js', import.meta.url), 'utf8');

function setup({ saved = null, storageBlocked = false, hasRight = true, content = true } = {}) {
  const element = () => ({
    children: [], attributes: {}, classes: new Set(),
    append(child) { this.children.push(child); },
    prepend(child) { this.children.unshift(child); },
    setAttribute(key, value) { this.attributes[key] = value; },
    addEventListener(type, callback) { this[type] = callback; },
    querySelector() { return null; },
  });
  const main = element(), left = element(), right = element(), layout = element();
  main.querySelector = () => main.children.find(child => child.className === 'reading-controls');
  right.querySelector = () => hasRight ? element() : null;
  layout.querySelector = selector => ({ '.l_main': main, '.l_left': left, '.l_right': right })[selector];
  layout.classList = {
    add(value) { layout.classes.add(value); },
    toggle(value, enabled) { enabled ? layout.classes.add(value) : layout.classes.delete(value); },
  };
  let stored = saved;
  const context = vm.createContext({
    document: { querySelector: () => content ? layout : null, createElement: element },
    localStorage: {
      getItem() { if (storageBlocked) throw new Error('denied'); return stored; },
      setItem(key, value) { if (storageBlocked) throw new Error('denied'); stored = value; },
    },
  });
  vm.runInContext(script, context);
  return { main, layout, context, stored: () => stored };
}

test('reading controls independently hide and restore both columns and persist preferences', () => {
  const page = setup();
  const [, left, right] = page.main.children[0].children;
  assert.equal(left.attributes['aria-expanded'], 'true');
  assert.equal(left.attributes['aria-controls'], 'reading-left-panel');
  left.click();
  assert.ok(page.layout.classes.has('reading-hide-left'));
  assert.ok(!page.layout.classes.has('reading-hide-right'));
  assert.equal(left.textContent, '显示导航');
  right.click();
  assert.equal(right.attributes['aria-expanded'], 'false');
  const restored = setup({ saved: page.stored() });
  assert.ok(restored.layout.classes.has('reading-hide-left'));
  assert.ok(restored.layout.classes.has('reading-hide-right'));
  left.click();
  assert.ok(!page.layout.classes.has('reading-hide-left'));
  assert.equal(left.textContent, '隐藏导航');
  vm.runInContext(script, page.context);
  assert.equal(page.main.children.length, 1);
});

test('reading controls tolerate invalid or blocked storage and absent right sidebar', () => {
  for (const options of [{ saved: '{bad' }, { storageBlocked: true }]) {
    const page = setup(options);
    page.main.children[0].children[1].click();
    assert.ok(page.layout.classes.has('reading-hide-left'));
  }
  const page = setup({ hasRight: false });
  assert.ok(page.layout.classes.has('reading-no-right'));
  assert.equal(page.main.children[0].children.length, 2);
  assert.equal(setup({ content: false }).main.children.length, 0);
});
