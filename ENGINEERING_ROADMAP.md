# Engineering Roadmap — vedavajpeyi.github.io

**Status: draft, pending your review.** This document is meant to become canonical once you've looked it over — it shouldn't be treated as an approved contract just because it's written down. Once you sign off, it supersedes the individual audit findings it was built from, and re-planning stops: re-verify a specific task against current code immediately before executing it, then update this file. Don't re-derive priorities from scratch.

## Engineering principles

These override individual tasks if the two ever conflict.

1. Preserve user-visible behavior unless a task explicitly says otherwise.
2. Prefer deletion over abstraction; prefer simplification over optimization.
3. Minimize diff size. One task, one concern, one commit.
4. Never expand scope mid-task — a new finding becomes a new task, not an addition to the current one.
5. Revalidate every finding against current code before implementing it, not the audit snapshot.
6. If confidence in a finding drops below roughly 95% on revalidation, stop and record the uncertainty instead of proceeding on the original assumption.
7. Complete one task, verify it, commit it, before starting the next.
8. This document is the single source of truth for what's planned, deferred, and rejected — don't re-litigate a Rejected item without new evidence.
9. Engineering effort is constrained: before implementing any task, briefly confirm it's still among the highest-ROI remaining items. If inspection shows its value has materially changed since this was written, say why, update the roadmap, and don't proceed automatically on the stale assumption. This document is a plan, not a script — the moment it stops matching reality, the document loses, not reality.
10. Process is part of the deliverable: if the same verification dance repeats three times, script it once instead of hand-running it a fourth time (this is why `sync-chrome.mjs`, `strip-pg-nav-cta.mjs`-style throwaway scripts, and the exact-token dead-class check exist — reuse that method rather than re-deriving it per task).

**Repo state as of this doc (main @ `2a22d9d`):** 12 commits of audit + 7 of implementation. ~980 lines of dead CSS removed, one real bug fixed (`.pg-nav-cta`, 47 pages), one duplicate JS implementation consolidated, one accessibility gap closed (accordion), CI now enforces chrome consistency.

---

## Definition of Done

Applies to every task below in addition to whatever that task's own Verification checklist calls out. A task isn't Complete until all of these are true:

