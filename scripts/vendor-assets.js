// Serve core browser dependencies locally so local and Pages behave alike.
const fs = require('node:fs');
const path = require('node:path');
hexo.extend.generator.register('local-browser-dependencies', function () {
  return [
    ['marked/lib/marked.umd.js', 'vendor/marked.umd.js'],
    ['vanilla-lazyload/dist/lazyload.min.js', 'vendor/lazyload.min.js'],
    ['highlight.js/styles/atom-one-dark.min.css', 'vendor/atom-one-dark.min.css'],
  ].map(([source, output]) => ({path: output, data: fs.readFileSync(path.join(this.base_dir, 'node_modules', source))}));
});
