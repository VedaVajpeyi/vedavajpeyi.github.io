# Agents.md

This file provides guidance for coding agents working in this repository.

## Edit Policy

Agents are allowed to edit this `Agents.md` file whenever website changes make the guidance outdated or incomplete.

## Repository Purpose

This repository contains the Veda website and archived versions/pages.

## Current Website Structure

The live site is still served from `index.html`, but content is now organized for easier editing:

- `index.html`: generated output file to serve.
- `index.template.html`: template with page placeholders.
- `content/pages/*.html`: source content blocks (one file per page/section).
- `assets/css/main.css`: site styles.
- `assets/js/main.js`: site JavaScript.
- `scripts/sync-pages.mjs`: script to rebuild/sync `index.html`.

## Content Editing Workflow

1. Edit content in `content/pages/<page>.html`.
2. Rebuild `index.html`:
   - `node scripts/sync-pages.mjs build`
3. Validate that navigation, styling, and behavior are unchanged.

## Agent Working Rules

1. Keep edits focused on the requested change.
2. Preserve existing page style and structure unless a redesign is requested.
3. Avoid breaking links between current and archived pages.
4. Prefer minimal, reviewable diffs.
5. Do not delete historical archive files unless explicitly requested.
6. For content changes, edit `content/pages/*` and rebuild `index.html` instead of manually editing large inlined blocks.

## Validation Checklist

Before finishing, agents should:

1. Confirm changed pages still load with valid HTML structure.
2. Verify navigation and internal links affected by the change.
3. Keep formatting consistent with nearby files.
4. If page content changed, run `node scripts/sync-pages.mjs build` before finalizing.
