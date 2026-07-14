# Engineering Improvement Program — Complete

**Program dates:** July 2026. **23 commits**, `7662ec7` → `cc83d1f`. Full detail, task-by-task, lives in [`ENGINEERING_ROADMAP.md`](ENGINEERING_ROADMAP.md) — this document is the short version for future reference.

## Overview

- 23 commits, 63 files touched
- 948 insertions, 1,237 deletions (net: the codebase got smaller while gaining functionality)
- CSS footprint: 4,854 → 3,938 lines across the 6 stylesheets (**-19%**), with zero visual change
- `work-scroll-morph.css` specifically: 937 → 228 lines (**-76%** — an entire abandoned scrollytelling feature removed)
- Homepage portrait: 2.1MB → 164KB (**-92%**, 13.2x)
- 1 real user-facing bug fixed (`.pg-nav-cta`, silently unstyled on 41 pages)
- 1 duplicate feature implementation consolidated (case-study hover-tint)
- Accessibility: skip link + `<main>` landmark went from 0/52 and 4/52 pages to 52/52 both; one accordion's keyboard/screen-reader behavior brought in line with the rest of the site
- CI gained two automated checks it didn't have before (chrome-drift detection, broken-internal-link detection) — previously, the only thing catching either class of problem was a human noticing

## How this program was run

Three audits (architecture, implementation quality, design-system engineering) → consolidated into one roadmap, every finding sorted into Implement / Defer / Reject with reasoning recorded for each → executed task by task, each one independently re-verified against current code before touching anything (not just re-run from the original audit's notes) → closed out with a post-cleanup validation pass that re-ran the dead-code methodology and smoke-tested representative pages rather than assuming the work held up.

Two findings were caught and corrected mid-program rather than shipped: the accordion's `aria-hidden` fix originally would have created a different, well-known a11y anti-pattern (hiding an element that still had a focusable child) until that was caught and fixed in the same task; and a task's own plan (`--z-base` for a z-index that turned out not to exist anymore) was revised on the spot rather than executed against stale assumptions.

## Key architectural improvements

- **Dead code, gone.** ~1,000 lines of CSS that were shipping to every visitor with zero effect — an abandoned "chapter" scrollytelling system, a pre-redesign services component, several earlier-homepage sections, an unused image-placeholder component, and a handful of smaller orphaned selectors. All confirmed dead via exact class-token matching against the live site before removal, not assumption.
- **One real bug fixed.** `.pg-nav-cta`, the closing "Let's talk" CTA on every content page, had no matching CSS rule on 41 pages and a second, redundant one on 6 more — it had been rendering as a plain unstyled link the whole time.
- **Design tokens, added where they were genuinely missing.** `-rgb` color companions (replacing 24 hand-typed RGB triplets), a z-index scale (replacing 6 magic numbers with undocumented gaps), duration tokens for future use. Explicitly *not* done: a full spacing-scale token system — the existing values don't cluster the way the others did, so imposing one would have meant inventing a canonical value rather than naming one that already existed. Left for organic emergence instead.
- **CI now enforces what previously depended on memory.** Chrome (nav/footer) consistency and broken internal links are both checked automatically on every push now; neither was before.
- **Accessibility closed the two gaps that mattered most:** a skip link and `<main>` landmark that literally didn't exist anywhere, and an accordion whose ARIA implementation didn't match the rigor already present elsewhere in the same codebase (the mobile nav).

## Intentional technical debt (left alone on purpose)

- **The custom `.cursor` dot is `display: none` site-wide.** Deliberate — reverted by you in the commit immediately preceding this program, not a bug.
- **`writing-redesign.css` runs its own parallel design system** — separate color tokens, separate container-width formula (`min(1160px, calc(100vw - 56px))` vs. the rest of the site's `max-width: 1180px`). Predates this program. Still an open question for you, not an engineering call: intentional theming for the Writing section, or drift worth unifying?
- **The `.ci`/`.mti`/`.tl-`/`.srv` abbreviated class naming convention** — documented with a legend rather than renamed; renaming across 127 files for a naming-convenience win wasn't worth the risk.
- **9+ near-identical "arrow link" CSS components and 14 near-identical "card row" components** — real, quantified duplication, deliberately not consolidated. Both need a dedicated, fully-tested pass (they touch markup across many pages), not a slot in a general cleanup queue.
- **No templating layer.** The single largest architectural finding across the whole program — no single source of truth for nav/footer/metadata, ~55% of every essay page is boilerplate. Deliberately kept out of this program entirely; it needs its own scoping conversation (tool choice, migration order), not a task-queue slot.
- **Unsplash-hotlinked imagery and CDN-loaded Lenis** — both flagged as real production risk, both blocked pending your go-ahead since fixing them means downloading external files.

## Future considerations

- SSG migration (Phase 7 in the roadmap) — the standing highest-leverage item, not scheduled.
- Self-hosting Lenis + Unsplash images (Phase 6) — blocked on your decision to greenlight.
- HTML structural-validity checking in CI — trialed, descoped; default linters were too noisy (18 style-preference "errors" on the homepage alone, zero real malformation) to gate a build on without dedicated tuning time.
- A full accessibility audit with an automated axe-core/Lighthouse CI gate, once there's a reason to look past the two gaps already closed.
- Arrow-link and card-row component consolidation, whenever one of those patterns is next being extended rather than as a standalone refactor of stable code.

---

*The roadmap (`ENGINEERING_ROADMAP.md`) and the original audit artifacts remain in the conversation history for anyone who wants the full reasoning behind a specific decision. This file is the version worth reading first.*
