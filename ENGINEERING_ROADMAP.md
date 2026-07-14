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

**Phase 3 status: ✅ COMPLETE — all 3 tasks done.** Total across the phase: 57 files changed (52 pages + `design.css` + `page.js`, some overlapping across tasks), 0 visual regressions, 0 console errors, chrome-sync clean throughout.

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

**Phase 4 status: ✅ COMPLETE — all 3 tasks done.**

---

---

## Phase 5 — Tooling & CI hardening

### Task 5.1
- **Objective:** Add a broken-internal-link checker and basic HTML validation to CI, alongside the existing `sync-chrome.mjs` step.
- **Why this exists:** Currently the only automated check is chrome consistency; a broken internal link or malformed tag ships silently otherwise.
- **Dependencies:** None.
- **Files expected to change:** `.github/workflows/deploy.yml` (new steps); possibly a new lightweight dev dependency (evaluate a zero-install option like `linkinator` via `npx` first, to avoid introducing a `package.json`/`node_modules` footprint this repo has deliberately avoided).
- **Implementation plan:** Research a zero-config CLI check that runs via `npx` without a persistent dependency; prototype locally before adding to CI.
- **Verification checklist:** Confirm it correctly catches a deliberately-broken link in a throwaway local test, then confirm it passes clean on current `main`.
- **Success criteria:** CI fails on a broken internal link or malformed HTML; passes on current `main`.
- **Rollback plan:** Remove the workflow step.
- **Estimated risk:** Low — build-time only, never touches rendered output.
- **Status:** Not started.

### Task 5.2
- **Objective:** Compress/convert `assets/img/veda-portrait.png` (currently 2.1MB) to a reasonably sized WebP or optimized PNG.
- **Why this exists:** Single largest performance issue on the homepage; loaded above-the-fold.
- **Dependencies:** None. Uses `sips` (confirmed available, no download needed) or an equivalent local tool — does not require fetching anything external, so it doesn't trigger the download-permission constraint.
- **Files expected to change:** `assets/img/veda-portrait.png` (replaced in place, or a new `.webp` added alongside with the `<img src>` in `index.html` updated).
- **Implementation plan:** Resize to the actual rendered dimensions (currently displayed at a fraction of its native resolution — check computed size first), compress, target well under 200KB without visible quality loss, verify visually side-by-side before replacing.
- **Verification checklist:** Visual comparison at 100% zoom shows no perceptible quality loss; file size reduction confirmed; page loads and renders correctly.
- **Success criteria:** Same visual result, file size reduced by at least 10x.
- **Rollback plan:** Original file recoverable from git history.
- **Estimated risk:** Low — but do the visual side-by-side check carefully, this is the one task in this phase where a mistake would be visible.
- **Status:** Not started.

---

### Task 5.3
- **Objective:** Fix `scripts/bump-asset-version.mjs` so its own file walk skips `experiments/` and `references/`, matching `sync-chrome.mjs`'s existing `SKIP_DIRS`.
- **Why this exists:** New finding, logged per the Definition of Done rather than folded into whatever task was running when it was found. Hit this twice in Phase 3.1 alone — every version bump silently touches non-production mockup files, requiring a manual `git checkout -- experiments/` after every single run. Cheap, mechanical, safe fix.
- **Dependencies:** None.
- **Files expected to change:** `scripts/bump-asset-version.mjs` (one line — extend `SKIP_DIRS`).
- **Implementation plan:** Add `'experiments'` and `'references'` to the existing `SKIP_DIRS` set.
- **Verification checklist:** Run the script with a throwaway version string; confirm `experiments/` files no longer appear in the diff; revert the throwaway run.
- **Success criteria:** `bump-asset-version.mjs` only ever touches the live production surface.
- **Rollback plan:** Single-line revert.
- **Estimated risk:** None.
- **Status:** Not started.

---

## Phase 6 — Asset & third-party hardening — 🔒 BLOCKED, needs your go-ahead

Both tasks require downloading files from external sources, which I won't do without explicit permission per file/source, regardless of how low-risk they are. Flagging both here so they're not forgotten, not starting either without a yes.

- **6.1 — Self-host Lenis, add SRI.** Download `lenis@1.1.14` from the exact CDN version currently linked, place under `assets/js/vendor/`, update all `<script src>` references, add an SRI hash. Removes the single-point-of-failure external dependency for scroll behavior on every page.
- **6.2 — Self-host the ~46 unique Unsplash images used for hero/content imagery and `og:image` tags (98 total references).** Larger scope — would need each image's actual license/attribution checked, downloaded, optimized, and every reference across ~40 pages repointed. Recommend scoping this as its own dedicated task once greenlit, not folded into a general cleanup pass.

**Status: awaiting your decision on whether/when to greenlight.**

---

## Phase 7 — Architecture: SSG migration — 📋 DEFERRED, needs a dedicated kickoff

This is the single highest-leverage structural change identified across all three audits (no single source of truth for nav/footer/metadata is root cause #1), but it's also the only item large enough that it shouldn't be picked up inside this task-queue model — it needs its own scoping conversation (pick the tool — 11ty was the recommendation — decide the migration order, decide how much of the ~127-page corpus moves at once vs. incrementally). Sequencing note: do this after Phases 3-5 (no point hand-editing 52 files for accessibility/tokens if templates are about to change how those files are generated), and ideally before Phase 6.2 (image references will likely move anyway during migration).

**Not scheduled. Revisit when you want to have that conversation.**

---

## Deferred (real findings, not scheduled — revisit only when already touching that area)

- **Arrow-link component consolidation** (9+ near-identical classes → one base + modifiers). Real, ~100 line reduction, but touches markup across every page using any of the 9 classes — do as one deliberate, fully-tested pass, not incrementally.
- **Card component consolidation** (14 near-identical row/card implementations). Same shape of problem, larger. Right trigger: the next time a new card-like component is being built, not a standalone refactor of stable, working code.
- **Spacing token scale, shadow tokens, secondary max-width/measure scale.** Per the root-cause synthesis: imposing a scale where the data doesn't already cluster (spacing has 32 near-arbitrary values, unlike duration's clean convergence) means inventing a canonical value, which is a design judgment call dressed as a refactor. Let 3-4 tokens emerge from actually-recurring values the next few times these properties are touched.
- **Full transition-duration literal sweep** (~150 call sites → the Task 4.2 tokens). The tokens exist after 4.2; retrofitting every existing usage is a much bigger, more error-prone diff for a purely cosmetic win. Do opportunistically, file by file, when already editing nearby code.
- **Unify the three light/dark-variant mechanisms** (`.ph.dk`/`.lt`, `.cursor.on-light`, `data-t`/`data-nav-light`). Works correctly today; unifying is a coherence improvement, not a bug fix. No urgency.
- **`writing-redesign.css`'s independent color palette** — needs a decision from you, not an engineering call: is the Writing section's distinct paper/terracotta look intentional (in which case, formalize it as a documented theme layer extending the base tokens) or drift (in which case, unify it)? Flag and wait.
- **Legacy-named `assets/img/about-v21/notebook-notes/` folder.** `Agents.md` explicitly says don't rename casually. Only revisit as part of a broader, deliberate asset reorganization, never as a drive-by.
- **Typography scale full enforcement** (the ~40% of `font-size` declarations bypassing `--type-*` tokens). Many are legitimate one-off heading `clamp()` curves; a real cleanup here needs page-by-page visual judgment, not a mechanical sweep.

## Rejected (investigated, not worth doing — don't re-propose without new evidence)

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