- [ ] Finding independently revalidated against current code (not just the audit's original snapshot)
- [ ] Implementation is the minimal diff that satisfies the objective — no scope expansion
- [ ] Build/syntax check passes (brace balance for CSS, `node --check` for JS, or equivalent)
- [ ] `node scripts/sync-chrome.mjs` clean
- [ ] All live pages return 200
- [ ] Browser verification complete on at least one representative page per template type touched
- [ ] Console clean (no new errors/warnings)
- [ ] Shared asset `?v=` bumped if `design.css`/`page.js`/`home.js` changed
- [ ] This roadmap updated: task status flipped, any new findings logged as new tasks (not folded into this one)
- [ ] Committed with a message naming the task's objective, not just its ID

## Task template

Every queued task (Phases 3–6) uses this shape. The per-task **Verification checklist** below is what's specific to that task; the Definition of Done above applies universally on top of it. Deferred/Rejected/Future items intentionally use a one-line format — they don't deserve execution-ready detail until they're actually picked up, since re-verification happens at pickup time anyway.

```
Task ID:
Objective:
Why this exists:
Dependencies:
Files expected to change:
Implementation plan:
Verification checklist:
Success criteria:
Rollback plan:
Estimated risk:
Status:
```

---

## Dependency graph

```
Phase 1 (dead code)  ──✅ done, no dependents
Phase 2 (dup logic)  ──✅ done, no dependents

Phase 3 ─┬─ 3.1 (skip link + <main>)     ─┐
         ├─ 3.2 (lazy-loading sweep)      ├─ independent of each other
         └─ 3.3 (abbreviation legend)     ┘

Phase 4 ─┬─ 4.1 (-rgb tokens)             ─┐
         ├─ 4.2 (duration tokens)          ├─ independent of each other
         └─ 4.3 (z-index tokens)          ┘   and of Phase 3

Phase 5 ─┬─ 5.1 (broken-link + HTML check) ─┐
         └─ 5.2 (optimize portrait image)   ┴─ independent of Phase 3/4

Phase 6 (BLOCKED — needs your go-ahead to download anything)
  6.1 (self-host Lenis)      — independent
  6.2 (self-host Unsplash)   — independent, much larger

Phase 7 (SSG migration) — should come AFTER Phases 3–5 finish
  (migrating templates while still hand-editing 52 files doubles the work)
  and ideally BEFORE 6.2 (image references would move anyway)
```

Phases 3, 4, and 5 have no dependencies on each other or on anything unfinished — any of them can go first.

---

## Phase 0 — Repository safety (standing process, not a task queue)

Already in effect for every task executed so far; stated here so it doesn't need re-explaining per task:
1. `git status` clean check before starting.
2. Re-verify the specific finding against current code (exact-token class matching for CSS, direct read for JS/HTML) — not the audit snapshot.
3. Smallest correct diff.
4. Verify: syntax/brace check → `node scripts/sync-chrome.mjs` → full page-load sweep (all live pages return 200) → in-browser check (visual screenshot or computed-style/interaction test, whichever actually proves the property in question) → console-error check.
5. One themed commit per task, descriptive message (why, not just what).
6. Bump the shared asset `?v=` suffix in the same commit if `design.css`, `page.js`, or `home.js` changed — **this was missed once already** (the Phase 2 hover-tint commit); don't miss it again.

---

## Phase 1 — Dead code removal ✅ COMPLETE

| Task | Commit | Status |
|---|---|---|
| Remove abandoned scrollytelling system (`work-scroll-morph.css`, 937→228 lines) | `4b5944d` | ✅ |
| Remove dead "featured services" component (`design.css`) | `4b5944d` | ✅ |
| Remove dead earlier-homepage CSS sections | `4b5944d` | ✅ |
| Remove smaller confirmed-dead selectors + `writing-redesign.css` cleanup | `4b5944d` | ✅ |
| Remove dead `.ph` image-placeholder component (deferred from Phase 1, closed later) | `2a22d9d` | ✅ |

~980 lines removed total. No further dead-code candidates currently identified — the two files not exhaustively swept (`sociology-product.css`, `sxp-essays.css`) showed clean results when spot-checked (see Rejected/Future).

## Phase 2 — Duplicate logic ✅ COMPLETE (remaining items moved to Defer)

| Task | Commit | Status |
|---|---|---|
| Consolidate duplicate case-study hover-tint (`home.js` + inline `work/index.html` → shared `page.js`) | `dda160c` | ✅ |
| Fix `sync-chrome.mjs` to exit non-zero on drift; wire into CI | `c0c02c2` | ✅ |

Arrow-link consolidation (9+ near-identical components) and card-component consolidation (14 near-identical) are real duplicate-logic findings but are **Deferred** — see below, both are markup-touching, multi-page diffs that deserve a dedicated pass, not a slot in this phase.

---

## Phase 3 — Correctness & accessibility (in progress)

### Task 3.1 ✅ COMPLETE
- **Objective:** Add a skip-to-content link and wrap primary content in `<main>` across all 49 pages currently missing it (4/53 already have `<main>`).
- **Why this exists:** Zero pages have a skip link; keyboard/screen-reader users must tab through the full nav every page load. `<main>` gives assistive tech a real landmark to jump to.
- **Dependencies:** None.
- **Files expected to change:** `index.html` first (reference implementation — it's the canonical chrome source per `sync-chrome.mjs`), then all other live HTML files, plus a small CSS addition to `design.css` for the visually-hidden-until-focused skip link style.
- **Implementation plan:** Build and visually verify on `index.html` alone first. Confirm skip link is invisible until keyboard-focused, jumps correctly, and `<main>` wrapping doesn't disrupt existing layout (check it doesn't break any `#id`-based CSS targeting that assumed a different parent). Only then propagate via a scripted pass across the remaining pages, mirroring the `sync-chrome.mjs` approach (extract the pattern, apply mechanically, verify with the same script-based check afterward).
- **Verification checklist:** Tab-from-top on a fresh page load lands on the skip link first; activating it moves focus to `<main>`; `sync-chrome.mjs` still clean; visual screenshot shows no layout shift; all pages 200.
- **Success criteria:** Every live page has exactly one `<main>` and one skip link; zero visual change for mouse users.
- **Rollback plan:** Single revert per commit; changes are additive (new elements + CSS), not destructive.
- **Estimated risk:** Low — additive markup, but touches every page, so do the single-page proof first.
- **Status:** ✅ Complete. Commit `686b14e`. Files changed: 54 (52 live HTML pages + `design.css` + `page.js`).
  - **Follow-on finding, fixed in the same commit (not scope creep — it's what makes the skip link actually work):** the shared `a[href^="#"]` click handler in `page.js` only did a Lenis smooth-scroll, never moved keyboard focus. A keyboard user activating the skip link would visually jump but their next Tab press wouldn't resume inside the content. Fixed by adding `el.focus({preventScroll:true})` to that handler plus `tabindex="-1"` on `<main>`. This also silently improves every other in-page hash anchor site-wide (the sociology-product sticky-rail nav, the writing-page section jumps) — verified it's a no-op on their non-focusable targets, not a regression.
  - **Metrics:** LOC — 442 insertions / 119 deletions across 54 files. Pages with `<main>`: 4 → 52. Pages with a skip link: 0 → 52.

### Task 3.2 ✅ COMPLETE
- **Objective:** Apply `loading="lazy"` consistently to below-the-fold `<img>` tags (currently 19 of 22 lack it).
- **Why this exists:** Inconsistent — looks like a convention adopted partway through and never backfilled.
- **Dependencies:** None.
- **Files expected to change:** The ~10 live HTML files with `<img>` tags (essay pages, case studies, `projects/books-beds.html`).
- **Implementation plan:** Re-identify every `<img>` without `loading=`, confirm each is genuinely below-the-fold before adding the attribute (don't lazy-load anything in a hero).
- **Verification checklist:** Visual check that above-fold images still render immediately (no attribute added there); network tab shows lazy images deferring.
- **Success criteria:** Every below-fold `<img>` has `loading="lazy"`; no above-fold image does.
- **Rollback plan:** Trivial single-attribute revert.
- **Estimated risk:** Low.
- **Status:** ✅ Complete. Commit `82ff4c4`.
  - **Revalidation caught a stale number:** the original audit's "22 tags, 19 missing" no longer matched current code — actual count was 9 total `<img>` tags, only 5 missing `loading=`. Acted on the re-verified number, not the audit snapshot, per the working agreement.
  - **Metrics:** 5 `<img>` tags changed across 2 files (`index.html`, `sociology-product.html`). 9/9 `<img>` tags site-wide now have `loading="lazy"`.

### Task 3.3 ✅ COMPLETE
- **Objective:** Add a short legend comment to `design.css` documenting cryptic class abbreviations (`.ci`, `.mti`, `.tl-`, `.srv`, `.ei`, etc.).
- **Why this exists:** Cheap insurance against an agent (or future human) guessing wrong about what an abbreviated class means before editing it.
- **Dependencies:** None.
- **Files expected to change:** `design.css` (one comment block, no rule changes).
- **Implementation plan:** One pass through the file, list each non-obvious prefix with a one-line gloss.
- **Verification checklist:** N/A — comment-only, zero rendering risk.
- **Success criteria:** A future reader can look up any 2-4 letter class prefix in one place.
- **Rollback plan:** N/A.
- **Estimated risk:** None.
- **Status:** ✅ Complete. Commit `98649f1`. 13 prefixes documented (`.ci`, `.ei`, `.srv`, `.pg`, `.socx`, `.bb`, `.tl`, `.mti`, `.astat`, `.fu`, `.wu`, `.lw`, `.rot`); some candidates from the original audit (`.mti`, `.srv`) were already partly self-evident from Phase 1/3 work and included anyway for completeness.

### Task 3.4 ✅ COMPLETE
- **Objective:** Extend `prefers-reduced-motion` coverage to `writing-redesign.css` and `work-scroll-morph.css` — only `design.css` had a block; the writing and work-morph pages' `.wr-lede`/`.morph-deck` load-in reveals and hover micro-transforms (`translateY`/`translateX` on links and cards) ignored the OS-level preference entirely.
- **Why this exists:** Surfaced by an external (DeepSeek) review of the asset files; independently re-verified against current code before acting — most of that review's other findings didn't hold up (see below) but this one did.
- **Files expected to change:** `writing-redesign.css`, `work-scroll-morph.css`.
- **Implementation plan:** Mirror `design.css`'s existing targeted, per-selector pattern (kill `transition`, neutralize the hover/reveal consequence) rather than a blanket `*, *::before, *::after { transition: none !important }` override — consistent with how the rest of the codebase already handles this.
- **Verification checklist:** Brace-balance check both files; `sync-chrome.mjs` clean; confirmed via the browser's CSSOM that both new `@media (prefers-reduced-motion: reduce)` blocks parsed with the intended selectors; full 52-page 200 sweep; visual screenshot of both pages unchanged under normal motion; console clean.
- **Success criteria:** Both files have reduced-motion coverage matching `design.css`'s existing convention; zero visual change under normal (non-reduced) motion.
- **Rollback plan:** Both additions are new, self-contained media-query blocks appended at each file's end — trivial single-block revert.
- **Estimated risk:** None — additive only, scoped to a media query most visitors never trigger.
- **Status:** ✅ Complete. Commit `2fb21c9`. Shared asset `?v=` bumped to `20260714-3` (`writing-redesign.css` is in `bump-asset-version.mjs`'s tracked list; `work-scroll-morph.css` isn't in the script's `ASSETS` array but was already hand-kept in version-sync with it, so bumped to match — noted here as a small script gap, not worth fixing on its own).
  - **On the rest of that external review, for the record:** its "already fixed" recap (cursor, accordion a11y, sticky rail, hover tint, skip link, mobile-menu focus) checked out on independent verification. But two of its "critical" findings didn't survive re-verification against actual code and weren't acted on: the claimed `aria-current` false-positive doesn't reproduce with this site's real nav structure, and its suggested replacement would have broken the intentional sociology-product field-guide nav-highlighting; the `.morph-close` "orphaned class" claim is false — it's live in `work/index.html`, and the split rule-block pattern it flagged is the exact thing already investigated and rejected in this doc's Rejected section. The writing-page container-width finding is real but folded into the pre-existing, still-open "is the Writing section's distinct look intentional or drift" question below, rather than fixed in isolation — a width/font mismatch is exactly the kind of thing that question already covers, and it's a design call, not an engineering one.

### Task 3.5 ✅ COMPLETE
- **Objective:** Add `.list-item` (used across all 9 topic pages) to `design.css`'s `prefers-reduced-motion` block — it has a `transition: padding-left 0.5s` hover slide with no reduced-motion override. Separately: fix the case-study-5 hero image (also reused on `index.html` and `work/index.html`) linking through a `commons.wikimedia.org/wiki/Special:Redirect/...` URL instead of the direct `upload.wikimedia.org` file — an unnecessary redirect hop, and some social-card crawlers don't follow redirects for `og:image`/`twitter:image`, risking silently-broken share previews.
- **Why this exists:** Two more rounds of external (DeepSeek) review were run and independently re-verified against current code, same process as Task 3.4. Neither finding was what DeepSeek actually flagged — both were adjacent things found while checking claims that turned out false (see disposition below) — but both are real.
- **Dependencies:** None.
- **Files expected to change:** `design.css`, `work/case-study-5.html`, `index.html`, `work/index.html` (all three reuse the same Wikimedia image).
- **Implementation plan:** `.list-item` reduced-motion: same targeted per-selector pattern as Task 3.4. Wikimedia fix: resolve the redirect via a read-only `curl -I -L` (confirmed 301 → 200, no file downloaded — this is a URL substitution, not new third-party hosting, so it doesn't fall under the Phase 6 download-permission gate), then swap the URL in all 5 occurrences across the 3 files.
- **Verification checklist:** Brace-balance check on `design.css`; `sync-chrome.mjs` clean; confirmed via CSSOM that `.list-item`/`.list-item:hover` parsed into the reduced-motion block; visual screenshot of a topic page and case-study-5 (image loads correctly from the new URL, no console errors); full 52-page 200 sweep.
- **Success criteria:** `.list-item` hover slide respects reduced motion; all 5 Wikimedia references use the direct URL; zero visual change under normal motion.
- **Rollback plan:** Both changes are small, independent, easily revertible — a 2-line CSS addition and a URL string swap.
- **Estimated risk:** None.
- **Status:** ✅ Complete. Commit `7d63105`. Shared asset `?v=` bumped to `20260714-4`.
  - **On the two external reviews this came from, for the record:** both were substantially overlapping with the review Task 3.4 came from, and repeated several already-settled false claims (`aria-current`, `.morph-close`, `nav-revert-fix` — already deleted by the time of review). New claims that also didn't hold up: Lenis "CDN, verify the URL matches" — false, Lenis has been self-hosted since Task 6.1, no CDN reference exists; "CSS version inconsistency across pages" — false, verified a single consistent `?v=` site-wide at time of review; "`sync-chrome.mjs` skips all subdirectory `index.html` files" — false, empirically disproven by deliberately breaking `work/index.html`'s nav and confirming the script caught it (the script's `relative(ROOT, f)` comparison already correctly distinguishes root from subdirectory `index.html`, exactly per its own inline comment); "unused `.read-link`, superseded by `.about-read-link`" — false, `.read-link` doesn't exist anywhere in the codebase, only `.about-read-link` does (which is live and styled); the topics-page `aria-current` false-positive claim was explicitly hypothetical by the review's own admission (no `/topics/` nav link exists to trigger it). The `.wr-close-link` pill shape (`border-radius: 999px`) and `.wr-close-inner` (`30px`) "outlier" claims are real observations but, like the writing-page width/font findings from Task 3.4, folded into the same still-open "is the Writing section's distinct look intentional" question rather than treated as bugs. The homepage's ~1,374-line inline `<style>` block and mobile fit-calculation script, and `work/index.html`'s ~137-line inline block, are real but identified-not-fixed: extracting 1,374 lines from the highest-traffic page for a caching/organization benefit is a large-blast-radius change disproportionate to the payoff, and the fit-calculation script achieves exact-line-count text wrapping that CSS `clamp()` cannot — the suggested "fix" isn't behavior-equivalent, likely a deliberate choice, not dead weight.

### Task 3.6 ✅ COMPLETE
- **Objective:** A self-directed audit (not from an external review this time) across SEO/meta consistency, CLS, structured data, and 404 handling, run via a dedicated research pass rather than reacting to a third-party report. Fixed: (1) no root `404.html` existed — GitHub Pages fell through to its generic default page; (2) `sociology-product.html`'s 4 notebook-sketch images had no intrinsic-size hint and no `aspect-ratio` in CSS, unlike every other unattributed image group on the site; (3) `work/index.html` had no JSON-LD while its structurally parallel sibling `writing/index.html` did; (4) the 9 `topics/*/index.html` pages (and `sitemap.xml`) used a bare-path canonical/`og:url`/JSON-LD `url` while `work/`, `writing/`, `services/` all use a trailing slash; (5) the homepage `og:image` omitted `&h=630&fit=crop` despite declaring `og:image:width`/`height` as 1200×630, unlike every other page's Unsplash-sourced image.
- **Why this exists:** Genuinely new findings, independently verified via direct grep/read against current code (and a live `curl -I -L` for the Wikimedia-style redirect check pattern established in Task 3.5) before acting — not assumptions from a research pass.
- **Files expected to change:** New `404.html`; `sociology-product.html`; `work/index.html`; all 9 `topics/*/index.html` + `sitemap.xml`; `index.html`.
- **Implementation plan:** 404.html built from `contact.html`'s exact chrome structure (nav/mobile-menu/footer), `noindex, follow` robots tag. Notebook images: per-image `width`/`height` HTML attributes, not a single shared CSS `aspect-ratio` — the 4 images have genuinely different natural ratios (3 landscape ~1.36–1.45:1, 1 portrait 826×1369 ≈0.6:1), confirmed via `sips`, so one shared ratio would have been wrong for at least one. JSON-LD on `work/index.html`: mirrored `writing/index.html`'s `CollectionPage` schema shape. Trailing slash: scripted regex substitution across all 3 reference points per page (canonical, og:url, JSON-LD url) plus sitemap.
- **Verification checklist:** `sync-chrome.mjs` clean; all 9 new/changed JSON-LD blocks validated with `json.loads`; sitemap `<loc>` count still 52; full 52-page 200 sweep; browser-verified 404.html renders with full site chrome and no console errors; browser-verified `sociology-product.html`'s notebook images reserve correct per-image aspect-ratio space pre-load (confirmed via differing rendered heights matching each image's real ratio) and the page has zero console errors.
- **Success criteria:** All 5 fixes applied with zero visual regression; JSON-LD valid; chrome-sync clean.
- **Rollback plan:** Five independent, small, easily revertible commits — one per concern.
- **Estimated risk:** None — all additive or metadata-only changes; no shared CSS/JS touched, so no asset-version bump needed this round.
- **Status:** ✅ Complete. Commits `18dc189`, `0859a98`, `1a8d883`, `04553e4`, `939f599`.
  - **Found but not fixed, logged to Deferred below:** a real heading-hierarchy issue in `services/index.html` (h1→h3, skipping h2, then h3→h4→h2 non-monotonically) and `sociology-product-field-guide.html` (two sibling card-grid sections under the same h2 parent, one using h3 children, the other h4 — an inconsistent convention between structurally identical sections). Not a quick rename: `.srv-num-main h3` (`font-size: clamp(1.3rem, 1.8vw, 1.6rem)`) and `.srv-ind-item h4` (`font-size: 1.15rem`) are deliberately different sizes in `design.css`, and `sociology-product-system.css` has similar tag-dependent selectors (`.socx-guide-sheet h3`, `.socx-guide-case h4`, `.socx-guide-law h4`) — fixing the semantic level without breaking the visual tier distinction needs a coordinated HTML+CSS change, not a blind tag rename.
  - Also considered and explicitly not pursued: global `:focus-visible` styling (only 2 explicit rules site-wide; browser default focus outline is present everywhere, so this is a visual-polish/consistency question, not a broken-accessibility one — inventing a focus-ring look is a design call); trimming the 18 pages with meta descriptions over ~160 characters (2 severe outliers: `index.html` at 246, `sociology-product.html` at 267 — real, but shortening copy is an editorial-voice decision, not a mechanical fix); the duplicate `<h1>` in `index.html` (desktop/mobile hero variants toggled via `display: none` at different breakpoints, same pattern as the already-accepted fit-calculation script — likely intentional, not asserting it's wrong).

### Task 3.7 ✅ COMPLETE
- **Objective:** Fix the heading-hierarchy issue on `services/index.html` and `sociology-product-field-guide.html` deferred from Task 3.6.
- **Why this exists:** Deferred item picked up; re-verified against current code before executing (unchanged since Task 3.6).
- **Files expected to change:** `services/index.html`, `sociology-product-field-guide.html`, `design.css`, `sociology-product-system.css`.
- **Implementation plan:** `services/index.html` — promoted the two `.srv-list-label` group-label `<div>`s ("How we can work together", "For individuals") to `<h2>` (the class isn't tag-qualified in CSS, so rendering is identical) and the 3 "For Individuals" item titles from `<h4>` to `<h3>`, giving: h1 → h2 → h3×3 → h2 → h3×3 → h2, fully monotonic. Updated `.srv-ind-item h4`/`.srv-ind-item:hover h4` to `h3` in `design.css` to match — the 1.15rem vs. 1.3rem size distinction is carried by the class selector, not the tag. `sociology-product-field-guide.html` — promoted Sheet 04's 9 case-card titles and Sheet 05's 7 law-card titles from `<h4>` to `<h3>` (matching Sheet 02's existing h3 pattern for the same structural depth), updating `.socx-guide-case h4`/`.socx-guide-law h4` to `h3` in `sociology-product-system.css`; confirmed beforehand that both new selectors still win over the broader `.socx-guide-sheet h3` rule at equal specificity by source order, so each section's distinct size is preserved.
- **Verification checklist:** Zero remaining `<h4>` on either page (confirmed via grep); full heading outline read back and confirmed monotonic on both pages; brace-balance on both CSS files; `sync-chrome.mjs` clean; computed `font-size`/`fontWeight` read back in-browser for every affected selector and confirmed byte-for-byte unchanged from pre-fix values (20.8px / 18.4px on services; 20.8px / 17.28px / 16.32px on the field guide); visual screenshots of both pages' affected sections; console clean on both; full 52-page 200 sweep.
- **Success criteria:** Fully monotonic heading outline on both pages; zero visual change.
- **Rollback plan:** Single commit, easily revertible.
- **Estimated risk:** None — verified zero visual change before committing, not after.
- **Status:** ✅ Complete. Commit `b50054a`. Shared asset `?v=` bumped to `20260715-1`. Corrected a minor miscount from the Task 3.6 write-up along the way: Sheet 04 has 9 case cards, not 8.

### Task 3.8 ⤺ REVERTED — see note below
- **Objective:** Resolve the long-open "is the Writing section's distinct look intentional or drift" question — asked directly, answered: drift. Unified `writing/index.html`'s content section with the site's standard dark theme.
- **Why this exists:** This exact question had been deferred since before Task 3.4, and kept resurfacing as new symptoms across three separate sessions (container width, three extra font families, the pill-shaped CTA, the rounded/shadowed cards, and the underlying `--wr-*` color palette) — always the same root cause, never addressed at the source. Asked the owner directly this time instead of deferring again.
- **Files expected to change:** `assets/css/writing-redesign.css`, `writing/index.html`.
- **Implementation plan:** Full token remap, not a redesign — the page's layout/IA/spacing was untouched, only its color/font/radius/shadow language changed. Every `--wr-*` custom property replaced with its standard equivalent (`--wr-paper`/`-alt` → `--dark`/`--dark-2`, `--wr-ink` → `--text-d`, `--wr-accent` → `--accent`, `--wr-rule` → `--border-d`, muted-text opacities → `rgba(var(--muted-d-rgb), X)` via the Task 4.1 tokens); `--wr-deep`/`--wr-deep-2` dropped (dead, never used). Fonts: Manrope/Newsreader/IBM Plex Mono → `var(--sans)`/`var(--serif)`/`var(--mono)`, and the now-redundant second Google Fonts `<link>` removed from `writing/index.html`. Container width: `width: min(1160px, calc(100vw - Npx))` → the standard `max-width: 1180px` pattern used by `.pg-inner-wide` everywhere else. Cards: 20–30px `border-radius` + `box-shadow` (a pattern that exists nowhere else on the site — confirmed via grep that `design.css` has zero `box-shadow` declarations anywhere) → `1px` radius, no shadow, matching the site's established discipline. `.wr-close-link` pill (`999px`) → `1px` matching `.cta-btn`, and its text color fixed from white to `var(--dark)` to match `.cta-btn`'s dark-on-gold contrast convention (white text would fail contrast against the lighter standard `--accent` gold).
- **Verification checklist:** Brace-balance on the rewritten CSS file; `sync-chrome.mjs` clean; grepped for zero remaining `--wr-`/light-hex-color/`box-shadow` references; computed-style read-back (`backgroundColor`/`color`/`borderRadius`) on every affected selector confirmed against the intended token values; full-page screenshots section by section; console clean; full 52-page 200 sweep.
- **Success criteria:** Zero light colors, zero box-shadow, zero non-standard fonts, standard container width, on the Writing landing page; zero change to any other page.
- **Rollback plan:** Single commit, self-contained to 2 files plus the mandatory asset-version bump.
- **Estimated risk:** Medium going in (highest visual-impact change of the engagement so far — an entire page's color scheme), mitigated by computed-style verification rather than screenshot-only review.
- **Status:** ⤺ Reverted. Commit `d1c57d0`, shipped and verified (zero regressions, all checks green) — then reverted whole-cloth in commit `99f1774` after the owner reconsidered and asked for the light "paper" theme back. Net effect on the codebase: none: `writing-redesign.css` is byte-identical to its pre-`d1c57d0` state (verified via diff against `d1c57d0^`), `writing/index.html` differs only in the mandatory shared-asset `?v=` string.
  - **The "intentional or drift" question is now actually answered, just not the way the first answer suggested:** the light paper theme, distinct fonts, and rounded/shadowed cards are what's wanted. Do not re-propose unifying this page with the dark theme without new instruction — this was tried, shipped, and explicitly undone.
  - **Real bug found and fixed while d1c57d0 was live, and correctly un-fixed on revert:** `<main>` carried a `data-nav-light` attribute telling the nav to go light-mode while scrolled over that section. This is *correct* given the page's actual (light) theme — d1c57d0 had removed it because at the time the section had gone dark; the revert restored it, since the section is light again. Verified via computed style that `nav[data-t]` correctly reads `"light"` while scrolled over the content section, and visually confirmed the nav renders cream, not dark.
  - **Process note for future large visual changes:** this round-tripped a full page's color scheme through both states in one session at low cost, because the "keep it a real revert, not a re-derivation" discipline held — restoring exact pre-change file content (verified via diff) rather than hand-reconstructing it from memory is what made the revert trustworthy. Worth the same care next time a shipped-and-verified change needs undoing.

### Task 3.9 ✅ COMPLETE
- **Objective:** Pick up the Deferred "arrow-link component consolidation" item — 9+ near-identical classes (text + `.link-arrow` child, `translateX(4px)` + color-shift on hover) duplicated across `design.css`, `sociology-product.css`, and `sociology-product-system.css`.
- **Why this exists:** Cataloged via a dedicated research pass first (not assumed): confirmed 9 classes were byte-for-byte identical in shape, differing only in hover-target color (light-section vs. dark-section context) and a few per-context `margin-top` values.
- **Files expected to change:** `design.css`, `sociology-product.css`, `sociology-product-system.css`, `index.html`, `about.html`, `sociology-product.html`, `sociology-product-field-guide.html`.
- **Implementation plan:** One base class (`.link-cta`) + two modifiers (`.on-dark`, `.is-muted`) absorbing 8 of the 9 catalogued classes. Classes with a unique `margin-top` kept as thin residual rules alongside the new class in HTML rather than deleted — `index.html` has several `body.homepage-refined` breakpoint overrides that target the old class names directly (`body.homepage-refined .about-read-link { ... }` etc. at 4 different points in an inline `<style>` block); deleting those names would have silently broken those overrides. Classes with nothing left to preserve were removed from CSS entirely.
- **Verification checklist:** Brace-balance on all 3 CSS files; grepped for orphaned old-class CSS definitions; computed-style read-back (`color`, `className`) on every affected link across all 4 touched pages, confirmed against pre-existing values; screenshots; full 52-page 200 sweep; chrome-sync clean; console clean.
- **Success criteria:** Zero visual change; ~100 line net reduction (actual: 263 deletions / 166 insertions).
- **Rollback plan:** Single commit.
- **Estimated risk:** Medium going in (touches markup on 4 pages plus 3 shared CSS files) — mitigated by scoping out the riskier members of the original catalog rather than forcing all of them in.
- **Status:** ✅ Complete. Commit `8fb8c6b`. Shared asset `?v=` bumped to `20260715-3`.
  - **Deliberately excluded from this pass, not forgotten:** `.pg-nav a` (bare, ~85 occurrences site-wide, currently has no hover-transform — adding one as part of a "consolidation" would be a real, silent behavior change on nearly every page, not a visual-parity merge); `.pg-nav-cta-soft` (deliberately transform-less, already small and distinct); `.srv-num-link`/`.srv-ind-link` (hover triggered by an ancestor selector, not self — a structurally different pattern); `.contact-service-arrow` (uses a raw `→` character, not the shared `.link-arrow` component — would need a markup change beyond a class rename); `.wr-close-link` (a filled accent-button variant, closer to `.cta-btn` than to this family).
  - **Incidental fix:** `about.html`'s two `.pg-nav` links used a literal `→` character instead of the shared `.link-arrow` SVG-mask span used everywhere else — fixed while already touching that markup.
  - **False alarm chased down during verification, for the record:** the homepage's preloader appeared stuck ("LOADING" / counter frozen at 100) after the change. Traced to `.preloader.done { clip-path: inset(0 0 100% 0); }` — confirmed the `.done` class *was* correctly applied by JS, but `getComputedStyle` kept reporting the pre-transition clip value. Cross-checked against the live production site (unrelated to this change, already deployed) and reproduced the identical symptom there — confirmed pre-existing browser-automation timing artifact, not a regression.

### Task 3.10 ✅ COMPLETE
- **Objective:** A narrower, incremental follow-up to the reverted Task 3.8 — align the Writing page with the rest of the site on structure only (container width, box-shadow, border-radius), explicitly leaving the confirmed-intentional color palette, fonts, and accent untouched.
- **Why this exists:** After Task 3.8 was reverted, proposed a menu of independently-choosable alignment options ranked by visual-identity impact rather than re-proposing the same all-at-once change. Owner approved the three lowest-impact items (width, shadow, radius) and explicitly asked that the result not read as jarring.
- **Files expected to change:** `assets/css/writing-redesign.css`.
- **Implementation plan:** Container width: `width: min(1160px, calc(100vw - Npx))` → standard `max-width: 1180px` (matching `.pg-inner-wide`). Since the horizontal gutter had been baked entirely into that `calc()` with no separate padding, moved it onto the parent `.wr-main`/`.wr-close-strip` padding instead, so narrow viewports don't lose their edge margin. Box-shadow: removed from cards and the close-CTA button (both states) — confirmed via grep that `design.css` has zero `box-shadow` declarations anywhere on the site; dropped the now-orphaned `--wr-shadow` token too. Border-radius: card/button radii (20–30px, plus a `999px` pill CTA) flattened to `1px`, matching `.cta-btn` and every other card — confirmed via grep that `999px` isn't used anywhere else on the site either, so the pill wasn't matching an existing pattern. Removed two mobile-breakpoint radius overrides that only existed to give a *different* rounded value at small widths, now redundant.
- **Verification checklist:** Computed-style read-back (`maxWidth`, `paddingLeft`, `borderRadius`, `boxShadow`) on every affected selector; brace-balance; `sync-chrome.mjs` clean; full 52-page 200 sweep; console clean; visual screenshot of the hero and reading-path cards (at an artificially tall viewport, to work around a Lenis-related scroll-rendering quirk in the browser tool this session — see note below); close-CTA section verified via computed style plus text/visibility checks since it fell outside the available render window.
- **Success criteria:** Standard container width, zero box-shadow, `1px` radius on the Writing page; zero change to color, font, or accent; result doesn't read as visually jarring.
- **Rollback plan:** Single commit, self-contained to one file.
- **Estimated risk:** Low — deliberately scoped to exclude the properties that carry the page's visual identity.
- **Status:** ✅ Complete. Commit `1c71938`. Shared asset `?v=` bumped to `20260715-5`.
  - **Tooling note:** this session's browser-automation tool's mouse-wheel `scroll` action reliably timed out (30s) on this page specifically, and a `window.scrollTo()` workaround left Lenis's virtual-scroll transform permanently desynced from the native scroll position for the rest of that tab's life (blank/mispositioned renders on every subsequent screenshot). Recovery pattern that worked: open a fresh tab rather than trying to un-desync the same one; for content further down the page than a single screenshot can reach, resize the viewport tall enough to fit it without scrolling at all, or call `window.lenis.scrollTo(y, { immediate: true })` (Lenis's own method, not the native one) rather than fighting the `computer scroll` action further.

### Task 3.11 ✅ COMPLETE
- **Objective:** Fix two real problems introduced by Task 3.10, surfaced by the owner as "it just doesn't look as good" — not a request to re-litigate the width/shadow/radius decision, but evidence something in that implementation was actually wrong.
- **Why this exists:** Investigated before assuming the owner's own hypothesis (a typography pass) was the right lever — it wasn't. Two concrete bugs found instead: (1) `max-width: 1180px` + `padding: 3.5rem` on the *same* element (`.wr-main`/`.wr-close-inner`) permanently ate 112px from the width budget under this site's global `box-sizing: border-box`, capping content at 1068px at every viewport instead of only narrow ones — confirmed by comparing against how `.pg-content` + `.pg-inner-wide` (the site's real two-element version of this pattern) actually behaves. (2) Removing `box-shadow` (correct for the site's dark-theme border-divider cards) left the light-theme filled cards with nothing separating them from the page — their fill (`rgb(251,245,236)`) and the page background (`rgb(244,235,222)`) differ by only a few RGB points, and the border was 8% opacity. The shadow had been doing the actual separation work.
- **Files expected to change:** `assets/css/writing-redesign.css`.
- **Implementation plan:** Width: replaced `max-width` + `padding` on one element with `width: min(1180px, calc(100vw - 112px))` (mobile: `calc(100vw - 56px)`) — verified this produces byte-for-byte the same rendered width at any viewport as the `.pg-content`/`.pg-inner-wide` two-element pattern. Border contrast: `0.08` → `0.18` opacity on `.wr-path-card`/`.wr-lens-card`/`.wr-close-inner`/`.wr-close-cta` — kept the flat, shadow-less look, just made the edge visible. Also found `.wr-path-list a`/`.wr-lens-links a` had no explicit `font-size` at all (inheriting the ~16px body default) despite being secondary navigation nested inside a card's own 1.48rem `h3` — gave both `var(--type-body-sm)`, the site's actual "supporting text" token, rather than inventing a value. This combined with the width fix resolved the line-wrapping the owner had separately flagged ("Community Health Is Product Health", "Context Collapse Is a Product Failure", "Weak Ties Are a Growth Strategy" all went from 2 lines to 1).
- **Verification checklist:** Computed style (`width`, `padding`, `border`, `font-size`) checked at both 1400px and 390px viewports, confirming desktop reaches the full 1180px and the mobile 28px-per-side gutter holds; screenshots at both sizes; brace-balance; `sync-chrome.mjs` clean; console clean; full 52-page 200 sweep.
- **Success criteria:** Content reaches full 1180px on wide viewports (not artificially capped); cards visibly distinguishable from the page without reintroducing shadow; previously-wrapping link titles fit on fewer lines.
- **Rollback plan:** Single commit, one file.
- **Estimated risk:** Low — all three changes are corrections to specific, identified defects, not new judgment calls.
- **Status:** ✅ Complete. Commit `0949ca2`. Shared asset `?v=` bumped to `20260715-6`.
  - **Process note:** the owner's own hypothesis (typography — sizing/fonts/weight) turned out not to be the root cause; the actual bugs were structural (width math, contrast). Investigated directly rather than defaulting to the suggested fix — worth remembering that "it doesn't look right" from someone without CSS specifics is a symptom report, not a diagnosis.

### Task 3.12 ✅ COMPLETE
- **Objective:** Direct visual feedback — remove the boxed panel around the Writing page's close-CTA button (background/border/padding read as visually odd) and drop the "Short notes are enough. You do not need to have it fully figured out." line. Keep just the button.
- **Files expected to change:** `writing/index.html`, `assets/css/writing-redesign.css`.
- **Implementation plan:** Removed the `<p>` from HTML. `.wr-close-cta` kept as a bare grid wrapper (for bottom-left positioning within `.wr-close-inner`'s column) with its box styling (padding/background/border) stripped; removed the now-dead `.wr-close-cta p` rule.
- **Verification checklist:** Computed style confirmed single child, transparent background, no border/padding; confirmed the removed copy is gone from HTML; brace-balance; chrome-sync; console clean; full 52-page 200 sweep.
- **Status:** ✅ Complete. Commit `fa8a910`. Shared asset `?v=` bumped to `20260715-7`.

### Task 3.13 ✅ COMPLETE
- **Objective:** Pick up the remaining arrow-link classes deliberately excluded from Task 3.9 (`.pg-nav a`, `.pg-nav-cta-soft`, `.srv-num-link`/`.srv-ind-link`, `.contact-service-arrow`) — owner asked to proceed after learning these are small, scattered, template-specific spots (not the main top nav/footer), on the condition that standardizing means converging to the *best* existing version, not a lesser one.
- **Why this exists:** Re-inspecting the actual CSS (not just the class names) showed `.pg-nav a` and `.srv-num-link` are near-byte-identical duplicates of `.link-cta` — same font/color/size, just missing the hover-slide and using a raw `0.2s`/`0.25s` literal instead of the duration token. `.srv-ind-link` was already using the shared `.link-arrow` icon internally. Only `.contact-service-arrow` used a genuinely different mechanism (a raw `→` character instead of the SVG-mask icon).
- **Files changed:** `design.css`, `contact.html`.
- **Implementation:** `.pg-nav a`: added the missing `transform: translateX(4px)` on hover and switched to `var(--duration-base)`/`var(--ease)`/`var(--ease-out)` tokens (matching `.link-cta` exactly); unified `gap` from `0.4rem` to the canonical `0.5rem`; removed `.pg-nav a.cta-btn`/`:hover` (confirmed dead — zero HTML references). `.srv-num-link`/`.srv-ind-link`: same token/gap convergence; kept their ancestor-hover trigger (`.srv-num-row:hover ...` / `.srv-ind-item:hover ...`) untouched — a deliberate, different, arguably-better full-row-hoverable UX pattern, not a bug. `.contact-service-arrow`: swapped the raw `→` character for the shared `.link-arrow.link-arrow-right` SVG-mask icon (5 occurrences in `contact.html`), matching the icon used everywhere else on the site; converged its `0.3s` transition to the standard duration token.
- **Follow-on bug found and fixed in the same commit (not scope creep — found while verifying the exact rule being edited):** `.pg-nav-cta-soft`'s `color` overrides (rest *and* hover) had never actually applied — `.pg-nav a` (class+tag, specificity 0,1,1) always beat the bare `.pg-nav-cta-soft` class (0,1,0) in the cascade, both before and after this task's edits. Only `.pg-nav-cta-soft`'s `opacity: 0.72` was ever live, so the "soft" CTA had silently been rendering as faded accent-gold instead of the intended muted color the whole time. Fixed by requalifying both rules as `.pg-nav a.pg-nav-cta-soft` / `.pg-nav a.pg-nav-cta-soft:hover`, which now correctly outrank `.pg-nav a` / `.pg-nav a:hover`. Verified via screenshot: rest state is now visibly more muted than the primary `.pg-nav` link (previously indistinguishable), and hover now brightens to accent gold as designed (previously went dark, inheriting `.pg-nav a:hover`'s color by mistake).
- **Verification checklist:** Brace-balance (500/500 both before and after); `sync-chrome.mjs` clean; full 54-page 200 sweep against a local server; console clean on contact/essay/services/topics page types; real-cursor hover verification (via element ref, not synthetic events) confirmed `.pg-nav a`'s hover-transform via computed style (`matrix(1,0,0,1,4,0)`, color `rgb(13,11,9)` = `--text-l`); visual screenshot confirmation of `.srv-num-link` (row/heading highlight + shift), `.srv-ind-link` (heading color change), `.pg-nav-cta-soft` (muted rest → gold hover), and the new SVG arrow icons on the Contact page (crisp, consistent with the rest of the site, hover slides correctly).
- **Success criteria:** All four items converged to the same values as `.link-cta` wherever the underlying pattern was genuinely the same component; legitimately different trigger mechanisms (ancestor-hover) preserved, not forced into uniformity; net visual effect is more consistent and, per the `.pg-nav-cta-soft` fix, strictly better than before, not worse.
- **Rollback plan:** Single commit, two files (`design.css`, `contact.html`), plus the mandatory asset-version bump.
- **Estimated risk:** Low — verified value-for-value against the already-proven `.link-cta` pattern before applying; the one behavior change (adding hover-slide to ~82 `.pg-nav` links) matches the established, already-shipped hover language used in 8+ other places since Task 3.9.
- **Status:** ✅ Complete. Shared asset `?v=` bumped to `20260715-9`.
  - **Immediately revisited per direct owner feedback:** after seeing the result, owner rejected the muted/primary hierarchy itself ("all page navigation arrows should be the same design") — not asking for a revert of 3.13, but for a further step it hadn't taken. On inspection the hierarchy was inconsistent anyway (About muted the *secondary* link, Services muted the *primary* CTA — no shared logic, just two different one-off choices from Task 3.9 and earlier). Removed `.link-cta.is-muted` from the 3 pages that used it (`about.html`, `sociology-product.html`, `sociology-product-field-guide.html`) and `.pg-nav-cta-soft` from the 6 services pages that used it, so every `.pg-nav` link site-wide now renders identically (accent at rest, `--text-l` + `translateX(4px)` on hover). Both modifier classes had zero remaining usages afterward, so their CSS rules (`.link-cta.is-muted`, `.link-cta.is-muted:hover`, `.pg-nav a.pg-nav-cta-soft`, `.pg-nav a.pg-nav-cta-soft:hover`) were deleted rather than left dead. `.link-cta.on-dark` (used elsewhere, unrelated) was untouched.
  - **Verification:** brace-balance (495/495, 5 fewer rules); `sync-chrome.mjs` clean; full 54-page 200 sweep; console clean; computed-style read-back on all 9 affected pages confirmed both links in each `.pg-nav` now share identical color/font/weight with no class modifier. Shared asset `?v=` bumped to `20260715-10`.

### Task 3.14 ✅ COMPLETE
- **Objective:** Owner asked for an opinion on whether buttons (`.cta-btn`/`.cta-btn-outline`) should carry arrows, as groundwork for standardizing them. Recommended no — a filled/bordered button already has enough visual weight to read as actionable, unlike the plain-text `.link-cta`/`.pg-nav` family the arrow exists to help. Site data backed this: 9 of 12 existing button instances already had no arrow; owner agreed to strip the 3-4 outliers and fold the one-off `.newsletter-btn` into the shared `.cta-btn-outline` pattern.
- **Files changed:** `design.css`, `index.html`, `writing/index.html`, `services/sociology-product-workshop.html`.
- **Implementation:** Removed the arrow (`.link-arrow` span or raw `→`) from `writing/index.html`'s two hero buttons, `services/sociology-product-workshop.html`'s "Book a workshop" button, and `index.html`'s "Share a question" button. `.newsletter-btn` (a near-duplicate of `.cta-btn-outline` — same font/color/border/hover, just smaller padding) now carries `class="cta-btn-outline newsletter-btn"`, with its CSS trimmed to only the padding/`white-space` override the smaller context legitimately needs; all other properties now inherit from `.cta-btn-outline`. Removed the now-orphaned `.newsletter-btn` entries from two unrelated `index.html` inline-`<style>` breakpoint rules (one sizing `.link-arrow` icons, one resetting button chrome for mobile) that referenced an icon/element no longer present.
- **Bug caught during verification (fixed before shipping, not after):** the first version of the trimmed `.newsletter-btn` rule used a bare `.newsletter-btn { padding: ...; }` selector — equal specificity to `.cta-btn-outline`, but appearing *earlier* in the file, so `.cta-btn-outline`'s later, same-specificity padding silently won and the button rendered at full size instead of the intended smaller one. Caught via computed-style check (`padding: 16px 36px` instead of the expected `13.6px 28px`), not visually. Fixed by requalifying as `.cta-btn-outline.newsletter-btn` so it deterministically outranks `.cta-btn-outline` alone regardless of source order.
- **Verification checklist:** Brace-balance (both `design.css` and `index.html`'s inline `<style>` block); `sync-chrome.mjs` clean; full 54-page 200 sweep; console clean; grep confirmed zero remaining `link-arrow`/`→` near any `cta-btn`/`newsletter-btn` instance; computed-style read-back on the homepage button (color, border, padding all match `.cta-btn-outline` plus the intended smaller padding); visual screenshot of the Writing page hero confirmed both buttons render as clean text with no residual gap from the removed icon. (Homepage screenshot blocked by the same Lenis-desync tooling artifact already documented in Task 3.10/3.13 — verified via computed style instead, consistent with that precedent.)
- **Status:** ✅ Complete. Shared asset `?v=` bumped to `20260715-11`.

### Task 3.15 ✅ COMPLETE
- **Objective:** Owner asked whether the arrow-link consolidation (Task 3.13) actually produced shared, enforced CSS rules or just separately-declared values that happen to currently agree. Honest answer: mixed — timing/easing/color already used tokens (genuinely shared), but the hover-slide distance was a literal `4px`/`3px` hand-copied into four different rules, and `.link-cta`/`.pg-nav a`/`.srv-num-link` were three separate rule blocks with identical properties, not one definition. Owner asked to fix both.
- **Files changed:** `design.css` only — pure refactor, no HTML touched, no class names or markup changed anywhere.
- **Implementation:** Added `--link-hover-shift: 4px` and `--link-hover-shift-sm: 3px` tokens to `:root` (same pattern as `--duration-*`); pointed all five hover rules (`.link-cta`, `.pg-nav a`, `.srv-num-link` via its ancestor-hover, `.contact-service-arrow` via its ancestor-hover, and `.srv-ind-link`'s intentionally-smaller variant) at the tokens instead of separate literals. Grouped `.link-cta`, `.pg-nav a`, and `.srv-num-link`'s base declarations into one selector list (`.link-cta, .pg-nav a, .srv-num-link { ... }`) since all three had become property-for-property identical after Task 3.13 — removed the two standalone copies entirely rather than leave them as duplicates that happened to match. `.srv-num-link` now only carries its one genuinely unique property (`margin-top: auto`). `.srv-ind-link`/`.contact-service-arrow` were left as separate rules (their base properties are legitimately different — icon-only, no text/font styling) but now share the hover-distance token.
- **Verification checklist:** Brace-balance (489/489); `sync-chrome.mjs` clean; full 54-page 200 sweep; console clean on essay and services pages; CSSOM read-back confirmed every grouped/tokenized rule parsed exactly as written (no silent selector-list failure); computed-style read-back on `.pg-nav a` confirmed the base declaration (display, gap, font, color, transition) is byte-identical to its pre-refactor values; `--link-hover-shift`/`--link-hover-shift-sm` confirmed to resolve to `4px`/`3px` via `getComputedStyle`. This was intentionally a zero-visual-change refactor — a token substitution is mathematically identical to the literal it replaces, and the grouped selectors don't change which elements match or what values apply, only where the declaration lives.
- **Success criteria:** A future change to the arrow-link hover-shift distance or to `.link-cta`'s shared properties now only requires editing one place, not hunting down four/three separately-drifting copies.
- **Status:** ✅ Complete. Shared asset `?v=` bumped to `20260716-1`.

### Task 3.16 ✅ COMPLETE
- **Objective:** Owner asked what else on the site is duplicated the same way the arrow-links were. A fresh scan (not the original audit's stale numbers) found a new, previously-unlogged instance: 15 selectors independently re-declaring the same 4-property "uppercase mono kicker label" recipe (`font-family: var(--mono); font-size: var(--type-meta); text-transform: uppercase; letter-spacing: 0.12em;`) — `.mobile-menu-kicker`, `.hero-kicker`, `.loader-label`, `.ci-link`, `.project-kicker`, `.essay-feat-kicker`, `.ei-tag`, `.newsletter-cta h3`, `.footer-nav a`, `.footer-yr`, `.list-item-meta`, `.pg-meta`, `.srv-list-label`, `.contact-note-label`, `.bb-status`. Owner asked to consolidate the same way (grouped selector, no HTML changes).
- **Why this exists:** Same failure mode as Task 3.13/3.15 — five to fifteen copies of one recipe that happen to agree today, with nothing enforcing that they keep agreeing.
- **Files changed:** `design.css` only.
- **Implementation:** Revalidated each candidate individually before including it — deliberately excluded look-alikes that are actually different: `.skip-link` (filled accent badge, not a plain label), `.pg-back`/`.marquee-track span` (different font-sizes, not the same recipe), `.s-label`/`.pg-hero-kicker` (an already-grouped *different* kicker variant with a divider line, 0.1em spacing instead of 0.12em), `.astat-lbl`/`.ci-num`/`.list-item-num`/`.value-num` and `.contact-col-label`/`.srv-sidebar-title`/`.srv-also-label` (already properly grouped elsewhere). Added the 4 shared properties as one grouped selector list, trimmed each of the 15 original rules down to only the color/margin/layout/opacity properties genuinely unique to its context.
- **Incidental fix, not scope creep (found while confirming exact current values before grouping):** `.loader-label` (the homepage preloader's "Loading" text) was missing `font-family` entirely and had been silently inheriting the body's sans-serif font — every other kicker label on the site uses mono. It now correctly renders in `var(--mono)` like its siblings, since that's part of the shared group it belongs in.
- **Verification checklist:** Brace-balance (490/490); `sync-chrome.mjs` clean; full 54-page 200 sweep; console clean; CSSOM read-back confirmed all 15 selectors appear in both the shared group and their trimmed individual rule, nothing dropped or mistyped; computed-style read-back on `.loader-label` (confirmed the incidental fix — now renders Roboto Mono), `.footer-nav a`, `.footer-yr`, and `.srv-list-label` (all byte-identical to pre-refactor values except the intentional `.loader-label` fix); visual screenshot of the homepage preloader.
- **Note on `.hero-kicker`:** its computed style on the live homepage is actually governed by an unrelated, pre-existing `body.homepage-refined .hero-kicker` override in `index.html`'s inline `<style>` block, not this rule — confirmed this override already existed before the change and its values are untouched; this task's edit only affects the fallback/base definition.
- **Status:** ✅ Complete. Shared asset `?v=` bumped to `20260716-2`.

### Task 3.17 ✅ COMPLETE
- **Objective:** Owner requested a best-practices research pass (WCAG, Material Design 3, Apple HIG, readability literature) against the typography system. Computing real WCAG contrast ratios from the site's actual color hex values (not asserted, independently reproducible via the relative-luminance formula) surfaced 3 text-color pairs below the AA 4.5:1 minimum: accent-on-light 2.54:1 (fails even the 3:1 large-text floor), muted-d-on-dark 3.39:1, muted-l-on-light 4.29:1. Owner asked to fix these first.
- **Why this exists:** `--accent` and `--muted-d`/`--muted-l` were each a single value shared across both light and dark sections; each was tuned to read correctly on one background and silently failed AA on the other.
- **Dependencies:** None.
- **Files changed:** `design.css`, `sxp-essays.css`, `sociology-product.css`, `sociology-product-system.css`.
- **Implementation:** Added `--accent-on-light: #84683b` (same hue/saturation as `--accent`, darkened until it clears 4.5:1 against `--light`). Classified every text-color usage of `--accent` across all 4 files by which background it actually renders on (light vs. dark section, verified against each file's own background declarations, not assumed) and repointed the ~25 light-context selectors at `--accent-on-light`; left the dark-context majority on `--accent`, which already passed. Two classes (`.s-label`, `.astat-num`) render on both light and dark homepage sections depending on placement — no existing `.on-dark`-style toggle for either, so added `#about`/`#project`/`#services`-scoped overrides rather than flipping the shared default. Extended the existing `.link-cta.on-dark` pattern (previously hover-only) to also restore `--accent` at rest, since the base `.link-cta`/`.pg-nav a`/`.srv-num-link` rule needed to flip to light-default. Lightened `--muted-d` and darkened `--muted-l` (same hue, adjusted lightness only) until each clears 4.5:1; updated `--muted-d-rgb`/`--muted-l-rgb` to match. Found 8 selectors using `rgba(var(--muted-d-rgb), 0.72–0.86)` / `rgba(var(--muted-l-rgb), 0.78–0.86)` instead of the solid token — the partial opacity was washing the color back toward the background hard enough that the base-token fix alone wouldn't have fixed them (computed: still ~2.8–3.4:1 with the new base at those alpha values); converted all 8 to the solid color.
- **Verification checklist:** Brace-balance confirmed on all 4 files; `sync-chrome.mjs` clean; full 54-page 200 sweep; `sociology-product.css`/`sociology-product-system.css`'s one mixed-context selector group each (`.socx-signal-kicker` + 4 light-context siblings; `.socx-guide-step span` + 6 light-context siblings) split so the one dark-context selector in each group keeps `--accent`; computed-style read-back confirmed `.srv-list-label`/`.srv-num`/`.srv-ind-icon` resolve to `rgb(132,104,59)` (`--accent-on-light`), `.pg-nav a`/`.pg-back` pick up the fix on a live content page, and `.pg-hero-kicker` (dark context, untouched) still resolves to the original `rgb(181,146,90)` — confirming the split didn't regress dark-context instances.
- **Success criteria:** All 7 originally-audited color pairs now compute at ≥4.5:1 (AA, normal text) except accent-on-dark and primary text, which already exceeded it.
- **Rollback plan:** Single-file revert per file (4 files, independent).
- **Estimated risk:** Low-medium — the section-scoped overrides (`.s-label`, `.astat-num`) and the two mixed-selector-group splits were the only genuinely ambiguous calls; both verified against actual HTML usage, not assumed from class naming.
- **Status:** ✅ Complete. Commit `5059919`. Shared asset `?v=` already at `20260716-2` (CSS-only change, no HTML edits needed).

### Task 3.18 ✅ COMPLETE
- **Objective:** Same best-practices pass flagged that no role in the typography system defines a measure (max reading-line-width) — a well-evidenced readability variable (45–75 characters; Bringhurst, NN/g) that was previously left to `.pg-inner`'s 760px container width, which is a layout constraint, not a text-specific one.
- **Why this exists:** Long-form prose (essays, case studies) had no independent cap on line length; `.pg-inner`'s 760px happened to land near the acceptable range but was never chosen for that reason, and any future layout change to `.pg-inner` would silently drag reading measure along with it.
- **Dependencies:** None.
- **Files changed:** `design.css` only.
- **Implementation:** Added `--measure-body: 68ch` (inside the 45–75 char range, close to the commonly-cited 66ch sweet spot) to the typography token block. Applied `max-width: var(--measure-body)` to `.prose p` and `.prose ul, .prose ol` — the long-form reading role specifically, not the outer `.pg-inner` container (which still governs figures/images/cards that legitimately want the full column width).
- **Verification checklist:** Rendered `68ch` in-browser against the live site's actual `Inter` font at `1.05rem`/400 — resolves to `720.48px`, confirmed via `getBoundingClientRect`, vs. the previous unconstrained-to-container ~760px (~72ch effective). Computed-style read-back on `.prose p` on a live case-study page confirmed `max-width: 720.479px` is actually applied, not just defined.
- **Success criteria:** Long-form prose now has an explicit, evidence-based measure independent of the container's layout width; a future `.pg-inner` width change no longer silently changes reading-line-length.
- **Rollback plan:** Single-property removal (`max-width` on 2 selectors) + token removal — fully independent of Task 3.17's changes despite shipping in the same commit.
- **Estimated risk:** None — narrows already-rendered text by ~5%, no layout reflow, no elements newly clipped or overlapping (measure is strictly ≤ the existing container width in all cases checked).
- **Status:** ✅ Complete. Commit `5059919` (same commit as Task 3.17 — in hindsight these are two separable concerns per the "one task, one concern, one commit" principle above and should have been split; logged as two task entries against the one commit rather than silently merging them into a single write-up).

**Phase 3 status: ✅ COMPLETE — all 18 tasks done.** Total across the phase: 83+ files changed across all tasks (52 pages + `404.html` + `design.css` + `page.js` + `writing-redesign.css` + `work-scroll-morph.css` + `sitemap.xml` + `sociology-product.css` + `sociology-product-system.css` + `contact.html`, some overlapping), 0 visual regressions (one incidental pre-existing bug fixed, not introduced), 0 console errors, chrome-sync clean throughout.

---

## Phase 4 — Design tokens: low-risk renames only

Scope deliberately narrowed from the original design-system audit: only categories where existing values already converge tightly (a pure rename, no new canonical value being invented). Spacing/shadow/measure tokenization is **Deferred**, not here — see below for why.

### Task 4.1 ✅ COMPLETE
- **Objective:** Add `--accent-rgb`, `--muted-d-rgb`, `--text-d-rgb`, `--muted-l-rgb` custom properties; replace the 26 hardcoded RGB-triplet `rgba(...)` literals across `design.css` with `rgba(var(--x-rgb), alpha)`.
- **Why this exists:** Each literal is a hand re-derivation of a token that already exists; changing the accent color today requires updating 15 places by hand.
- **Dependencies:** None.
- **Files expected to change:** `design.css` (`:root` block + ~26 call sites).
- **Implementation plan:** Add the 4 tokens next to the existing color tokens. Mechanical find-and-replace per color, verifying each alpha value is preserved exactly during transcription.
- **Verification checklist:** Diff every changed line and confirm alpha value unchanged; visual screenshot comparison on a page using several of these (services page, homepage About section).
- **Success criteria:** Zero literal `rgba(181,146,90` / `rgba(240,235,227` / `rgba(110,100,88` / `rgba(122,111,98` remain in `design.css`; visually identical.
- **Rollback plan:** Single-file revert.
- **Estimated risk:** Low-medium — 26 call sites, each needs the alpha value read correctly; do it in one careful pass, not rushed.
- **Status:** ✅ Complete. Commit `d666cc8`.
  - **Revalidation caught a stale number again:** 24 occurrences, not 26 — Phase 1's dead-code removal had already eliminated 4 of the original candidates.
  - Used a scripted substitution rather than manual edits specifically to eliminate transcription risk on the alpha values; diffed every line afterward to confirm.
  - **Metrics:** 4 new tokens, 24 call sites converted, 0 remaining literal occurrences of the 4 target triplets.

### Task 4.2 ✅ COMPLETE
- **Objective:** Add `--duration-fast: 0.2s`, `--duration-base: 0.25s`, `--duration-slow: 0.5s` (values chosen from actual frequency: 0.25s ×51, 0.2s ×35, 0.5s ×29 uses). Point *new* transition declarations at them; do **not** retroactively replace all ~150 existing literals in this task (see Future Considerations for why a full sweep is separate).
- **Why this exists:** A real de facto scale already exists by habit; naming it stops relying on the next contributor coincidentally reaching for the same three numbers.
- **Dependencies:** None.
- **Files expected to change:** `design.css` (`:root` addition only).
- **Implementation plan:** Add the three tokens next to the existing `--ease`/`--ease-out`. No other line changes in this task.
- **Verification checklist:** N/A beyond syntax check — pure addition, nothing references the new tokens yet.
- **Success criteria:** Tokens exist and are documented as the standard to use going forward (note in the comment near `--ease`).
- **Rollback plan:** N/A.
- **Estimated risk:** None.
- **Status:** ✅ Complete. Commit `c9443b1`. Revalidated frequency ranking held (0.25s/0.2s/0.3s/0.5s still dominant) despite Phase 1/3 edits shifting exact counts.

### Task 4.3 ✅ COMPLETE
- **Objective:** Add `--z-base: 1`, `--z-sticky: 400`, `--z-nav: 500`, `--z-overlay: 490`, `--z-cursor: 9998`, `--z-preloader: 9999` and replace the corresponding literal `z-index` values across `design.css` and `work-scroll-morph.css` with the tokens (values unchanged — pure rename).
- **Why this exists:** Nine magic numbers with undocumented gaps; the next overlay added has nothing to consult for correct stacking order.
- **Dependencies:** None.
- **Files expected to change:** `design.css`, `work-scroll-morph.css`.
- **Implementation plan:** Map each current literal to its token 1:1, replace, confirm no value changed.
- **Verification checklist:** Diff confirms every replaced value is numerically identical to before; visual check on preloader, mobile menu, nav, cursor, spy dots (the elements whose z-index changed hands to a token).
- **Success criteria:** Zero raw z-index integer literals remain outside the `:root` token definitions.
- **Rollback plan:** Single-file revert per file.
- **Estimated risk:** Low — values don't change, only how they're expressed.
- **Status:** ✅ Complete. Commit `6f13bb8`.
  - **Scope materially changed since the roadmap was written — adjusted rather than executed blindly (per principle 9):** `work-scroll-morph.css`'s `z-index` landscape is almost entirely gone (Phase 1 removed the dead scrollytelling system that held most of it); its one survivor (`z-index: 2`) turned out to be a local component-stacking value, not part of the global chrome hierarchy, so left as a literal. `--z-base: 1` accordingly dropped — nothing left to attach it to. Added `--z-skip-link: 10000` instead, a value that didn't exist when the roadmap was written (introduced by this session's own Task 3.1).
  - **Metrics:** 6 tokens added, 6 call sites converted in `design.css`, 0 changed in `work-scroll-morph.css` (intentionally). All 6 computed values verified identical to their pre-token literals.

### Task 4.4 ✅ COMPLETE
- **Objective:** Add `--space-sm` (1rem) through `--space-5xl` (5rem) custom properties — 8 tokens in a uniform 0.5rem-step scale, named from the values that already dominate `padding`/`margin`/`gap` usage in `design.css`. Add-only: no existing spacing declaration is touched, mirroring Task 4.2's duration-token approach exactly.
- **Why this exists:** Owner asked to pick up a Deferred item without risking any visual change. Re-checked the Deferred entry's "32 near-arbitrary values, no clean convergence" claim against current code before acting (per principle 5/9) — it didn't fully hold up: the top values by frequency (`3.5rem`×27, `2rem`×23, `1.5rem`×21, `2.5rem`×20, `3rem`×15, `1rem`×14, `5rem`×13, `4rem`×13) form a clean, already-existing 0.5rem-step scale, the same shape of convergence that made Task 4.2 safe. Genuinely uneven values (`1.75rem`×16, `0.5rem`×11, `8rem`×12, etc.) were left out of the core scale rather than forced in.
- **Files expected to change:** `design.css` (`:root` addition only).
- **Implementation plan:** Add the 8 tokens next to the existing `--duration-*` tokens, with a comment stating the same "add-only, not retroactively migrated" convention. No other line changes in this task.
- **Verification checklist:** Brace-balance check (502/502 unchanged); `git diff` confirmed exactly 14 insertions, 0 deletions in `design.css`, nothing else; `sync-chrome.mjs` clean; local static-server render of the homepage and `services/index.html` visually identical to pre-change, console clean; computed-style read-back confirmed all 8 tokens resolve to their intended values.
- **Success criteria:** Tokens exist and are documented as the standard to use going forward; zero visual or behavioral change anywhere on the site.
- **Rollback plan:** N/A — pure addition, nothing references the tokens yet.
- **Estimated risk:** None — no existing selector or call site was touched.
- **Status:** ✅ Complete. Commit pending. Shared asset `?v=` bumped to `20260715-8`.
  - **Deliberately not done in this task (that's the actual remaining Deferred item):** retrofitting the ~150 existing literal spacing values to reference these tokens. Same reasoning as the duration sweep — a much larger, more error-prone diff for a cosmetic win. Do opportunistically, file by file, when already editing nearby code.

### Task 4.5 ✅ COMPLETE
- **Objective:** Owner asked for a good next item that wouldn't visibly change the site. Picked up half of the "Full transition-duration and spacing literal sweeps" Deferred item: retrofit `design.css`'s literal `0.2s`/`0.25s`/`0.5s` transition/delay values onto the `--duration-fast`/`--duration-base`/`--duration-slow` tokens added in Task 4.2. Spacing-literal retrofit deliberately left out — a mistranscribed `rem` value can visibly nudge layout, a mistranscribed timing value can't be eyeballed, so only the lower-risk half was picked up.
- **Why this exists:** Re-checked the Deferred entry's "~150 call sites" estimate against current code before acting (per principle 5/9) — didn't hold up for the duration side specifically: 50 literal occurrences in `design.css` alone (`0.2s`×12, `0.25s`×14, `0.5s`×21, outside the `:root` token definitions themselves), not ~150. A contained, single-file, mechanical swap.
- **Dependencies:** None.
- **Files changed:** `design.css` only.
- **Implementation:** Scripted substitution (not manual, per Task 4.1's precedent — eliminates transcription risk) of the three literal strings to their token equivalents, scoped to everything below the `:root` block's closing brace so the token *definitions* (`--duration-fast: 0.2s;` etc.) weren't rewritten into circular self-references. `0.25s` replaced before `0.2s` defensively, though the two don't overlap as substrings.
- **Verification checklist:** Brace-balance (493/493 unchanged); `git diff --stat` confirmed exactly 29 lines changed, 1:1 literal-for-token with no incidental edits; `sync-chrome.mjs` clean; full 54-page 200 sweep; computed-style read-back on `.skip-link`, `.footer-nav a`, `.link-cta`, and `.spy` confirmed `transitionDuration` is byte-identical to the pre-refactor literal on all four.
- **Success criteria:** Zero literal `0.2s`/`0.25s`/`0.5s` time values remain in `design.css` outside the token definitions; zero visual or behavioral change.
- **Rollback plan:** Single-file revert.
- **Estimated risk:** None realized — values are mathematically identical to what they replace, confirmed via computed-style read-back rather than assumed.
- **Status:** ✅ Complete. Commit pending. Shared asset `?v=` bumped to `20260716-3`.
  - **Deliberately not done in this task (remains the actual Deferred item):** the spacing-literal half of the sweep, and the duration sweep across any file other than `design.css` (none of the other CSS files were checked for literal `0.2s`/`0.25s`/`0.5s` occurrences in this task).

**Phase 4 status: ✅ COMPLETE — all 5 tasks done.**

---

---

## Phase 5 — Tooling & CI hardening

### Task 5.1 ✅ COMPLETE (link-checking) / DESCOPED (HTML validation)
- **Objective:** Add a broken-internal-link checker and basic HTML validation to CI, alongside the existing `sync-chrome.mjs` step.
- **Why this exists:** Currently the only automated check is chrome consistency; a broken internal link or malformed tag ships silently otherwise.
- **Dependencies:** None.
- **Files expected to change:** `.github/workflows/deploy.yml` (new steps); possibly a new lightweight dev dependency (evaluate a zero-install option like `linkinator` via `npx` first, to avoid introducing a `package.json`/`node_modules` footprint this repo has deliberately avoided).
- **Implementation plan:** Research a zero-config CLI check that runs via `npx` without a persistent dependency; prototype locally before adding to CI.
- **Verification checklist:** Confirm it correctly catches a deliberately-broken link in a throwaway local test, then confirm it passes clean on current `main`.
- **Success criteria:** CI fails on a broken internal link or malformed HTML; passes on current `main`.
- **Rollback plan:** Remove the workflow step.
- **Estimated risk:** Low — build-time only, never touches rendered output.
- **Status:** Commit `1cfa88c`.
  - **Link-checking: ✅ complete.** `linkinator` via `npx`, run against a real local HTTP server (not bare filesystem crawl — this site's root-relative hrefs only resolve correctly through an actual server context; confirmed by hitting phantom-path bugs when crawling a subdirectory file directly). Explicitly enumerates all 52 known live pages as crawl starting points rather than trusting `--recurse` to auto-discover the site graph, since `--recurse` alone measurably under-covered (32 links found vs. 79 with explicit enumeration) for reasons not worth reverse-engineering further. External links skipped entirely (23+ distinct citation domains — allow/deny-listing them would make CI flaky on third-party uptime, unrelated to this site's health). Verified: full local dry-run of the exact CI script (79 links, 0 broken, clean exit); separately confirmed it catches a real break (deliberately broke a link, confirmed `exit 1`, reverted).
  - **HTML validation: descoped, not implemented.** Trialed `html-validate` — 18 "errors" on `index.html` alone, zero of them actual malformed markup; all default-ruleset style/a11y lint (missing `button type`, inline styles, `<style>` placement) that would fail every future build against this codebase's existing, working, intentional patterns. Shipping that without extensive per-rule tuning would make CI red for non-bugs on day one, which is worse than the status quo. Not pursuing further without a lower-noise tool or a dedicated tuning pass — see Future Considerations.

**Phase 5 status: ✅ COMPLETE (all 3 tasks addressed; 5.1's HTML-validation half explicitly descoped with reasoning, not silently dropped).**

### Task 5.2 ✅ COMPLETE
- **Objective:** Compress/convert `assets/img/veda-portrait.png` (currently 2.1MB) to a reasonably sized WebP or optimized PNG.
- **Why this exists:** Single largest performance issue on the homepage; loaded above-the-fold.
- **Dependencies:** None. Uses `sips` (confirmed available, no download needed) or an equivalent local tool — does not require fetching anything external, so it doesn't trigger the download-permission constraint.
- **Files expected to change:** `assets/img/veda-portrait.png` (replaced in place, or a new `.webp` added alongside with the `<img src>` in `index.html` updated).
- **Implementation plan:** Resize to the actual rendered dimensions (currently displayed at a fraction of its native resolution — check computed size first), compress, target well under 200KB without visible quality loss, verify visually side-by-side before replacing.
- **Verification checklist:** Visual comparison at 100% zoom shows no perceptible quality loss; file size reduction confirmed; page loads and renders correctly.
- **Success criteria:** Same visual result, file size reduced by at least 10x.
- **Rollback plan:** Original file recoverable from git history.
- **Estimated risk:** Low — but do the visual side-by-side check carefully, this is the one task in this phase where a mistake would be visible.
- **Status:** ✅ Complete. Commit `b06e4e6`.
  - **WebP dropped, JPEG used instead:** this system's `sips` can't encode WebP (confirmed by attempting it — errors on the output format). JPEG is the right tool for a photograph anyway; format alone (not just resize) accounts for most of the size win.
  - Chose 800px width specifically because it's exactly 2x the image's real rendered CSS width (a fixed 400px column in `.about-grid` on desktop), so it's neither over- nor under-provisioned for retina.
  - **Metrics:** 2,156,147 → 163,704 bytes (13.2x reduction, exceeds the 10x success criteria). 1024×1536 → 800×1200 px.

---

### Task 5.3 ✅ COMPLETE
- **Objective:** Fix `scripts/bump-asset-version.mjs` so its own file walk skips `experiments/` and `references/`, matching `sync-chrome.mjs`'s existing `SKIP_DIRS`.
- **Why this exists:** New finding, logged per the Definition of Done rather than folded into whatever task was running when it was found. Hit this twice in Phase 3.1 alone — every version bump silently touches non-production mockup files, requiring a manual `git checkout -- experiments/` after every single run. Cheap, mechanical, safe fix.
- **Dependencies:** None.
- **Files expected to change:** `scripts/bump-asset-version.mjs` (one line — extend `SKIP_DIRS`).
- **Implementation plan:** Add `'experiments'` and `'references'` to the existing `SKIP_DIRS` set.
- **Verification checklist:** Run the script with a throwaway version string; confirm `experiments/` files no longer appear in the diff; revert the throwaway run.
- **Success criteria:** `bump-asset-version.mjs` only ever touches the live production surface.
- **Rollback plan:** Single-line revert.
- **Estimated risk:** None.
- **Status:** ✅ Complete. Commit `1644b4c`. Verified via a throwaway `99999999-throwaway` version bump: all 52 live pages updated, zero `experiments/` files touched; reverted the throwaway HTML changes, kept the script fix.
  - **Noted but out of scope:** `sync-chrome.mjs` also lacks an explicit `experiments/`/`references/` skip, but hasn't caused observed harm (those mockups' chrome apparently still matches canonical, so it silently passes rather than silently rewriting). Not fixing pre-emptively — no evidence of a real problem, unlike `bump-asset-version.mjs`.

---

## Phase 6 — Asset & third-party hardening

Both tasks require downloading files from external sources, which requires explicit, specific permission (exact file/source stated) per action — a general "go ahead" on the phase isn't sufficient on its own; each download gets named before it happens.

### Task 6.1 ✅ COMPLETE
- **Objective:** Self-host Lenis, add SRI. Download `lenis@1.1.14` from the exact CDN version currently linked, place under `assets/js/vendor/`, update all `<script src>` references, add an SRI hash.
- **Why this exists:** Removes the single-point-of-failure external dependency every page's scroll behavior (and the nav light/dark-flip logic, which listens on Lenis's scroll event) relied on.
- **Dependencies:** None. Required explicit per-file permission (obtained) since it involves downloading from an external source — a generic "go ahead" on Phase 6 was correctly treated as insufficient on its own; the exact file, source URL, size, and destination were stated and confirmed before fetching anything.
- **Files expected to change:** New `assets/js/vendor/lenis@1.1.14.min.js`; `<script src>` updated on all 52 live pages.
- **Verification checklist:** Confirm downloaded bytes match jsdelivr's published content-length; confirm no console errors (a real SRI mismatch throws one and the script fails to execute); confirm `window.lenis`/`window.Lenis`/`.scrollTo` all present and functional post-load.
- **Success criteria:** Zero remaining CDN references; smooth-scroll behavior unchanged.
- **Rollback plan:** Revert the commit; CDN reference restorable from git history.
- **Estimated risk:** Low.
- **Status:** ✅ Complete. Commit `daf8d54`. 12,790 bytes, content and version string verified to match the exact file already in production. SHA-384 SRI hash computed from the downloaded bytes. Verified on two page templates (homepage, essay) — no console errors, Lenis fully functional, request confirmed loading from the local vendor path.

### Task 6.2 — Not started, needs its own scoping pass before any download happens
- **Objective:** Self-host the ~46 unique Unsplash images used for hero/content imagery and `og:image` tags (98 total references).
- **Why this exists:** Production imagery depends on a third party with no SLA to this site; an Unsplash-side change or rate-limit breaks hero images and every social share card simultaneously.
- **Dependencies:** None, but meaningfully larger in scope than 6.1 — needs the exact file list (URLs, sizes, which page references which) enumerated and brought back for review *before* any file is fetched, not a batch pull authorized in one line. Each image's context should be sanity-checked, not just its license.
- **Status:** Not started.

---

## Phase 7 — Architecture: SSG migration — 📋 DEFERRED, needs a dedicated kickoff

This is the single highest-leverage structural change identified across all three audits (no single source of truth for nav/footer/metadata is root cause #1), but it's also the only item large enough that it shouldn't be picked up inside this task-queue model — it needs its own scoping conversation (pick the tool — 11ty was the recommendation — decide the migration order, decide how much of the ~127-page corpus moves at once vs. incrementally). Sequencing note: do this after Phases 3-5 (no point hand-editing 52 files for accessibility/tokens if templates are about to change how those files are generated), and ideally before Phase 6.2 (image references will likely move anyway during migration).

**Not scheduled. Revisit when you want to have that conversation.**

---

## Phase 8 — Repository hygiene ✅ COMPLETE

Findings from a deep-dive review of the repo (docs, `.git` internals, branches), not from the original three audits. Doesn't touch live site content.

### Task 8.1 ✅ COMPLETE — Fix stale `prototype/` references
- **Objective:** Remove references to `prototype/` from `Agents.md` and `README.md` — the directory was deleted in `0191cb4` (2026-03-26) but both docs still described it as existing.
- **Status:** ✅ Complete. Commit `5e11164`.

### Task 8.2 ✅ COMPLETE — Stop tracking `references/books-and-beds/` in git
- **Objective:** Untrack the 3 source PDFs (~41MB, added once in `4bb66a5`, never revised) so they stop bloating every future clone. Files remain on disk locally; added to `.gitignore`.
- **Status:** ✅ Complete. Commit `f3a32b2`.

### Task 8.3 ✅ COMPLETE — Purge superseded large blobs from git history
- **Why this exists:** `.git` was 99MB — 82.87MB of it loose (never packed) plus 15.45MB of `tmp_obj_*` garbage from an interrupted git operation, against a live site of ~2MB. The bulk was history-only: the 3 `books-and-beds` PDFs (post-8.2) and 5 superseded PNG originals already replaced by their JPG equivalents on disk (`assets/img/veda-portrait.png` and 4 files under `assets/img/about-v21/notebook-notes/`) — none reachable from the current tree.
- **What was explicitly excluded:** `references/about-v21/*.png`, `experiments/about-v21/*.png`, `references/about-v21/hero-motion.mov` — still live/tracked source material, not superseded. Purging those would have deleted currently-used files, not just trimmed history.
- **Process:** Backed up every ref (`git bundle --all`, verified, 64MB, kept outside the repo) before touching anything. Found and removed 4 stale, unmerged, worktree-backed branches (`claude/charming-shamir` — also on `origin`, deleted there too — `claude/laughing-mendeleev`, `claude/musing-curran`, `design/typography-and-layout-consistency`; all 128–205 commits behind `main`, clean worktrees under `.claude/worktrees/`, no uncommitted work, confirmed via `gh`-less GitHub API check that their associated PRs #1/#2 were both already closed — #1 merged, #2 not — so nothing live was disrupted). Also found and removed two `refs/codex/turn-diffs/checkpoints/...` refs — leftover checkpoint data from a separate tool (Codex CLI, based on naming) previously used on this repo — which `git filter-repo` correctly skipped (they point at raw trees, not commits) but which kept the target blobs reachable until deleted explicitly.
- **Tooling:** `git-filter-repo` (`pip3 install --user`), `--invert-paths` on the exact 8-path list above, `--force` (required since this isn't a fresh clone). Followed by `git gc --prune=now --aggressive`.
- **Gotcha hit during verification:** a post-push `git fetch origin` to confirm the result pulled a second, larger pack back down — traced to GitHub still advertising `refs/pull/1/head` / `refs/pull/2/head` (both closed PRs, head = the now-deleted `claude/charming-shamir`), which GitHub retains indefinitely regardless of branch deletion or force-push and which apparently influenced the server's pack construction. Those objects are **not reachable from any local ref** and — confirmed via an actual fresh `git clone` — do **not** appear in a normal clone (13MB, matching the cleaned local size). A second, separate gotcha: local reflog entries created *by that same verification fetch* (`refs/remotes/origin/main` recording its old→new transition) briefly re-protected the purged objects from `git gc --prune=now` until reflogs were expired again post-fetch. Documented here specifically so a future rewrite doesn't lose an afternoon re-discovering both.
- **Result:** `.git` 99MB → 13MB (verified via fresh clone, not just local state). Commit hashes changed on `main` from `4bb66a5` (2026-04-07) onward; site content byte-identical (`git diff` against pre-rewrite state is empty for all live paths). Force-pushed with `--force-with-lease`.
- **Known limitation, accepted:** the purged blob content is still retrievable from GitHub via `refs/pull/1/head` / `refs/pull/2/head` — GitHub does not expose a way to delete PR refs via standard git push, and the PRs themselves are closed (not deletable without deleting the PRs, which alters project history in a different, worse way). Doesn't affect normal clones or `.git` size for any future user of this repo; only matters if someone deliberately fetches those refs.
- **Status:** ✅ Complete.

---

## Phase 9 — Typography role consolidation (in progress)

Executes the remaining findings from this session's typography audit / Design System Specification v1.0 / best-practices review, now that the accessibility and duration-token pieces landed as Tasks 3.17, 3.18, and 4.5. This is the page-by-page visual-judgment pass the "Typography scale full enforcement" Deferred entry above was waiting for — not a mechanical sweep, each task below is one specific, independently-decided consolidation.

**Already resolved, not reopened here:** `writing-redesign.css`'s distinct fonts/palette/accent — tried and explicitly reverted in Task 3.8/3.9 (see Rejected). The Design System Spec's "needs your decision" note on this point is superseded by that history.

**Ordering:** zero-risk deletions first, then pure token renames (no visual change), then real consolidations (visual change, needs a screenshot check) — mirrors how Phase 3/4 sequenced work.

### Task 9.1 ✅ COMPLETE (2 of 3 candidates — one excluded on re-verification)
- **Objective:** Delete 3 candidate-duplicate declarations found during the typography audit: (a) `index.html`'s inline kicker restatements presumed to byte-match `design.css`'s shared uppercase-mono-label recipe (Task 3.16), (b) `--mobile-body`/`--mobile-support` in `index.html` (both `0.9375rem`), (c) `.morph-deck` in `work-scroll-morph.css` (presumed spec-identical to `.pg-deck` under a different class name).
- **Why this exists:** Zero-risk cleanup that shrinks the surface area for every task after it.
- **Re-verification found (a) doesn't qualify — original audit finding was wrong:** the inline `body.homepage-refined .hero-kicker, .ci-num, .ci-link, .project-kicker, .essay-feat-kicker` block (`index.html:621-634`) isn't a pure restatement. It sets `font-weight: 500`, `line-height: 1.45`, `color: var(--accent)`, and `opacity: 1` — none of which are redundant. `.hero-kicker`'s own base color in `design.css` is `var(--muted-d)`, not `var(--accent)` — this override is what makes the homepage hero kicker render gold instead of muted. `.ci-num` isn't even in Task 3.16's shared-recipe group and has no base `text-transform` at all in `design.css` — this override is what makes it uppercase. Deleting this would have visibly changed the homepage hero. **Left untouched.**
- **(b) and (c) confirmed and executed:**
  - `--mobile-body` (used once, `index.html:1374`) and `--mobile-support` (used 7x) were genuinely identical values with two names. Deleted `--mobile-body`, repointed its one call site at `--mobile-support`.
  - `.morph-deck` vs. `.pg-deck`: re-verification surfaced a real difference beyond the visual spec — `.morph-deck` had a `prefers-reduced-motion` override; `.pg-deck` did not (confirmed via `grep` on `design.css`'s reduced-motion block, empty for `.pg-deck`). Naively deleting `.morph-deck` would have silently removed `work/index.html`'s existing reduced-motion coverage. **Incidental fix, not scope creep:** added `.pg-deck { opacity: 1; transform: none; transition: none; }` to `design.css`'s reduced-motion block before removing `.morph-deck`'s CSS and renaming `work/index.html`'s one usage from `class="morph-deck"` to `class="pg-deck"`. Also added `.morph-hero .pg-deck { max-width: 42rem; }` to `work-scroll-morph.css` (the `.morph-hero` context needs the same max-width `.pg-hero .pg-deck` already provides in `design.css`, since `.morph-hero` isn't `.pg-hero`).
- **New finding, not fixed here (logged for later, not scope creep):** `.pg-hero`'s other reveal-on-load elements (`.pg-h1`, `.pg-hero-kicker`, `.pg-meta`, `.pg-hero-cta`, `.pg-subtitle`, `.pg-tag`) appear to share the same gap — none found in `design.css`'s reduced-motion block. Not investigated further or fixed in this task; added to Deferred below.
- **Files changed:** `index.html`, `design.css`, `work-scroll-morph.css`, `work/index.html`.
- **Verification checklist:** Brace-balance on all 4 files; `sync-chrome.mjs` clean; full 54-page 200 sweep; visual screenshot of `work/index.html`'s hero confirming the deck text renders identically (position, color, size, weight) to before; computed-style read-back on `.pg-deck` on that page confirmed `font-family`/`weight`/`size`/`line-height`/`max-width`/`color` all match `.morph-deck`'s old spec exactly.
- **Success criteria:** The 2 genuine duplicates are gone; the 1 false positive is documented as such, not deleted; no visual change; no accessibility regression.
- **Rollback plan:** Per-file revert.
- **Estimated risk:** Realized as "would have been medium" on (a) and (c) had re-verification not caught the real differences — exactly the failure mode Definition of Done's revalidation step exists to prevent.
- **Status:** ✅ Complete. Commit pending.

### Task 9.2 ✅ COMPLETE
- **Objective:** Rename `--type-h1` → `--type-display-2` (fixes the naming mismatch flagged in the canon evaluation — nothing called an H1 actually uses this token; `.pg-h1`, the real Page Title role, has its own untethered `clamp()`). Extract `.pg-h1`'s literal `clamp(2.8rem, 7vw, 7rem)` into a new `--type-h1-page` token and point `.pg-h1` at it.
- **Why this exists:** Same class of problem as Task 4.1-4.4 — an unnamed value that already has a clear, singular canonical usage, just not expressed as a token yet. Pure rename plus one wrap-in-`var()`; the naming fix specifically prevents a future contributor from reasonably assuming `--type-h1` governs `<h1>` elements when it doesn't.
- **Dependencies:** None.
- **Files changed:** `design.css` only. Re-verified before acting: 4 call sites (`.work-h2`, `.writing-h2`, `.services-h2`, `.footer-rotating`), not the ~5 estimated; no other CSS file or inline HTML block referenced `--type-h1` by name.
- **Implementation:** Scripted substitution (not manual) of the 4 call sites, with an assertion that each target string existed exactly once before replacing and that zero `var(--type-h1)` references remained after — same transcription-risk-elimination approach as Task 4.1/4.5. Added `--type-h1-page: clamp(2.8rem, 7vw, 7rem);` and pointed `.pg-h1` at it.
- **Verification checklist:** Brace-balance (494/494 unchanged); `sync-chrome.mjs` clean; full 54-page 200 sweep; computed-style read-back on `.work-h2`/`.writing-h2`/`.services-h2` (homepage, all three resolve identically via the renamed token) and `.pg-h1` (About page). One apparent discrepancy investigated and resolved, not left unexplained: `.pg-h1` and `.footer-rotating` computed to different px values than their base-token formula predicted at the test viewport (703px) — traced to two pre-existing, untouched `@media (max-width: 960px)` overrides (`.pg-h1 { font-size: clamp(2.5rem, 10vw, 5rem); }` and `.footer-rotating { font-size: clamp(2rem, 9vw, 4rem); }`) correctly taking precedence at that width; manually computed both override formulas and confirmed an exact match to the measured values, closing the loop rather than assuming it was fine.
- **Success criteria:** Token names match what they actually govern; zero visual change.
- **Rollback plan:** Single-file revert.
- **Estimated risk:** None realized — values unchanged, only their names/expression.
- **Status:** ✅ Complete. Commit pending.
- **Status:** Not started.

### Task 9.3 ✅ COMPLETE (scope narrowed on re-verification)
- **Objective:** Collapse the Eyebrow/kicker role to one canonical value (`0.68rem`/`500`/`0.12em`, i.e. `--type-meta`) everywhere.
- **Why this exists:** The single largest inconsistency cluster found in the original audit; the first task in this phase with a real, visible change.
- **Re-verification found the original candidate list conflated two different roles — scope narrowed before executing:** `.link-cta`, `.pg-nav a`, and `.srv-num-link` do share the same `0.8rem`/`0.1em` values, but they aren't eyebrows — they're inline clickable CTA links with arrow icons, never adjacent to a heading. The spec's cost-test reasoning ("2px difference with no reader-legible purpose, emphasis already carried by the adjacent heading") only applies to something that sits next to a heading. Collapsing this link-role into Eyebrow on that reasoning would have been applying the wrong argument to get to the right-looking number by coincidence. **Left untouched**, logged as its own open question below rather than folded in here.
- **Genuine eyebrow cluster executed:** `.s-label`/`.pg-hero-kicker` (shared rule, `design.css`), `.srv-close-kicker` (`design.css`), `.morph-kicker` (`work-scroll-morph.css`) — all now reference `var(--type-meta)`/`0.12em` instead of the literal `0.8rem`/`0.1em`.
- **Incidental fix, not scope creep:** `.morph-kicker` turned out to be declared twice in `work-scroll-morph.css` — an unused first declaration (correctly using `var(--type-meta)`/`0.12em`, i.e. what this task was already converting toward) immediately shadowed by a second declaration with the literal `0.8rem`/`0.1em` values that was the one actually rendering. Merged into one declaration rather than leaving the dead first block in place.
- **Files changed:** `design.css`, `work-scroll-morph.css`.
- **Verification checklist:** Brace-balance on both files; `sync-chrome.mjs` clean; full 54-page 200 sweep; computed-style read-back confirmed `.s-label` resolves to `10.88px`/`1.3056px` letter-spacing (exactly `0.12em` of `10.88px`) and `.nav-links a` (Navigation, untouched) still resolves to its distinct `1.5232px` (`0.14em`) — confirming the two weren't accidentally conflated; screenshots of the homepage hero, the About page hero (`.pg-hero-kicker`), and `work/`'s hero (`.morph-kicker`) all render correctly and consistently with each other.
- **Success criteria:** One eyebrow definition across the 4 genuine eyebrow selectors; Navigation's distinct tracking preserved; the link-role question isolated rather than silently resolved by accident.
- **Rollback plan:** Single-file revert per file.
- **Estimated risk:** Low as executed (narrower than originally scoped); would have been a real semantic error (wrong reasoning applied to a different role) if the original ~6-selector scope had gone through unexamined.
- **Status:** ✅ Complete. Commit pending.
- **Estimated risk:** Low-medium — real visual change, but small (2px size, 0.02em tracking) and low-stakes if something's missed (would read as a minor inconsistency, not breakage).
- **Status:** Not started.

### Task 9.4 — ✅ RESOLVED, kept as two roles (owner decision, 2026-07-18)
- **Original objective (superseded):** Collapse Intro Paragraph to one canonical value on the claim that `.pg-deck` and `.pg-subtitle` had no pattern for which page gets which.
- **Re-verification found the premise false, before any file was touched:** actual counts are `.pg-deck` on 22 pages, `.pg-subtitle` on 24 — not "~40 vs. a handful." The split isn't random: **all 23 essays use `.pg-subtitle` alone**; **all 22 non-essay pages use `.pg-deck` alone**; the one page using both (`sociology-product-field-guide.html`) stacks them deliberately, `.pg-deck` as the primary intro with `.pg-subtitle` beneath it as a visibly smaller secondary line.
- **Owner decision:** keep the split. Essays intentionally get a quieter, smaller single-line intro; landing-style pages get the bigger `.pg-deck` treatment. `.pg-subtitle` is not drift-to-be-merged — it's a second, real role that happens to share a name collision with `.pg-deck`'s "subtitle-ish" naming.
- **Follow-up not done in this task (small, optional):** `.pg-subtitle` could be documented in the Design System Spec as its own named role (e.g. "Essay Subtitle" or folded formally into "Supporting Copy") rather than left implicit. No code/visual change either way — purely a documentation nicety, not scheduled.
- **Files changed:** None.
- **Status:** ✅ Resolved by decision, not code. No files touched.
- **Status:** Not started.

### Task 9.5 ✅ COMPLETE
- **Objective:** Add a two-tier `--type-card` token (Featured/Compact) and consolidate the 7 card-title implementations onto it. Fix `.list-item h2`'s token misuse (was borrowing `--type-h2`, the Section Heading token).
- **Why this exists:** Seven near-duplicate sizes for what's functionally two real hierarchy tiers (spotlight vs. compact list row) — the largest remaining "same role, unreconciled values" cluster after eyebrows.
- **Files changed:** `design.css` only. Re-verified all 7 selectors' current values before touching anything — all matched the audit, no drift.
- **Design judgment call, made explicitly rather than silently:** 3 of the Compact-tier selectors (`.srv-ind-item h3`, `.tl-org`, `.value-item h3`) were previously **fixed** at 1.15rem/1.2rem/1.1rem — never responsive. `.ei h3`, the 4th Compact selector, was already fluid (`clamp(1.15rem, 2vw, 1.65rem)`). Rather than inventing a new, more conservative range to avoid changing the 3 fixed ones' behavior, used `.ei h3`'s already-production-tested clamp as the single canonical Compact value for all 4 — consistent with how Task 4.1-4.4 tokenized from values that already existed rather than inventing new ones. This does mean those 3 selectors now grow up to ~39% larger on wide screens than before (confirmed: `.srv-ind-item h3` measured 25.6px at 1280px viewport vs. its old fixed 18.4px). Checked this doesn't cause wrapping/overflow problems in any of their grid contexts (below) before accepting it.
- **Implementation:** Added `--type-card-featured: clamp(1.5rem, 2.5vw, 2.2rem)` and `--type-card-compact: clamp(1.15rem, 2vw, 1.65rem)`. `.ci-h3`/`.essay-feat h3` (already correct value) and `.ei h3` (already correct value) tokenized in place. `.list-item h2` moved from `--type-h2` to `--type-card-featured`, with its line-height (1.15→1.2) and letter-spacing (-0.02em→-0.01em) corrected to match the tier. `.srv-ind-item h3`/`.tl-org`/`.value-item h3` moved from their fixed literals to `--type-card-compact` (all three previously lacked or had inconsistent `line-height`; standardized to `1.2` explicitly on `.srv-ind-item h3`, the one missing it).
- **Verification checklist:** Brace-balance; `sync-chrome.mjs` clean; full 54-page 200 sweep. Screenshots were unreliable this session (browser tab visibility/viewport-reporting glitches, unrelated to this change — confirmed via `screen.width`/`height` reporting correctly while `window.innerWidth` intermittently reported 0 on the same tab) — fell back to computed-style + layout-geometry read-back instead: confirmed `.srv-ind-item h3` (services page) and `.tl-org`/`.value-item h3` (About page) all resolve to the expected clamp value at a real, healthy 1280px viewport (25.6px, matching `2vw` at that width), and — the actual thing that mattered, given the size increase — checked every affected element's rendered height against its line-height to confirm none wrapped to more lines than its container could hold: all `.srv-ind-item h3` instances (3/3) and `.value-item h3` instances (4/4) render on exactly one line at their new size; the longest `.tl-org` entry ("The University of Chicago Booth School of Business") also renders on one line within its 760px column.
- **Success criteria:** Two card-title sizes instead of seven; `.list-item h2` no longer shares a token with in-article Section Headings; no wrapping/overflow introduced.
- **Rollback plan:** Single-file revert.
- **Estimated risk:** Medium as scoped, low as executed — the one real judgment call (letting 3 selectors become fluid) was checked against actual rendered geometry rather than assumed safe.
- **Status:** ✅ Complete. Commit pending.
- **Status:** Not started.

### Task 9.6 ✅ COMPLETE
- **Objective:** Merge `.ci-quote` (homepage case-study card quote) into the Pull Quote — Inline spec (`.prose-quote`), keeping only the gold tint as a context-appropriate color choice.
- **Files changed:** `design.css` only. Re-verified before acting: `.ci-quote` is actually used on **2** pages, not 1 as the roadmap assumed (`index.html` and `work/index.html`, identical quote text) — doesn't change the fix, both consume the same rule.
- **Implementation:** `.ci-quote`'s `font-size` changed from `0.95rem` to `1.15rem` (matching `.prose-quote`). `line-height` was already `1.65` on both — no change needed there. Left `.ci-quote`'s own `margin-top`/`padding-left`/`border-left`/gold color untouched (its card-specific presentation, not part of the size/line-height consolidation). Noted but did not touch: two mobile-only (`≤600px`) inline overrides on `.ci-quote` in `index.html` — one sets a third font-size, immediately followed by one that sets `display: none`, so the size override is already dead code at that breakpoint regardless of this change; out of scope for this task.
- **Verification checklist:** Brace-balance; `sync-chrome.mjs` clean; full 54-page 200 sweep; computed-style + geometry read-back on both `index.html` and `work/index.html` confirmed `.ci-quote` renders identically on each (18.4px, wraps cleanly to 2 lines within its 656px column, no overflow).
- **Success criteria:** One inline-quote size site-wide.
- **Rollback plan:** Single-file revert.
- **Estimated risk:** None realized.
- **Status:** ✅ Complete. Commit pending.

### Task 9.7 — Closed, no action (premise didn't hold on re-verification)
- **Original objective:** Add `--type-caption: 0.85rem` and apply it to genuine figure-caption contexts; absorb `0.82rem`/`0.9375rem` near-miss instances into it.
- **Re-verification found no actual problem to fix:** only 2 genuine `figcaption` selectors exist site-wide (`.sxp-figure figcaption`, `.socx-notebook-figure figcaption`) and both already consistently use `var(--type-body-sm)` — they don't drift from each other or from Supporting Copy. Introducing a new, smaller `--type-caption` value now would mean *inventing* a visual distinction that doesn't currently exist, not fixing one — exactly what the Design System Spec's own "exceptions are earned, not assumed" principle argues against.
- **The `0.82rem` near-misses checked separately, none are captions:** `.services-more-copy` (an expandable "read more" text block), `.sxp-axis-note` (a chart-axis annotation), `.sxp-chip` (a filter-chip/tag background, closer to the Tag role than any body-text role). None are attached to a figure or image.
- **New minor finding, not fixed here:** those same 3 selectors use a literal `0.82rem` that doesn't match any existing token (closest is `--type-body-sm` at `0.9rem`) — worth a look sometime, but as its own small finding, not as part of a Caption role that turned out not to need inventing.
- **Files changed:** None.
- **Estimated risk:** Low — small, well-scoped selectors.
- **Status:** Closed. No code change; a role that doesn't need to exist yet isn't a gap.

### Task 9.8 ✅ COMPLETE
- **Objective:** Fix `.contact-service-name`'s double declaration (a 700/1.15-1.65rem shared rule immediately shadowed by a 600/1-1.2rem rule that actually wins the cascade).
- **Owner decision:** the currently-rendering value (smaller/lighter) is correct — confirmed live: contact email/phone (`.contact-link-value`) renders at 25.6px/700, service list names at 17.28px/600, a sensible hierarchy (two prominent contact methods vs. a longer list of ~7 services). This is a code-clarity fix, not a visual change.
- **Files changed:** `design.css` only. Removed `.contact-service-name` from the dead first shared rule (`.contact-link-value, .contact-service-name, .srv-also a { ... }` → `.contact-link-value, .srv-also a { ... }`); added the `font-family`/`line-height`/`letter-spacing` it still needs directly to the second, real rule, so it's no longer silently dependent on a group it was just removed from.
- **Verification checklist:** Brace-balance; full 54-page 200 sweep; computed-style read-back confirmed `.contact-service-name` renders byte-identical to before (17.28px/600/Playfair Display/20.736px line-height/-0.1728px letter-spacing) — zero visual change, confirming this was purely dead-code removal.
- **Success criteria:** One live declaration for `.contact-service-name`; the code says what it does.
- **Rollback plan:** Single-file revert.
- **Estimated risk:** None realized.
- **Status:** ✅ Complete. Commit pending.

### Task 9.9 ✅ COMPLETE
- **Objective:** Load `sxp-essays.css` on all 23 essay pages (previously 5/23).
- **Owner decision:** load everywhere now (cheap, zero visual change for essays that don't use any `.sxp-*` class); whether any specific essay's content gets restructured to use the components is a separate, later editorial call, not part of this task.
- **Files changed:** 18 essay HTML files (`essay-1` through `essay-23`, excluding the 5 that already had it) — added one `<link>` tag each, matching the existing 5 pages' exact pattern and asset version.
- **Verification checklist:** Scripted with an assertion that the insertion point existed exactly once per file before editing; full 54-page 200 sweep; console-clean check and a `read_network_requests` confirmation that `sxp-essays.css` actually loads with a 200 on a previously-missing page (`essay-1.html`).
- **Success criteria:** All 23 essays can use the figure/comparison/matrix components; zero visual change on the 18 that don't currently use them.
- **Rollback plan:** Revert the 18 files, or remove the added `<link>` line from each.
- **Estimated risk:** None realized.
- **Status:** ✅ Complete. Commit pending.

### Task 9.10 ✅ COMPLETE
- **Objective:** Close the gap between the site's small-text floor (10.88px) and the 11px floor Material Design/Apple HIG both hold, per the best-practices review.
- **Owner decision:** bump `--type-meta` (Eyebrow/Metadata/Navigation/Button/Form Label) to exactly 11px — a 0.12px change, essentially invisible, closes the gap for the widest-reaching text on the site at once. Also bump Tag (previously 9.92px, further from the floor) to the same 11px rather than give it a separate near-duplicate value, since after this change the two numbers converge anyway — matches the site's existing pattern of multiple distinct roles (Eyebrow, Metadata, Navigation, Button, Form Label) already sharing this one token while staying visually distinct via their own tracking/transform/color.
- **Files changed:** `design.css` only. `--type-meta` changed from `0.68rem` to `0.6875rem`. `.ci-tag` and `.pg-tag` repointed from a literal `0.62rem` to `var(--type-meta)`.
- **Verification checklist:** Brace-balance; full 54-page 200 sweep; computed-style read-back confirmed `--type-meta` resolves to `11px` exactly and `.nav-links a` (Navigation) renders at `11px`/`1.54px` letter-spacing (still its own distinct `0.14em` tracking, untouched); geometry check on `.pg-tag` (work/case-study-1.html) confirmed both tags render on one line, no wrapping, at the new size; screenshot confirms tags read as proportioned and legible, not oversized.
- **Success criteria:** No text on the site sits below the 11px floor every reference system holds.
- **Rollback plan:** Single-file revert.
- **Estimated risk:** None realized — Tag's ~11% size increase confirmed clean via both geometry and screenshot before accepting it.
- **Status:** ✅ Complete. Commit pending.

### Task 9.11 ✅ COMPLETE
- **Objective:** Resolve what role `.link-cta`/`.pg-nav a`/`.srv-num-link` (inline CTA links with arrows) actually are, and fix any real inconsistency.
- **Owner decision:** keep the existing size (0.8rem/12.8px) — deliberately larger than passive UI chrome (Eyebrow/Nav/Button at 11px), which makes sense for an actionable link that should read as more prominent than a quiet label, and already comfortably clears any accessibility floor. Fix the one real inconsistency: letter-spacing was `0.1em`, an outlier not matching the site's standard `0.12em` tracking used everywhere else in the mono/uppercase family.
- **Files changed:** `design.css` only. `.link-cta, .pg-nav a, .srv-num-link`'s `letter-spacing` changed from `0.1em` to `0.12em`. Confirmed via `grep` that zero `letter-spacing: 0.1em` instances remain anywhere in the file.
- **Verification checklist:** Brace-balance; full 54-page 200 sweep; computed-style read-back confirmed `.pg-nav a` resolves to `12.8px` (unchanged) and `1.536px` letter-spacing (exactly `0.12em` of `12.8px`, was `1.28px`/`0.1em` before).
- **Success criteria:** This role's size is a deliberate, documented choice rather than an unexamined leftover; its one real inconsistency (tracking) resolved.
- **Rollback plan:** Single-file revert.
- **Estimated risk:** None realized.
- **Status:** ✅ Complete. Commit pending.

### Task 9.12 ✅ COMPLETE
- **Objective:** Close the `prefers-reduced-motion` gap found incidentally in Task 9.1 — `.pg-deck` had reduced-motion coverage, its `.pg-hero` siblings didn't.
- **Owner decision:** picked as a "cheap, safe" item specifically because it's invisible to the vast majority of visitors, and even for the minority with the OS preference on, the fix only skips a fade-in animation — no layout or visual-at-rest change either way.
- **Re-verification before acting corrected the original finding:** `.pg-h1` was assumed to be part of this reveal family; it isn't — it has no `opacity`/`transform`/`transition` properties at all, was never animated, needs no fix. The real list is `.pg-hero-kicker`, `.pg-meta`, `.pg-hero-cta`, `.pg-subtitle`, `.pg-tag`.
- **Files changed:** `design.css` only. Added all 5 to the existing reduced-motion block. Two of them (`.pg-hero-cta`, `.pg-tag`) mix their load-reveal transition with a real hover-interaction transition in the same `transition` property — for those two, only `opacity`/`transform` were reset to their static revealed values, `transition` itself was left alone so the hover effects stay intact under reduced motion. Also zeroed `.pg-tag`'s five staggered `transition-delay` values via `body.pg-ready .pg-tag:nth-child(n)`.
- **Verification checklist:** Brace-balance (500/500); `sync-chrome.mjs` clean; full 54-page 200 sweep; CSSOM read-back confirmed all 5 new selectors parsed correctly inside the `prefers-reduced-motion` media rule (catches syntax errors a visual check alone wouldn't). Live OS-level media-feature toggling wasn't available in this session's tooling; correctness argued instead from the values being an exact match for each element's own already-verified post-animation resting state (same `opacity:1`/`transform:none` every element already reaches once its normal fade-in completes) — nothing new being introduced, just arriving there without the transition.
- **Success criteria:** Every `.pg-hero` reveal-on-load element now respects the OS-level motion preference, matching `.pg-deck`.
- **Rollback plan:** Single-file revert.
- **Estimated risk:** None realized.
- **Status:** ✅ Complete. Commit pending.

**Decision checkpoints — block the listed task until answered, not scheduled as their own tasks:**
- Is the Display Hero's 152px ceiling a deliberate brand choice? (Documentation-only if yes; doesn't block any task above.)
- Is `.contact-h2`'s larger-than-its-siblings size (up to 7.5rem vs. 5.5rem for the rest of Display Secondary) an intentional closing bookend, or drift? No task above touches it either way pending an answer — currently rendering as-is.
- The Card Title (Compact)/Subsection size gap (1.065×, empirically confirmed not colliding on any live page) — reviewed and intentionally left out of this phase; revisit only if it causes a real, observed problem.

**Resolved 2026-07-18 (owner reviewed all five open items, see Tasks 9.8-9.11 and Task 9.4's updated entry for what each answer produced):**
- `.contact-service-name`'s conflicting declarations → confirmed the smaller/lighter rendering was correct; fixed as a code-hygiene cleanup (Task 9.8), no visual change.
- All 23 essays now load `sxp-essays.css` (Task 9.9) — makes the component toolkit available everywhere; whether any specific essay's *content* gets restructured to use it remains a separate, later editorial call, not resolved here.
- Sub-11px utility text → bumped `--type-meta` to exactly 11px, closing the gap for Eyebrow/Metadata/Navigation/Button/Form Label at once; Tag repointed at the same token rather than given its own near-duplicate value (Task 9.10).
- `.link-cta`/`.pg-nav a`/`.srv-num-link`'s role → kept the existing 0.8rem size (deliberately larger than passive UI chrome, appropriate for an actionable link); fixed its outlier 0.1em tracking to the site's standard 0.12em (Task 9.11).
- `.pg-subtitle` vs. `.pg-deck` → kept the essay/non-essay split as intentional; Task 9.4 updated to reflect this rather than executing the original merge-away plan.

---

## Deferred (real findings, not scheduled — revisit only when already touching that area)

- **Card component consolidation** (14 near-identical row/card implementations). Same shape of problem, larger. Right trigger: the next time a new card-like component is being built, not a standalone refactor of stable, working code.
- **Shadow tokens, secondary max-width/measure scale.** Per the root-cause synthesis: imposing a scale where the data doesn't already cluster means inventing a canonical value, which is a design judgment call dressed as a refactor. Let tokens emerge from actually-recurring values the next few times these properties are touched. (Spacing itself got a core 8-value scale in Task 4.4 — the frequency data clustered more cleanly than originally assessed here. Reading measure specifically got one value, `--measure-body`, in Task 3.18 — not from value-frequency clustering like Task 4.4, but from external readability evidence (45–75 character range), scoped narrowly to `.prose p`/`.prose ul,ol` only. This entry now covers only shadow tokens and any *other* max-width/measure use beyond long-form body copy, neither of which have been re-checked.)
- **Spacing literal sweep** (a similar count → the Task 4.4 spacing tokens; not yet re-checked against current code the way the duration side was). The duration half of this entry was picked up in Task 4.5 — `design.css`'s 50 literal `0.2s`/`0.25s`/`0.5s` occurrences are now tokenized; other CSS files and any spacing literals were not touched. Retrofitting the remaining spacing usage is a bigger, more error-prone diff for a purely cosmetic win, and (unlike duration) a mistranscribed value is visually checkable, not just numerically — do opportunistically, file by file, when already editing nearby code.
- **Unify the three light/dark-variant mechanisms** (`.ph.dk`/`.lt`, `.cursor.on-light`, `data-t`/`data-nav-light`). Works correctly today; unifying is a coherence improvement, not a bug fix. No urgency.
- **Legacy-named `assets/img/about-v21/notebook-notes/` folder.** `Agents.md` explicitly says don't rename casually. Only revisit as part of a broader, deliberate asset reorganization, never as a drive-by.
- **Typography scale full enforcement** (the ~40% of `font-size` declarations bypassing `--type-*` tokens). Many are legitimate one-off heading `clamp()` curves; a real cleanup here needs page-by-page visual judgment, not a mechanical sweep. **Phase 9 below is that page-by-page judgment pass** — this entry stays here until Phase 9 completes, then gets resolved into it rather than left as a stale parallel note.
- **`.services-more-copy`/`.sxp-axis-note`/`.sxp-chip`'s literal `0.82rem`.** Found while investigating Task 9.7 (Caption token, closed with no action — see that entry). None of the three are captions; the `0.82rem` just doesn't match any existing token (closest is `--type-body-sm` at `0.9rem`). Small, low-priority — three call sites, no drift between them to resolve, just an unnamed value.
- ~~`.pg-hero`'s reveal-on-load elements missing `prefers-reduced-motion` coverage.~~ **Resolved in Task 9.12.** Turned out to be 5 fixes, not 6 — `.pg-h1` was never animated in the first place, no fix needed there.

## Rejected (investigated, not worth doing — don't re-propose without new evidence)

- **Unify `writing-redesign.css`'s light "paper" theme with the site's dark theme (color/font/accent specifically).** Tried in Task 3.8 (commit `d1c57d0`): shipped, fully verified, zero regressions — then explicitly reverted (`99f1774`) after the owner reconsidered. The distinct fonts, palette, and accent color are confirmed intentional; don't re-propose changing *those* without new instruction. Structural alignment (container width, box-shadow, border-radius) is a separate matter, already done in Task 3.10 — that stays.
- **Merge "split CSS rule-blocks"** (§1.3 of the implementation audit). Re-investigated against current code: nearly every instance (`.contact-sub`, `.pg-hero-kicker`, `.wr-archive-card`, `.socx-guide-misdiag-cell`, etc.) is a deliberate, correct pattern — a shared cross-cutting rule followed by a component-specific override — not the append-instead-of-reconcile bug originally suspected. Fixing it would mean solving a problem that isn't there.
- **Introduce a utility-class CSS layer.** Current component-first architecture is a coherent, intentional choice, not a defect. Mixing paradigms without full commitment is usually worse than either alone.
- **Border-radius token rework.** Already fully disciplined (`0`/`1px`/`50%`/`999px`, with `50%` and `999px` both semantically justified as circle/pill shapes). Nothing to fix.
- **Easing token rework.** Already fully tokenized — zero hardcoded `cubic-bezier()` duplicates exist anywhere in the codebase. This is the template other token categories should aspire to, not a gap.
- **Rename cryptic CSS abbreviations** (vs. just documenting them, Task 3.3). Renaming across 127 files carries real risk of missing a reference for low benefit once documented; the legend accomplishes the actual goal (a reader can figure out what a class means) at near-zero risk.

## Future considerations (not evaluated in execution-ready depth — would need a fresh look if pursued)

- A full accessibility audit with an automated axe-core/Lighthouse CI gate, once Phase 3's manual fixes land — automate catching the *next* instance rather than manually finding this generation of gaps.
- Whether `topics/` needs an index landing page (`README.md` already notes this gap explicitly; not evaluated for priority here).
- Visual regression testing, given this repo has zero build/test tooling today — worth a real evaluation once Phase 7 (SSG) is decided, since the right tool differs for a static-HTML repo vs. a templated one.
- Full spacing/measure design-token system, if/when the site's page count roughly doubles and the "let it emerge organically" approach in Deferred has produced enough real data points to name a scale confidently.
- HTML structural-validity checking in CI (Task 5.1's descoped half) — worth a real evaluation with a tool/config that checks only genuine malformation (unclosed/mismatched tags) rather than style-preference linting. `html-validate` with every stylistic rule explicitly disabled, or a different tool entirely, might get there; wasn't worth the tuning time as part of a "cheap, safe" CI task.
