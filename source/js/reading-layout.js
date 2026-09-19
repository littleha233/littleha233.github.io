(() => {
  const layout = document.querySelector('.l_body.content');
  const main = layout?.querySelector('.l_main');
  const left = layout?.querySelector('.l_left');
  const right = layout?.querySelector('.l_right');
  if (!main || !left || !right || main.querySelector('.reading-controls')) return;

  const key = 'blog-reading-layout-v1';
  let preferences = {};
  try {
    preferences = JSON.parse(localStorage.getItem(key)) || {};
  } catch (_) {
    // Storage can be unavailable in private or embedded browsers.
  }
  const state = {
    left: preferences.left === true,
    right: preferences.right === true,
  };
  const hasRight = Boolean(right.querySelector('.widget-wrapper'));
  layout.classList.add('reading-layout');
  layout.classList.toggle('reading-no-right', !hasRight);

  const controls = document.createElement('nav');
  controls.className = 'reading-controls';
  controls.setAttribute('aria-label', '阅读布局');
  const hint = document.createElement('span');
  hint.textContent = '阅读布局';
  controls.append(hint);

  for (const [side, panel, name] of [['left', left, '导航'], ['right', right, '目录']]) {
    if (side === 'right' && !hasRight) continue;
    if (!panel.id) panel.id = `reading-${side}-panel`;
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-controls', panel.id);
    const update = () => {
      layout.classList.toggle(`reading-hide-${side}`, state[side]);
      button.setAttribute('aria-expanded', String(!state[side]));
      button.textContent = `${state[side] ? '显示' : '隐藏'}${name}`;
    };
    button.addEventListener('click', () => {
      state[side] = !state[side];
      update();
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch (_) {
        // Toggling still works without persistent storage.
      }
    });
    update();
    controls.append(button);
  }
  main.prepend(controls);
})();
