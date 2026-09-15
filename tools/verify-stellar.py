"""Verify Stellar pages, migrated content and attachments using the standard library."""
import hashlib
import json
import re
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote

root = Path(__file__).resolve().parents[1]
public = root / 'public'
errors = []

def require(condition, message):
    if not condition:
        errors.append(message)

class Page(HTMLParser):
    def __init__(self, content):
        super().__init__(convert_charrefs=True)
        self.links = []
        self.ids = set()
        self.refresh = None
        self.feed(content)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.add(attrs['id'])
        if tag == 'meta' and attrs.get('http-equiv') == 'refresh':
            self.refresh = attrs.get('content', '').split('url=')[-1]
        for attr in ('href', 'src'):
            if attrs.get(attr):
                self.links.append(attrs[attr])

posts = ['init-blog', 'blog-create-process', 'eddsa_mpc', 'blockchain-cloud', 'blockchain-mpc', 'normal-algorithm']
for slug in posts:
    old = (root / f'content/posts/{slug}.md').read_bytes()
    migrated = (root / f'source/_posts/{slug}.md').read_bytes()
    expected = re.sub(rb'(?m)^date: ([0-9-]+)T([0-9:]+)\+08:00$', rb'date: \1 \2', old)
    require(expected == migrated, f'Migration differs: {slug}')
    target = public / f'posts/{slug}/index.html'
    require(target.exists(), f'Missing article: {slug}')
    if target.exists():
        html = target.read_text()
        require('Stellar' in html and '/css/main.css' in html, f'Wrong theme: {slug}')
        original_date = re.search(rb'(?m)^date: ([0-9-]+)', old)[1].decode()
        require(re.search(r'<time[^>]*>' + original_date + r'</time>', html), f'Display date changed: {slug}')
for old in (root / 'static/files').glob('*.pdf'):
    digest = hashlib.sha256(old.read_bytes()).hexdigest()
    for folder in ('source/files', 'public/files'):
        target = root / folder / old.name
        require(target.exists() and hashlib.sha256(target.read_bytes()).hexdigest() == digest, f'Attachment mismatch: {target}')
index = json.loads((public / 'search.json').read_text())
require(all(any(item['path'] == f'/posts/{slug}/' for item in index) for slug in posts), 'Search is missing historical articles')
require(len({item['path'] for item in index}) == len(index), 'Duplicate search entries')
require(len(re.findall(r'<a class="post-card ', (public / 'index.html').read_text())) >= 6, 'Homepage lost article cards')
require('localhost' not in (public / 'index.xml').read_text(), 'Feed points to localhost')
require('class="highlight go"' in (public / 'posts/eddsa_mpc/index.html').read_text(), 'Historical Go code is not highlighted')

pages = {path.resolve(): Page(path.read_text()) for path in public.rglob('*.html')}
for path, page in pages.items():
    for link in page.links + ([page.refresh] if page.refresh else []):
        parsed = urlsplit(link)
        if parsed.scheme in ('mailto', 'tel', 'data', 'javascript') or (parsed.netloc and parsed.netloc != 'littleha233.github.io'):
            continue
        target = (public / unquote(parsed.path).lstrip('/')) if parsed.path.startswith('/') else path.parent / unquote(parsed.path)
        if not parsed.path:
            target = path
        if target.is_dir():
            target /= 'index.html'
        require(target.exists(), f'Broken link: {path.relative_to(public)} -> {link}')
        # Ignore runtime-only theme anchors. Markdown TOC anchors must exist.
        if parsed.fragment and parsed.fragment not in ('', 'start', 'search-input') and target.resolve() in pages:
            require(unquote(parsed.fragment) in pages[target.resolve()].ids, f'Broken anchor: {link}')
        if page.refresh and link == page.refresh:
            require(target.resolve() != path, f'Self-redirect: {path}')
for old in ('posts', 'search', 'publication/Blockchain&Cloud', 'publication/Blockchain&MPC', 'talks/normal-algorithm'):
    require((public / old / 'index.html').exists(), f'Missing legacy route: {old}')
require(not list((root / 'scripts').glob('*.py')), 'Hexo scripts/ cannot contain Python files')
if errors:
    raise SystemExit('\n'.join(sorted(set(errors))))
print(f'PASS: Stellar on {len(pages)} pages; 6 original articles and 3 PDFs preserved; search, assets, old URLs and anchors valid.')
