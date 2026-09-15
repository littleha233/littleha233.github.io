// Keep the previous Hugo and academic-site entry points working in Hexo.
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
hexo.extend.generator.register('legacy-redirects', function (locals) {
  const redirects = new Map([
    ['posts/index.html', '/'],
    ['search/index.html', '/#search-input'],
    ['publication/Blockchain&Cloud/index.html', '/posts/blockchain-cloud/'],
    ['publication/Blockchain&MPC/index.html', '/posts/blockchain-mpc/'],
    ['talks/normal-algorithm/index.html', '/posts/normal-algorithm/'],
  ]);
  // Existing Latin tags keep lowercase URLs through _config.yml tag_map.
  return [...redirects].map(([path, target]) => ({path, data: `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${escape(target)}"><link rel="canonical" href="${escape(new URL(target, this.config.url).href)}"><title>页面已迁移</title></head><body><a href="${escape(target)}">前往笔记</a></body></html>`}));
});
// Make migration dates stable rather than displaying the checkout timestamp.
hexo.extend.filter.register('before_post_render', data => {
  if (data.legacy) data.updated = data.date;
  // The historical EdDSA article ends with an unclosed Go code fence.
  // Close it only for rendering; keep the archived Markdown untouched.
  let fence = null;
  for (const line of data.content.split('\n')) {
    const match = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (!match) continue;
    if (!fence) fence = match[1];
    else if (match[1][0] === fence[0] && match[1].length >= fence.length && !match[2].trim()) fence = null;
  }
  if (fence) data.content += '\n' + fence + '\n';
  return data;
}, 0);
