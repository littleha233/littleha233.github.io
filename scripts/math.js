// Extend the existing Markdown renderer before Markdown consumes TeX escapes.
const fs = require('node:fs');
const path = require('node:path');
const markedKatex = require('marked-katex-extension');
const { url_for } = require('hexo-util');

hexo.extend.filter.register('marked:extensions', extensions => {
  extensions.push(...markedKatex({
    nonStandard: true, // Chinese prose does not require spaces around $...$.
    throwOnError: false,
    trust: false,
    maxSize: 10,
    maxExpand: 1000,
    output: 'htmlAndMathml',
  }).extensions);
});

// Hexo's plain-text TOC otherwise repeats MathML, TeX annotations and visual text.
const toc = hexo.extend.helper.get('toc');
hexo.extend.helper.register('toc', function (html, options) {
  return toc.call(this, html.replace(/<span class="katex-mathml">[\s\S]*?<\/math><\/span>/g, ''), options);
});

// CSS and matching fonts travel with the static site, including prefixed previews.
hexo.extend.generator.register('local-math-assets', function () {
  const dist = path.join(path.dirname(require.resolve('katex/package.json')), 'dist');
  const files = ['katex.min.css', ...fs.readdirSync(path.join(dist, 'fonts')).map(name => 'fonts/' + name)];
  return files.map(file => ({
    path: 'vendor/katex/' + file,
    data: fs.readFileSync(path.join(dist, file)),
  }));
});
hexo.extend.injector.register('head_end', () => [
  'vendor/katex/katex.min.css',
  'css/math.css',
].map(file => `<link rel="stylesheet" href="${url_for.call(hexo, '/' + file)}">`).join('\n'));
