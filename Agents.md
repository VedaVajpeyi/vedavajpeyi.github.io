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
| `sociology-product.html`, `sociology-product-field-guide.html` | Root-level sociology x product pages |
| `work/index.html`, `work/case-study-[1-5].html` | Work section |
| `writing/index.html`, `writing/essay-[1-23].html` | Writing section |
| `services/index.html`, `services/*.html` | Services section |
| `topics/<topic>/index.html` | Topic landing pages |
| `projects/books-beds.html` | Projects section |
| `assets/css/design.css` | Shared base stylesheet — used by every live page |
| `assets/css/sxp-essays.css` | Shared essay + sociology content stylesheet |
| `assets/css/sociology-product.css` | Sociology x Product landing page stylesheet |
| `assets/css/sociology-product-system.css` | Sociology x Product field guide/system stylesheet |
| `assets/css/work-scroll-morph.css` | Live Work-page stylesheet |
| `assets/js/page.js` | Shared JS — Lenis, cursor, nav, reveals, footer rotator |
| `assets/js/home.js` | Homepage-only JS — preloader, char stagger, spy dots, bg hover |
| `assets/img/about-v21/notebook-notes/` | Legacy path, but still live production images used on sociology pages |
| `scripts/sync-chrome.mjs` | Verifies/syncs nav + footer across all pages |
| `scripts/bump-asset-version.mjs` | Stamps a new `?v=` suffix onto shared asset URLs |

## Repo mental model

- Live production lives at root and in `work/`, `writing/`, `services/`, `topics/`, and `projects/`.
- `assets/` is the live production asset surface.
- `experiments/` is for non-live mockups and explorations.
- `references/` is for non-deployable source/reference material.
- `prototype/` exists in the repo today but is ambiguous/local in intent; do not treat it as live production.
- There is currently no `topics/index.html` landing page; topic pages live at `topics/<topic>/index.html`.

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

## Asset versioning

Shared CSS/JS URLs use a `?v=` suffix for cache busting.

Whenever `assets/css/design.css`, `assets/js/page.js`, or `assets/js/home.js` change:

```bash
node scripts/bump-asset-version.mjs 20260327-1
```

Pick a new version string for each shared-asset deploy.

## Agent working rules

1. Keep diffs minimal and reviewable.
2. Preserve existing brand voice, copy quality, and visual language.
3. Edit HTML files directly — there is no build step for content.
4. When changing shared chrome (nav/footer/mobile-menu): edit `index.html` first, then run `sync-chrome.mjs --write` to propagate.
5. All asset paths in live pages must be root-relative (for example `/assets/css/design.css` and `/assets/js/page.js`).
6. When shared CSS/JS changes, bump the shared `?v=` asset suffix across live HTML pages.
7. Do not treat `experiments/`, `references/`, or `prototype/` as live production unless the task explicitly says so.
8. The path `assets/img/about-v21/notebook-notes/` is legacy-named but currently live; do not move or rename it casually.
9. Do not reference `main.css`, `main.js`, `index.template.html`, `content/pages/`, or `sync-pages.mjs` — those do not exist.

## Validation before finishing

1. Confirm all changed pages have valid HTML structure.
2. Check that internal links still work.
3. Run `node scripts/sync-chrome.mjs` to verify chrome consistency.
4. If nav/footer changed, run with `--write`.
5. If shared CSS/JS changed, verify the asset version suffix is current.
