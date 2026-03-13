# Quick Reference: Homepage Versions

## Summary Table

| Version | Date | Size | Key Characteristics | Status |
|---------|------|------|-------------------|--------|
| **V1** | Feb 20, 09:36 | 12KB | Minimalist, self-contained, simple sections | Initial version |
| **V2** | Feb 20, 09:54 | 14KB | Expanded with case studies, essays, Now section | Added content |
| **V3** | Feb 20, 10:13 | 20KB | Logo credibility strip, comprehensive layout | Most detailed |
| **V4** | Mar 2, 08:49 | 12KB | Redesigned, impact strip, simplified structure | Latest/Current |

---

## When to Use Each Version

### Version 1 (Simple Homepage)
**Use if**: You prefer a clean, minimal presentation focused on core introduction
- Best for: Direct introduction, minimal information architecture
- Contains: About, Work (3 items), Writing, Contact
- Self-contained HTML with embedded CSS

### Version 2 (Enhanced Homepage)
**Use if**: You want more comprehensive content with case studies and essays
- Best for: Showing more background and publications
- Adds: Now section, Experience (4 items), Case studies, Essays
- External CSS file required

### Version 3 (Comprehensive Layout)
**Use if**: You want to showcase credentials and establish authority upfront
- Best for: Maximum trust signals and credibility
- Adds: Logo strip (Amazon, UChicago, Google Launchpad, etc.)
- External CSS file required
- Largest file size (most detailed)

### Version 4 (Redesigned)
**Use if**: You prefer modern, impact-focused design
- Best for: Direct case study and metric showcase
- Key feature: Impact strip with metrics (50M users, $2M+ pipeline, etc.)
- Moved: About and Contact to separate pages
- External CSS file required
- Smallest file size (most streamlined)

---

## Content Hierarchy Comparison

```
VERSION 1:          VERSION 2:           VERSION 3:           VERSION 4:
├─ Hero             ├─ Hero              ├─ Hero              ├─ Hero
├─ About            ├─ About             ├─ Logo strip        ├─ Impact metrics
├─ Work (3)         ├─ Now               ├─ About             ├─ Case studies
├─ Writing (2)      ├─ Experience (4)    ├─ Now               ├─ Writing
└─ Contact          ├─ Case Studies      ├─ Experience        └─ Contact (linked)
                    ├─ Writing           ├─ Case Studies
                    └─ Contact           ├─ Writing
                                         └─ Contact
```

---

## Key Features by Version

### Navigation Items

**V1**: About, Work, Writing, Contact (4 items)

**V2**: About, Now, Experience, Case Studies, Writing, Contact (6 items)

**V3**: About, Case Studies, Writing, Work With Me, Contact (5 items)

**V4**: About (linked), Case Studies, Writing, Work With Me, Contact (linked) (5 items + 2 external pages)

### Work/Experience Section

**V1**:
- Amazon (Senior PM)
- No Desk Project (Founder & CEO)
- Nomadize (CEO)

**V2-3**:
- Amazon (Senior PM & Chief of Staff)
- No Desk Project (Founder & CEO)
- Nomadize (CEO)
- FACT Software (Head of Marketing)

**V4**: Moved to separate `about.html` page

### Case Studies

**V1**: None

**V2-3**: Links to external pages:
- Aarogya Setu (GTM, 50M users in 13 days)
- No Desk Project (Building from nothing)
- FACT Malaysia (Regulatory opportunity)
- Consulting work (portfolio)
- Amazon (2 placeholders - coming soon)

**V4**: Featured case study + grid with additional cases:
- Aarogya Setu (featured with quote)
- Metric problem (new)
- Other cases in grid

### Writing Section

**V1**: 2 external links (Medium, Booth Experience)

**V2**:
- Essays (2 blog posts with excerpts)
- External (3 links)

**V3**: Same as V2 with enhanced styling

**V4**: Moved to separate pages or handled differently

---

## Hero Section Comparison

**V1 Hero:**
```
Eyebrow: Product · Founder · Remote Work
Title: Veda Vajpeyi
Tagline: Senior PM at Amazon building Alexa experiences,
         and founder reimagining how the next generation works — without a desk.
Links: LinkedIn, Instagram, Writing, Get in touch
```

**V2 Hero:**
```
Eyebrow: Product Strategy · Human-Centered Leadership · Founder
Title: Veda Vajpeyi
Tagline: Senior PM at Amazon. Founder. Booth MBA. I build things that matter —
         with rigor, clarity, and a bias toward the human on the other end.
Links: LinkedIn, Instagram, Writing, Get in touch
```

**V3 Hero:**
```
Same as V2, PLUS:
Logo strip: Amazon, UChicago Booth, Google Launchpad, UCLA, WEF
```

**V4 Hero:**
```
Title: Veda Vajpeyi
Tagline: Product strategy rooted in sociology.
Bio: I work at the intersection of what data says and what humans actually feel.
     Senior PM at Amazon · Chicago Booth MBA · Founder · Building Books & Beds in Bangalore.
Links: About, Case Studies, Get in touch
```

---

## CSS Structure

**V1**: CSS embedded in `<style>` tag
- ~250 lines of CSS
- Self-contained file

**V2-4**: CSS in external `styles.css` file
- Modular structure
- ~700+ lines after all edits
- Linked via `<link rel="stylesheet" href="styles.css">`

---

## Major Design Evolutions

### Hero Section Evolution:
- **V1**: Simple introduction + social links
- **V2**: More professional tagline + navigation to experience
- **V3**: + Credibility signals (logo strip)
- **V4**: Simplified, impact-focused + mention of Books & Beds project

### Content Density:
- **V1**: Lean (~300 words of copy)
- **V2**: Moderate (~600 words)
- **V3**: Comprehensive (~800 words)
- **V4**: Medium (~400 words on homepage, rest on separate pages)

### Information Architecture:
- **V1**: Single-page, minimal sections
- **V2-3**: Single-page, comprehensive, build authority
- **V4**: Multi-page, streamlined homepage with detail pages

---

## Recommended Choices

**For attracting investors/employers**: Version 3 (full credibility signals)

**For personal branding**: Version 4 (modern, clean, case-study focused)

**For simplicity**: Version 1 (minimal, clean, focused)

**For comprehensive portfolio**: Version 2 (shows work, writing, and credentials)

---

## Files Included

All versions are self-contained or paired with styles.css:
- `index_version_1.html` - Complete, no additional files needed
- `index_version_2.html` - Requires `styles.css`
- `index_version_3.html` - Requires `styles.css`
- `index_version_4.html` - Requires `styles.css`

To use any version except V1, make sure the corresponding `styles.css` is in the same directory.
