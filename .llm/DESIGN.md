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

---

## Kanban & Card Pattern

> **Standard**: Every Kanban view in the system (Portfolio Kanban, CRM Kanban, Meu Kanban) MUST follow this anatomy. Use the reference image at `assets/referencias_design_layout/pagina operacional startup/referencia_kanban_pagina_operacional.png` as the visual benchmark. Only colors diverge — apply IARIS tokens instead of the reference palette.

### Column layout

```
[Phase Name]  [● count]        [+] [•••]
┌──────────────────────────────────────┐
│ card                                 │
│ card                                 │
│ ...                                  │
│                        (drop zone)   │
└──────────────────────────────────────┘
```

| Element | Spec |
|---|---|
| Column width | `272px` fixed, horizontal scroll when > 4 columns |
| Column gap | `16px` (`gap-4`) |
| Column body bg | `bg-surface-2/60` at rest; `bg-primary/5 border-primary/20` while dragging over |
| Column body border | `1px solid --color-border` |
| Column body min-height | `240px` |
| Column body padding | `8px` (`p-2`), `gap-10px` between cards |
| Column header | No background — floats above column body |
| Phase name | `font-headline text-sm font-semibold text-text-primary` |
| Count badge | `w-5 h-5 rounded-full` — **phase-colored** (see token table below) |
| "+" button | `text-text-muted hover:text-text-primary`, opens inline add form at bottom of column |
| "..." button | `text-text-muted hover:text-text-primary`, column-level actions (future) |

### Card anatomy

```
┌─────────────────────────────────────────┐
│  [● Phase chip]                   [•••] │  ← header row
│                                         │
│  Title text bold                        │  ← title
│  Description truncated to 2 lines       │  ← description (optional)
│                                         │
│  Responsável:  [○ avatar]               │  ← responsible row
│  ─────────────────────────────────────  │  ← divider (border-subtle)
│  📅 25 Mar 2025    💬 1                 │  ← footer: date + comment count
└─────────────────────────────────────────┘
```

| Element | Spec |
|---|---|
| Card bg | `bg-surface border border-border hover:border-primary/40` |
| Card radius | `0px` |
| Card padding | `px-3.5`, `pt-3.5` header, `py-3` footer |
| Card gap between sections | `gap-0` on container; individual spacing via `mt-*` |
| Overdue card | `border-signal-red/40 hover:border-signal-red/70` |
| Drag ghost | `opacity-80 rotate-1` |
| Phase chip | `inline-flex items-center gap-1.5 px-2 py-0.5 border text-[10px] font-semibold font-label` — phase-colored (see table) |
| Phase chip dot | `w-1.5 h-1.5 rounded-full` |
| "..." button | Top-right of card, `tabIndex={-1}` for drag compatibility |
| Title | `text-sm font-semibold text-text-primary leading-snug` |
| Description | `text-xs text-text-secondary leading-relaxed line-clamp-2` |
| Responsible label | `text-[10px] text-text-muted font-label` |
| Responsible avatar | `w-5 h-5 rounded-full` — `bg-primary/10 border-primary/20` if set; `border-dashed border-border opacity-40` if unset |
| Divider | `border-t border-border-subtle` inside `mx-3.5 mt-3` |
| Date icon | 12×12 SVG calendar, monoline stroke |
| Date text | `text-[10px] font-label` — `text-text-muted` normal; `text-signal-red` overdue |
| Comment count | Message icon 11×11 + count `text-[10px] font-label text-text-muted` |

### Phase color tokens

| Phase | Chip bg | Chip text | Chip border | Dot | Badge bg | Badge text |
|---|---|---|---|---|---|---|
| Backlog | `bg-surface-2` | `text-text-secondary` | `border-border` | `bg-text-muted` | `bg-[#e2e8f4]` | `text-[#4d5b7c]` |
| A fazer | `bg-[#e8eef8]` | `text-[#303f59]` | `border-[#c8d5ed]` | `bg-[#303f59]` | `bg-[#dce6f8]` | `text-[#303f59]` |
| Em andamento | `bg-[#e6f7f7]` | `text-[#007a7a]` | `border-[#b3e5e5]` | `bg-primary` | `bg-[#cceeee]` | `text-[#007a7a]` |
| Aguardando/Bloqueado | `bg-[#fef3e2]` | `text-[#b45309]` | `border-[#f9d9a0]` | `bg-[#fbb33d]` | `bg-[#fde8c8]` | `text-[#b45309]` |
| Em revisão | `bg-[#eff3fb]` | `text-[#6787bf]` | `border-[#c5d5ef]` | `bg-[#6787bf]` | `bg-[#dce7f8]` | `text-[#6787bf]` |
| Concluído | `bg-[#f0faf5]` | `text-[#2d8653]` | `border-[#b2dfc8]` | `bg-signal-green` | `bg-[#d4f0e3]` | `text-[#2d8653]` |

### Inline add form

Opens inside the column body (bottom) when "+" is clicked. Contains: Title (required), Descrição (optional, 2 rows), Data limite (optional date), Cancelar + Criar buttons. Pre-selects the column's phase. Closes on Cancelar or after successful create.

### Implementation notes

