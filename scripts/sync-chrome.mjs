#!/usr/bin/env node
/**
 * sync-chrome.mjs
 *
 * Extracts the canonical nav, mobile-menu, and footer from index.html
 * and verifies (or stamps) all other HTML pages have the same chrome.
 *
 * Usage:
 *   node scripts/sync-chrome.mjs          — verify only (dry run)
 *   node scripts/sync-chrome.mjs --write  — apply changes
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const WRITE = process.argv.includes('--write');

// Pages to skip (homepage has home.js; google verification file is irrelevant)
const SKIP = ['index.html', 'googlef400f4a67116809c.html'];

// Marker pattern: extract block between HTML comments
function extract(html, startComment, endComment) {
  const start = html.indexOf(startComment);
  const end = html.indexOf(endComment);
  if (start === -1 || end === -1) return null;
  return html.slice(start, end + endComment.length);
}

// Find all HTML files recursively, excluding archive/ and scripts/
function findHtml(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'archive' || entry === '.git' || entry === 'scripts') continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) findHtml(full, files);
    else if (entry.endsWith('.html')) files.push(full);
  }
  return files;
}

// Read canonical chrome from index.html
const indexHtml = readFileSync(join(ROOT, 'index.html'), 'utf8');

const canonicalNav = extract(indexHtml, '<!-- MOBILE MENU -->', '</nav>');
const canonicalFooter = extract(indexHtml, '<footer', '</footer>');

if (!canonicalNav || !canonicalFooter) {
  console.error('Could not extract canonical chrome from index.html');
  process.exit(1);
}

// Add closing newline and nav cursor div if needed
const canonicalCursor = '<div class="cursor" id="cursor"></div>';

const pages = findHtml(ROOT).filter(f => !SKIP.some(s => f.endsWith(s)));
let issues = 0;

for (const page of pages) {
  const rel = relative(ROOT, page);
  const html = readFileSync(page, 'utf8');

  const pageNav = extract(html, '<!-- MOBILE MENU -->', '</nav>');
  const pageFooter = extract(html, '<footer', '</footer>');

  const navMatch = pageNav === canonicalNav;
  const footerMatch = pageFooter === canonicalFooter;

  if (!navMatch || !footerMatch) {
    issues++;
    console.log(`\n⚠  ${rel}`);
    if (!navMatch) console.log('   nav/mobile-menu differs from canonical');
    if (!footerMatch) console.log('   footer differs from canonical');

    if (WRITE && pageNav && pageFooter) {
      const fixed = html
        .replace(pageNav, canonicalNav)
        .replace(pageFooter, canonicalFooter);
      writeFileSync(page, fixed, 'utf8');
      console.log('   ✓ fixed');
    }
  }
}

if (issues === 0) {
  console.log('✓ All pages have consistent chrome.');
} else if (!WRITE) {
  console.log(`\n${issues} page(s) differ. Run with --write to sync.`);
}
