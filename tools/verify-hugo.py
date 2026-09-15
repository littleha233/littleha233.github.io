"""Validate the production blog, without third-party dependencies."""
import hashlib
from datetime import datetime, timezone
import json
import re
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
errors = []


def require(ok, message):
    if not ok:
        errors.append(message)


def body(text):
    return re.sub(r'^---\r?\n[\s\S]*?\r?\n---\r?\n', '', text).strip()


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.links = []
        self.ids = set()
        self.h1s = 0
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attr = dict(attrs)
        if 'id' in attr:
            self.ids.add(attr['id'])
        if tag == 'h1':
            self.h1s += 1
        for key in ('href', 'src'):
            if key in attr:
                self.links.append(attr[key])


if '--output-only' not in sys.argv:
    for name in ('init-blog', 'blog-create-process', 'eddsa_mpc'):
        original = subprocess.check_output(['git', 'show', f'ae92b49:content/posts/{name}.md'], cwd=ROOT).decode()
        require(body(original) == body((ROOT / f'content/posts/{name}.md').read_text()), f'Original article changed: {name}')
    for source, name in (('_publications/Blockchain&Cloud.md', 'blockchain-cloud'), ('_publications/Blockchain&MPC.md', 'blockchain-mpc'), ('_talks/normal-algorithm.md', 'normal-algorithm')):
        original = subprocess.check_output(['git', 'show', f'4d292ed:{source}'], cwd=ROOT).decode()
        expected = body(original).replace('http://littleha233.github.io/files/', '/files/')
        require(expected == body((ROOT / f'content/posts/{name}.md').read_text()), f'Historical article changed: {name}')
    for name in ('Blockchain&Cloud.pdf', 'Blockchain&MPC.pdf', 'Normal-Alogorithm.pdf'):
        original = subprocess.check_output(['git', 'show', f'4d292ed:files/{name}'], cwd=ROOT)
        copied = (ROOT / 'static/files' / name).read_bytes()
        require(hashlib.sha256(original).digest() == hashlib.sha256(copied).digest(), f'Attachment changed: {name}')

pages = {path: Page(path.read_text()) for path in PUBLIC.rglob('*.html')}
require(bool(pages), 'No HTML output; run hugo --gc --minify first')
for path, page in pages.items():
    # Hugo alias pages intentionally have no heading.
    if 'http-equiv="refresh"' not in path.read_text() and 'http-equiv=refresh' not in path.read_text():
        require(page.h1s == 1, f'{path.relative_to(PUBLIC)} must have exactly one h1')
    for link in page.links:
        parsed = urlsplit(link)
        if parsed.scheme in ('mailto', 'tel', 'data') or (parsed.netloc and parsed.netloc != 'littleha233.github.io'):
            continue
        if parsed.path:
            target = (PUBLIC / unquote(parsed.path).lstrip('/')) if parsed.path.startswith('/') or parsed.netloc else path.parent / unquote(parsed.path)
            if target.is_dir():
                target /= 'index.html'
        else:
            target = path
        require(target.exists(), f'Broken local link: {path.relative_to(PUBLIC)} -> {link}')
        if parsed.fragment and target in pages:
            require(unquote(parsed.fragment) in pages[target].ids, f'Broken anchor: {path.relative_to(PUBLIC)} -> {link}')

index = json.loads((PUBLIC / 'index.json').read_text())
published = []
for source in (ROOT / 'content/posts').rglob('*.md'):
    text = source.read_text()
    front = text.split('---', 2)[1] if text.startswith('---') else ''
    if source.name == '_index.md' or re.search(r'^draft:\s*true\s*$', front, re.M):
        continue
    date = re.search(r'^date:\s*[\"\']?([^\s\"\']+)', front, re.M)
    if date:
        published_at = datetime.fromisoformat(date[1].replace('Z', '+00:00'))
        if published_at.tzinfo is None:
            published_at = published_at.replace(tzinfo=timezone.utc)
        if published_at > datetime.now(timezone.utc):
            continue
    published.append(source)
require(len(index) == len(published), f'Search index mismatch: {len(index)} entries / {len(published)} published articles')
require(all('/posts/' in entry['url'] for entry in index), 'Search index contains non-article pages')
require(len({entry['url'] for entry in index}) == len(index), 'Duplicate search URLs')
for slug in ('eddsa_mpc', 'init-blog', 'blog-create-process', 'blockchain-cloud', 'blockchain-mpc', 'normal-algorithm'):
    require((PUBLIC / 'posts' / slug / 'index.html').exists(), f'Missing migrated route: {slug}')
for alias in ('publication/Blockchain&Cloud', 'publication/Blockchain&MPC', 'talks/normal-algorithm'):
    require((PUBLIC / alias / 'index.html').exists(), f'Missing old URL: {alias}')
require('localhost' not in (PUBLIC / 'index.xml').read_text(), 'RSS points at development server')
if errors:
    print('\n'.join(errors))
    sys.exit(1)
print(f'PASS: {len(pages)} HTML pages, {len(index)} searchable articles, local links and old URLs.' + (' Original article bodies and 3 PDFs match.' if '--output-only' not in sys.argv else ''))
