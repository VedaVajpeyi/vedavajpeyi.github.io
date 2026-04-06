# vedavajpeyi.github.io

Personal portfolio site for Veda Vajpeyi — product strategist, writer, advisor.

## Repo mental model

This repo is a static site served directly by GitHub Pages. There is no framework, no template engine, and no content build step.

- Live production lives at the repo root and in `work/`, `writing/`, `services/`, `topics/`, and `projects/`.
- `assets/` is the production asset surface for the live site.
- `experiments/` contains mockups, variants, and design explorations that are not part of the live site.
- `references/` contains non-deployable source/reference material.
- `prototype/` currently exists as an intentionally preserved local/ambiguous scratch folder. Treat it as non-production unless explicitly asked to use or remove it.

## Live production surface

```text
index.html
about.html
contact.html
sociology-product.html
sociology-product-field-guide.html

work/
  index.html
  case-study-[1-5].html

writing/
  index.html
  essay-[1-23].html

services/
  index.html
  product-advising.html
  career-coaching.html
  mba-positioning.html
  college-admissions.html
  speaking.html

topics/
  <topic>/index.html
  # topic landing pages live here
  # there is currently no topics/index.html landing page

projects/
  books-beds.html
```

## Production assets

Key production assets currently live under `assets/`:

```text
assets/css/design.css
assets/css/sxp-essays.css
assets/css/sociology-product.css
assets/css/sociology-product-system.css
assets/css/work-scroll-morph.css

assets/js/page.js
assets/js/home.js

assets/img/
assets/img/about-v21/notebook-notes/
  # legacy folder name, but still used by live sociology pages
```

Live pages should reference production assets from `assets/`, not files under `experiments/` or `references/`.

## Non-production areas

```text
experiments/
  about-v21/
  sociology-product/

references/
  about-v21/
  books-and-beds/

prototype/
  # preserved local/ambiguous scratch folder
```

## Editing

Edit HTML files directly. For nav, mobile menu, or footer changes see **Shared chrome** below.

## Shared chrome

Nav, mobile menu, and footer are duplicated across live pages. `index.html` is the canonical source.

After changing nav or footer in `index.html`:

```bash
node scripts/sync-chrome.mjs --write
```

Dry-run (verify only, no writes):

```bash
node scripts/sync-chrome.mjs
```

## Asset cache busting

Shared assets use a `?v=` query string so browsers fetch updated CSS/JS after deploys.

When `assets/css/design.css`, `assets/js/page.js`, or `assets/js/home.js` change:

```bash
node scripts/bump-asset-version.mjs 20260327-1
```

Use a new version string whenever shared assets change.
