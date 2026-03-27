# Agents.md

Guidance for coding agents working in this repository.

## Edit Policy

Keep this file current whenever architecture or workflow changes.

## Real live architecture

The site is static HTML served by GitHub Pages. There is **no template engine, no `content/pages/` directory, no `sync-pages.mjs`, no `index.template.html`, and no `main.css`/`main.js`**. Any docs referencing those are stale.

| File / Path | Role |
|---|---|
| `index.html` | Homepage — full static HTML |
| `about.html`, `contact.html` | Root-level interior pages |
| `work/index.html`, `work/case-study-[1-5].html` | Work section |
| `writing/index.html`, `writing/essay-[1-4].html` | Writing section |
| `services/index.html`, `services/*.html` | Services section |
| `projects/books-beds.html` | Projects section |
| `assets/css/design.css` | Single shared stylesheet — used by every page |
| `assets/js/page.js` | Shared JS — Lenis, cursor, nav, reveals, footer rotator |
| `assets/js/home.js` | Homepage-only JS — preloader, char stagger, spy dots, bg hover |
| `scripts/sync-chrome.mjs` | Verifies/syncs nav + footer across all pages |
| `archive/` | Old versions — do not edit |

## Shared chrome: nav, mobile menu, footer

All pages duplicate the same nav, mobile-menu, and footer HTML. **`index.html` is the canonical source.**

Whenever nav or footer is changed in `index.html`:
```bash
node scripts/sync-chrome.mjs --write
```

Dry-run to verify consistency without writing:
```bash
node scripts/sync-chrome.mjs
```

## Agent working rules

1. Keep diffs minimal and reviewable.
2. Preserve existing brand voice, copy quality, and visual language.
3. Edit HTML files directly — there is no build step for content.
4. When changing shared chrome (nav/footer/mobile-menu): edit `index.html` first, then run `sync-chrome.mjs --write` to propagate.
5. All asset paths must be root-relative (e.g. `/assets/css/design.css`, `/assets/js/page.js`).
6. Do not delete files in `archive/`.
7. Do not reference `main.css`, `main.js`, `index.template.html`, `content/pages/`, or `sync-pages.mjs` — those do not exist.

## Validation before finishing

1. Confirm all changed pages have valid HTML structure.
2. Check that internal links still work.
3. Run `node scripts/sync-chrome.mjs` to verify chrome consistency.
4. If nav/footer changed, run with `--write`.
