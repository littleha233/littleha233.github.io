const { url_for } = require('hexo-util');

hexo.extend.injector.register('head_end', () =>
  `<link rel="stylesheet" href="${url_for.call(hexo, '/css/reading-layout.css')}">` +
  `<script defer src="${url_for.call(hexo, '/js/reading-layout.js')}"></script>`
);
