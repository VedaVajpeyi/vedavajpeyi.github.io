# personal_website

Personal website for Veda.

## Project structure

- `index.html`: generated site file served to browsers.
- `index.template.html`: base template used to rebuild `index.html`.
- `content/pages/*.html`: one file per page/section content block.
- `assets/css/main.css`: global styles.
- `assets/js/main.js`: client-side behavior.
- `scripts/sync-pages.mjs`: content sync/build utility.

## Editing workflow

1. Edit the page content file you want in `content/pages/`.
2. Rebuild:

```bash
node scripts/sync-pages.mjs build
```

3. Open `index.html` as usual.

## Sync commands

- Initialize/split from current `index.html`:

```bash
node scripts/sync-pages.mjs init
```

- Rebuild `index.html` from template + content files:

```bash
node scripts/sync-pages.mjs build
```
