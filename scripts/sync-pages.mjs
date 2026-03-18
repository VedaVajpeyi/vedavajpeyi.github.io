import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const INDEX_PATH = path.join(ROOT, 'index.html');
const TEMPLATE_PATH = path.join(ROOT, 'index.template.html');
const PAGES_DIR = path.join(ROOT, 'content', 'pages');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function findMainBounds(html) {
  const openTag = '<main>';
  const closeTag = '</main>';
  const openIdx = html.indexOf(openTag);
  const closeIdx = html.indexOf(closeTag);
  if (openIdx === -1 || closeIdx === -1 || closeIdx < openIdx) {
    throw new Error('Could not find <main>...</main> in index.html');
  }
  return {
    before: html.slice(0, openIdx + openTag.length),
    mainInner: html.slice(openIdx + openTag.length, closeIdx),
    after: html.slice(closeIdx),
  };
}

function extractPagesFromMain(mainInner) {
  const pages = [];
  const pageOpenRe = /<div\s+id="([^"]+)"\s+class="page(?:\s+active)?"\s*>/g;

  let match;
  while ((match = pageOpenRe.exec(mainInner)) !== null) {
    const id = match[1];
    const start = match.index;

    const divTagRe = /<\/?div\b[^>]*>/g;
    divTagRe.lastIndex = start;
    let depth = 0;
    let end = -1;
    let tag;

    while ((tag = divTagRe.exec(mainInner)) !== null) {
      const raw = tag[0];
      const isClosing = raw.startsWith('</');
      if (!isClosing) {
        depth += 1;
      } else {
        depth -= 1;
      }

      if (depth === 0) {
        end = divTagRe.lastIndex;
        break;
      }
    }

    if (end === -1) {
      throw new Error(`Unbalanced <div> while extracting page ${id}`);
    }

    const content = mainInner.slice(start, end);
    pages.push({ id, start, end, content });

    pageOpenRe.lastIndex = end;
  }

  if (pages.length === 0) {
    throw new Error('No page blocks found in <main>');
  }

  return pages;
}

function extract() {
  const html = read(INDEX_PATH);
  const { before, mainInner, after } = findMainBounds(html);
  const pages = extractPagesFromMain(mainInner);

  pages.forEach((page) => {
    write(path.join(PAGES_DIR, `${page.id}.html`), `${page.content}\n`);
  });

  let cursor = 0;
  let templateMain = '';
  for (const page of pages) {
    templateMain += mainInner.slice(cursor, page.start);
    templateMain += `\n        <!-- PAGE: ${page.id} -->\n        {{page:${page.id}}}\n`;
    cursor = page.end;
  }
  templateMain += mainInner.slice(cursor);

  const template = `${before}${templateMain}${after}`;
  write(TEMPLATE_PATH, template);

  return pages.map((p) => p.id);
}

function build() {
  const template = read(TEMPLATE_PATH);
  const built = template.replace(/\{\{page:([^}]+)\}\}/g, (_, id) => {
    const pagePath = path.join(PAGES_DIR, `${id}.html`);
    if (!fs.existsSync(pagePath)) {
      throw new Error(`Missing content file: ${path.relative(ROOT, pagePath)}`);
    }
    return read(pagePath).trimEnd();
  });
  write(INDEX_PATH, built);
}

function main() {
  const command = process.argv[2] || 'build';

  if (command === 'init') {
    const ids = extract();
    build();
    console.log(`Initialized ${ids.length} page files in content/pages and wrote index.template.html`);
    return;
  }

  if (command === 'build') {
    build();
    console.log('Built index.html from index.template.html + content/pages');
    return;
  }

  if (command === 'extract') {
    const ids = extract();
    console.log(`Extracted ${ids.length} pages from index.html into content/pages`);
    return;
  }

  throw new Error(`Unknown command: ${command}. Use: init | build | extract`);
}

main();
