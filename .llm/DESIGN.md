---
name: IARIS Portfolio OS — Design System
colors:
  background:       '#f5f7fc'
  surface:          '#ffffff'
  surface-2:        '#eceef7'
  border:           '#e2e8f4'
  border-subtle:    '#f0f2f8'
  text-primary:     '#0d1226'
  text-secondary:   '#4d5b7c'
  text-muted:       '#8492b0'
  deep-navy:        '#000033'
  vibrant-teal:     '#009999'
  innovation-amber: '#fbb33d'
  slate-blue:       '#303f59'
  marker-blue:      '#6787bf'
  signal-red:       '#e53e3e'
  signal-orange:    '#dd6b20'
  signal-yellow:    '#d69e2e'
  signal-green:     '#38a169'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 64px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.4'
rounded:
  none: 0px
  sm: 4px
  md: 6px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  grid-pattern-size: 30px
---

## Brand & Style

The IARIS Portfolio OS design system uses a **light-mode default** — clean, professional, and readable — while retaining the full IARIS brand palette as accent and navigation colors.

The aesthetic is **Corporate Clarity**: white and off-white surfaces with deep navy navigation, vibrant teal as the primary action color, and subtle blue-gray borders for structure. Typography is precise and hierarchical.

**Visual Pillars:**
- **Light & Airy Surfaces:** White cards, light gray page backgrounds, barely-there borders convey trust and clarity.
- **Dark Navy Sidebar:** The navigation column stays in Deep Navy (#000033) — the anchor of IARIS brand identity.
- **Teal as Action:** Vibrant Teal (#009999) marks every interactive, active, and progress element.
- **Technical Grid:** 30px blueprint grid as background texture, now rendered in the light border color (`#e2e8f4`).

## Colors

### Light Theme (default for all app pages)

| Token | Value | Use |
|---|---|---|
| `--color-background` | `#f5f7fc` | Page background |
| `--color-surface` | `#ffffff` | Cards, panels, modals |
| `--color-surface-2` | `#eceef7` | Secondary surfaces, Kanban columns, input backgrounds |
| `--color-border` | `#e2e8f4` | All borders, dividers |
| `--color-border-subtle` | `#f0f2f8` | Subtle dividers inside cards |
| `--color-text-primary` | `#0d1226` | Headings, primary labels |
| `--color-text-secondary` | `#4d5b7c` | Body text, descriptions |
| `--color-text-muted` | `#8492b0` | Metadata, timestamps, helper text |

### Brand Colors (always fixed, never overridden by theme)

| Token | Value | Use |
|---|---|---|
| `--color-deep-navy` | `#000033` | Sidebar background, dark overlays |
| `--color-vibrant-teal` | `#009999` | Primary buttons, active states, progress |
| `--color-innovation-amber` | `#fbb33d` | Accent highlights, warnings |
| `--color-slate-blue` | `#303f59` | Sidebar borders |
| `--color-marker-blue` | `#6787bf` | Secondary accents |

### Signal Colors

| Token | Value |
|---|---|
| `--color-signal-green` | `#38a169` |
| `--color-signal-red` | `#e53e3e` |
| `--color-signal-orange` | `#dd6b20` |
| `--color-signal-yellow` | `#d69e2e` |

### Dark Surface Override

Components that must retain the dark brand identity (sidebar, any brand splash) use the `.dark-surface` CSS class. This class locally overrides all semantic color tokens back to deep navy values, so all semantic Tailwind classes (`bg-surface`, `text-text-primary`, etc.) resolve to dark values within that subtree.

```css
.dark-surface {
  --color-background:     #000033;
  --color-surface:        #0a0f2e;
  --color-surface-2:      #111840;
  --color-border:         #303f59;
  --color-border-subtle:  #1e2a40;
  --color-text-primary:   #f0f4ff;
  --color-text-secondary: #8fa3c8;
  --color-text-muted:     #4a5f80;
}
```

## Typography

Three typefaces, each with a distinct role:

- **Hanken Grotesk** (`font-headline`) — all headings. Sharp, geometric, institutional.
- **Plus Jakarta Sans** (`font-body`) — body and paragraph text. Friendly, open, readable.
- **Geist** (`font-label`) — labels, metadata, captions, code. Technical precision.

Labels use uppercase + letter-spacing (`font-label text-[10px] uppercase tracking-wide`) for structural anchoring.

## Layout & Elevation

Hierarchy is established through **Tonal Layering**, not shadows:

1. **Page:** `#f5f7fc` (very light blue-gray)
2. **Card / Panel:** `#ffffff` (white) with `1px solid #e2e8f4` border
3. **Secondary container / Kanban column:** `#eceef7`
4. **Hover / active card:** `border-[#009999]/50` border highlight

No `box-shadow` on surfaces. Use border + background tint for depth.

### Kanban-specific

- Column background: `#eceef7/60` at rest, `#009999/8` while a card is dragged over
- Column header: count badge as small circle `bg-[#e2e8f4] text-[#4d5b7c]`
- Card: `bg-white border border-[#e2e8f4] hover:border-[#009999]/50`

## Components

### Buttons

Primary: rectangular, **0px radius**, Teal fill (`bg-primary`), white text.  
Secondary/ghost: `bg-surface-2 text-text-primary border border-border`.

### Cards

White background, 1px `#e2e8f4` border, 0px radius. Hover: teal border highlight, optional light shadow.

### Input Fields

Background: `bg-surface-2` (`#eceef7`). Border: `1px solid #e2e8f4`. Focus: border transitions to Vibrant Teal.

### Tags / Chips

Small, 0px radius. Teal-tinted: `bg-[#eef8f8] text-[#007a7a] border border-[#009999]/20`.

### Technical Grid Background

`.bg-grid` — 30px blueprint grid using `--color-border` (`#e2e8f4`) on light surfaces. Low-contrast, structural accent.

### Navigation (Sidebar)

The sidebar always uses `.dark-surface`. Logo: `Logo-IARIS-fundo escuro.png`. Nav links use `text-text-secondary hover:text-text-primary hover:bg-surface-2` (resolving to dark-theme values inside `.dark-surface`).

### Logos

| Context | Asset |
|---|---|
| Sidebar (dark navy bg) | `Logo-IARIS-fundo escuro.png` |
| Light pages (login, headers) | `Logo-IARIS.png` |
| Icon-only | `simbolo-IARIS-azul.svg` or `simbolo-IARIS-branco.svg` |

## Shapes

- **All containers, cards, inputs:** 0px radius (sharp) as the default.
- **Small UI affordances** (count badges, avatars): `rounded-full`.
- **Modal corners:** 0px (consistent with card language).
