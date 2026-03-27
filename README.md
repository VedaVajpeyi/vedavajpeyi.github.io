# vedavajpeyi.github.io

Personal portfolio site for Veda Vajpeyi — product strategist, writer, advisor.

## Live architecture

Static HTML served directly by GitHub Pages. No framework, no build step for content.

```
index.html                  homepage (full static page)
about.html                  about page
contact.html                contact page
work/
  index.html                case studies index
  case-study-[1-5].html     individual case studies
writing/
  index.html                essays index
  essay-[1-4].html          individual essays
services/
  index.html                services overview
  product-advising.html
  career-coaching.html
  mba-positioning.html
  college-admissions.html
  speaking.html
projects/
  books-beds.html
assets/
  css/design.css            single shared stylesheet (all pages)
  js/page.js                shared JS (all pages)
  js/home.js                homepage-only JS
scripts/
  sync-chrome.mjs           chrome consistency tool (see below)
```

## Editing

Edit HTML files directly. For nav, mobile menu, or footer changes see **Chrome sync** below.

## Chrome sync

Nav, mobile menu, and footer are identical across all pages. `index.html` is the canonical source.

**After changing nav or footer in `index.html`:**
```bash
node scripts/sync-chrome.mjs --write
```

Dry-run (verify only, no writes):
```bash
node scripts/sync-chrome.mjs
```
