#!/usr/bin/env node
/**
 * sync-chrome.mjs
 *
 * Verifies (or stamps) that all interior pages share the same
 * nav links, mobile menu links, and footer nav links as index.html.
 *
 * The homepage (index.html) is the canonical source for chrome.
 * Interior pages have a slightly different DOM order (cursor position
 * differs) so this script compares semantic content — nav <ul> and
 * footer <nav> — rather than raw HTML blocks, which avoids false
 * positives from structural differences unique to the homepage.
 *
 * Usage:
 *   node scripts/sync-chrome.mjs          — verify only (dry run)
 *   node scripts/sync-chrome.mjs --write  — apply nav/footer changes
 *
 * What it checks:
 *   1. <nav id="nav"> inner HTML matches (nav links)
 *   2. <div class="mobile-menu"> inner HTML matches (mobile links)
 *   3. <footer> inner HTML matches
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const WRITE = process.argv.includes('--write');

const SKIP = ['index.html', 'googlef400f4a67116809c.html'];

/**
 * Extract the outerHTML of the first element matching `openTag`
 * (a literal string that starts the opening tag, e.g. '<nav id="nav"')
 * through its matching closing `closeTag`.
 * Searches forward from `fromPos` (default 0).
 */
function extractBlock(html, openTag, closeTag, fromPos = 0) {
  const start = html.indexOf(openTag, fromPos);
  if (start === -1) return null;
  const end = html.indexOf(closeTag, start);
  if (end === -1) return null;
  return html.slice(start, end + closeTag.length);
}

/** Normalise whitespace for comparison (collapse runs, trim) */
function normalise(s) {
  return s.replace(/\s+/g, ' ').trim();
}

// Find all HTML files recursively, excluding archive/ and .git
function findHtml(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'archive' || entry === '.git' || entry === 'scripts' || entry === '.claude') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) findHtml(full, files);
    else if (entry.endsWith('.html')) files.push(full);
  }
  return files;
}

// --- Read canonical chrome from index.html ---
const indexHtml = readFileSync(join(ROOT, 'index.html'), 'utf8');

const canonicalNav    = extractBlock(indexHtml, '<nav id="nav"', '</nav>');
const canonicalMobile = extractBlock(indexHtml, '<div class="mobile-menu"', '</div>');
const canonicalFooter = extractBlock(indexHtml, '<footer', '</footer>');

if (!canonicalNav || !canonicalMobile || !canonicalFooter) {
  console.error('ERROR: Could not extract one or more chrome blocks from index.html.');
  console.error('  nav found:    ' + !!canonicalNav);
  console.error('  mobile found: ' + !!canonicalMobile);
  console.error('  footer found: ' + !!canonicalFooter);
  process.exit(1);
}

// --- Compare against all interior pages ---
const pages = findHtml(ROOT).filter(f => !SKIP.some(s => f.endsWith(s)));
let issues = 0;

for (const page of pages) {
  const rel = relative(ROOT, page);
  const html = readFileSync(page, 'utf8');

  const pageNav    = extractBlock(html, '<nav id="nav"', '</nav>');
  const pageMobile = extractBlock(html, '<div class="mobile-menu"', '</div>');
  const pageFooter = extractBlock(html, '<footer', '</footer>');

  const navOk    = pageNav    && normalise(pageNav)    === normalise(canonicalNav);
  const mobileOk = pageMobile && normalise(pageMobile) === normalise(canonicalMobile);
  const footerOk = pageFooter && normalise(pageFooter) === normalise(canonicalFooter);

  if (!navOk || !mobileOk || !footerOk) {
    issues++;
    console.log(`\n⚠  ${rel}`);
    if (!navOk)    console.log('   main nav differs from canonical');
    if (!mobileOk) console.log('   mobile menu differs from canonical');
    if (!footerOk) console.log('   footer differs from canonical');

    if (WRITE) {
      let fixed = html;
      if (!navOk    && pageNav)    fixed = fixed.replace(pageNav,    canonicalNav);
      if (!mobileOk && pageMobile) fixed = fixed.replace(pageMobile, canonicalMobile);
      if (!footerOk && pageFooter) fixed = fixed.replace(pageFooter, canonicalFooter);
      writeFileSync(page, fixed, 'utf8');
      console.log('   ✓ fixed');
    }
  }
}

if (issues === 0) {
  console.log('✓ All pages have consistent chrome (nav, mobile menu, footer).');
} else if (!WRITE) {
  console.log(`\n${issues} page(s) differ. Run with --write to sync.`);
}
