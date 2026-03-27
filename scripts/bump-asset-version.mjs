#!/usr/bin/env node
/**
 * Stamps a shared cache-busting query string onto the live CSS/JS assets
 * across all HTML pages in the repo.
 *
 * Usage:
 *   node scripts/bump-asset-version.mjs 20260327-1
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const version = process.argv[2];

if (!version) {
  console.error('Usage: node scripts/bump-asset-version.mjs <version>');
  process.exit(1);
}

const SKIP_DIRS = new Set(['.git', '.claude', 'archive', 'scripts']);
const ASSETS = [
  '/assets/css/design.css',
  '/assets/js/page.js',
  '/assets/js/home.js',
];

function findHtml(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) findHtml(full, files);
    else if (entry.endsWith('.html')) files.push(full);
  }
  return files;
}

function stampAsset(html, assetPath) {
  const escaped = assetPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`${escaped}(?:\\?v=[^"]*)?`, 'g');
  return html.replace(re, `${assetPath}?v=${version}`);
}

let changed = 0;
for (const file of findHtml(ROOT)) {
  const original = readFileSync(file, 'utf8');
  let next = original;
  for (const asset of ASSETS) next = stampAsset(next, asset);
  if (next !== original) {
    writeFileSync(file, next, 'utf8');
    changed++;
    console.log(`updated ${relative(ROOT, file)}`);
  }
}

console.log(`done: stamped asset version ${version} in ${changed} HTML file(s)`);