- Phase chip label for "Aguardando/Bloqueado" truncates to "Aguardando" (chip too narrow for full string).
- The "..." button on cards and column headers is a visual affordance — behavior to be implemented per context.
- Responsible avatar shows a generic user icon; wire up `users` name map from parent page when user name data is available.
- Phase chip appears on cards even within the matching column (provides context in multi-column views like Meu Kanban).
- CRM Kanban columns represent funnel stages — same card anatomy applies but phase chip shows stage name instead of kanban phase.

---

## TaskModal

Full-page-overlay modal used for creating and editing kanban tasks. Opens on card click (edit mode) or "+" button (create mode).

### Layout (top → bottom)

```
┌─────────────────────────────────────────────────────┐
│  [•••]                                          [✕] │  ← top bar
│  [● Phase chip]  ·  📅 dd mmm yyyy                  │  ← breadcrumb (reactive)
│                                                     │
│  Task title (inline editable)                       │  ← title
│  Criado por: Name · dd/mm/aaaa                      │  ← created-by (edit mode only)
│                                                     │
│  RESPONSÁVEL  [select dropdown]                     │
│  DATA LIMITE  [date input]                          │
│  FASE         [select dropdown → updates chip]      │
│                                                     │
│  DESCRIÇÃO    [RichTextEditor]                      │
│  LINKS        [url + label pairs, add/remove]       │
│                                                     │
│  ATIVIDADES E COMENTÁRIOS                           │
│  ─────────────────────────────────────────────────  │
│  [Todos] [Atividades] [Comentários]  (tabs)         │
│  comment input (textarea, taller)                   │
│  comment thread                                     │
│  ─────────────────────────────────────────────────  │
│  [Cancelar]                    [Criar / Salvar]     │  ← footer
│  (edit mode adds [Excluir] left of Cancelar)        │
└─────────────────────────────────────────────────────┘
```

### Key behaviors

| Behavior | Detail |
|---|---|
| Phase chip in breadcrumb | Reactive: updates immediately when FASE select changes |
| Title | `contentEditable` div; `Enter` blurs instead of inserting newline |
| FASE select in create mode | Pre-selected to the column where "+" was clicked |
| FASE select in edit mode | Full select; updates breadcrumb chip live |
| `onClose` | Closes modal without saving |
| `onCreate` | Creates task, optimistically adds to board state |
| `onUpdate` | Updates task, updates board state in-place |
| `onDelete` | Deletes task, removes from board state |

---

## RichTextEditor

Tiptap-based rich text editor used in TaskModal's DESCRIÇÃO field.

**Extensions**: StarterKit + Underline + TaskList + TaskItem

**Toolbar** (above editor area):

```
[B] [I] [U]  |  [•] [1.] [☑]
```

| Button | Action |
|---|---|
| **B** | Bold |
| *I* | Italic |
| U | Underline |
| • | BulletList |
| 1. | OrderedList |
| ☑ | TaskList (checklist with checkbox items) |

**Key implementation notes**:
- Toolbar buttons use `onMouseDown={e => e.preventDefault()}` to keep editor focus, then `onClick` to fire the command. Separating these two handlers is required — doing both in `onMouseDown` fires before ProseMirror finalizes the selection.
- Tailwind Preflight resets `list-style: none` on all `ul`/`ol`. Editor container needs explicit `!important` overrides in `globals.css` inside a `.tiptap-editor` scope.
- Editor container uses `pl-6 pr-3` (not symmetric `px-3`) to leave space for list markers.
- Exports `stripHtml(html: string): string` utility — used by `TaskCard` to render a plain-text description preview (`line-clamp-2`).
- Checked checklist items display `text-decoration: line-through` in the editor and in the card preview.

---

## Meu Kanban — Board Selector

The `/meu-kanban` area uses URL-based routing with a shared layout for board switching.

```
/meu-kanban        → Meu Kanban (tarefas atribuídas ao usuário em todas as startups)
/meu-kanban/iaris  → Kanban interno IARIS
```

**Layout structure** (`meu-kanban/layout.tsx`):
- Heading "Kanban" + subtitle
- `<BoardTabs />` below heading (tab bar)
- `{children}` renders the selected board

**Tab bar** (`BoardTabs.tsx`):
- Tabs: `Meu Kanban` (exact match `/meu-kanban`) and `IARIS` (`/meu-kanban/iaris`)
- Active tab: `border-b-2 border-primary text-text-primary`; inactive: `text-text-muted hover:text-text-secondary`
- Uses `usePathname()` for active detection — bookmarkable, SSR-safe

**Meu Kanban differences from PortfolioKanban**:
- Shows tasks from **all** startups (plus IARIS is excluded via `is_system` filter)
- Each card has a **startup name badge** below the phase chip
- Filters panel: startup dropdown, phase dropdown, overdue-only checkbox + task count
- Cards open TaskModal in **edit-only** mode (no create from Meu Kanban — create from the startup's own Kanban)

**IARIS Kanban** (`IariasKanban.tsx`):
- Uses standard `createTask`, `updateTask`, `deleteTask`, `moveTask` from `lib/actions/kanban`
- Passes `startupId={IARIS_STARTUP_ID}` and `quarter={IARIS_QUARTER}` to TaskModal
- Same card anatomy as PortfolioKanban (no startup badge — all tasks belong to IARIS)
- "+" per column opens TaskModal in create mode
- The IARIS record (`is_system=true`) is excluded from all portfolio listings
