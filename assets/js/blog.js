(() => {
  const toggle = document.querySelector('.theme-toggle');
  const dark = () => document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  const label = () => toggle?.setAttribute('aria-label', dark() ? '切换浅色模式' : '切换深色模式');
  label();
  toggle?.addEventListener('click', () => {
    const theme = dark() ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('blog-theme', theme); } catch {}
    label();
  });
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.closest('input,textarea,[contenteditable="true"]')) {
      event.preventDefault();
      const input = document.querySelector('#search-input');
      if (input) input.focus(); else location.href = document.querySelector('.search-link').href;
    }
  });
  document.querySelectorAll('.prose pre').forEach(pre => {
    const code = pre.querySelector('code');
    if (!code) return;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'copy-code'; button.textContent = '复制代码';
    button.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(code.textContent); button.textContent = '已复制'; }
      catch { button.textContent = '请选择代码手动复制'; }
      setTimeout(() => { button.textContent = '复制代码'; }, 2200);
    });
    pre.append(button);
  });
  const search = document.querySelector('.search-page');
  if (!search) return;
  const input = document.querySelector('#search-input');
  const status = document.querySelector('#search-status');
  const results = document.querySelector('#search-results');
  let entries, loading;
  async function render() {
    const query = input.value.trim().toLocaleLowerCase();
    history.replaceState(null, '', query ? `?q=${encodeURIComponent(input.value.trim())}` : location.pathname);
    results.replaceChildren();
    if (!query) { status.textContent = '输入关键词开始搜索。'; return; }
    status.textContent = '正在查找…';
    try {
      loading ??= fetch(search.dataset.index).then(response => { if (!response.ok) throw new Error('index'); return response.json(); });
      entries ??= await loading;
      if (input.value.trim().toLocaleLowerCase() !== query) return;
      const words = query.split(/\s+/);
      const matches = entries.filter(entry => words.every(word => [entry.title, entry.description, entry.content, ...(entry.tags || []), ...(entry.categories || [])].join(' ').toLocaleLowerCase().includes(word)));
      status.textContent = matches.length ? `找到 ${matches.length} 篇笔记` : '没有找到相关笔记。试试更短的关键词，或浏览全部文章。';
      for (const entry of matches) {
        const card = document.createElement('article'); card.className = 'post-card';
        const meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = `${entry.date} · ${(entry.categories || []).join(' / ')}`;
        const heading = document.createElement('h2'); const link = document.createElement('a'); link.href = entry.url; link.textContent = entry.title; heading.append(link);
        const description = document.createElement('p'); description.textContent = entry.description;
        card.append(meta, heading, description); results.append(card);
      }
    } catch { loading = undefined; status.textContent = '搜索索引暂时无法加载。请重试，或通过「全部文章」浏览。'; }
  }
  input.value = new URLSearchParams(location.search).get('q') || '';
  input.addEventListener('input', render);
  render();
})();
