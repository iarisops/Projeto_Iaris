---
name: Iaris Ventures Nexus
colors:
  surface: '#121414'
  surface-dim: '#121414'
  surface-bright: '#37393a'
  surface-container-lowest: '#0c0f0f'
  surface-container-low: '#1a1c1c'
  surface-container: '#1e2020'
  surface-container-high: '#282a2b'
  surface-container-highest: '#333535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#bcc9c8'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#2f3131'
  outline: '#869393'
  outline-variant: '#3d4949'
  surface-tint: '#65d8d7'
  primary: '#65d8d7'
  on-primary: '#003737'
  primary-container: '#1aa1a1'
  on-primary-container: '#002f2f'
  inverse-primary: '#006a6a'
  secondary: '#ffb94c'
  on-secondary: '#442b00'
  secondary-container: '#c48402'
  on-secondary-container: '#3b2500'
  tertiary: '#bfc2fb'
  on-tertiary: '#282c5b'
  tertiary-container: '#898cc2'
  on-tertiary-container: '#222554'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#83f4f4'
  primary-fixed-dim: '#65d8d7'
  on-primary-fixed: '#002020'
  on-primary-fixed-variant: '#004f4f'
  secondary-fixed: '#ffddb2'
  secondary-fixed-dim: '#ffb94c'
  on-secondary-fixed: '#291800'
  on-secondary-fixed-variant: '#624000'
  tertiary-fixed: '#e0e0ff'
  tertiary-fixed-dim: '#bfc2fb'
  on-tertiary-fixed: '#131645'
  on-tertiary-fixed-variant: '#3f4273'
  background: '#121414'
  on-background: '#e2e2e2'
  surface-variant: '#333535'
  deep-navy: '#000033'
  vibrant-teal: '#009999'
  innovation-amber: '#fbb33d'
  slate-blue: '#303f59'
  marker-blue: '#6787bf'
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
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  grid-pattern-size: 30px
---

## Brand & Style

This design system is engineered for a venture building and startup ecosystem context, prioritizing a "Professional-Tech-Dynamic" aesthetic. It balances the high-stakes world of finance and law with the creative, rapid-fire energy of innovation. 

The visual identity is anchored in **Corporate Modernism** with a heavy infusion of **Technical Geometricism**. It uses a sophisticated dark-mode default to convey stability and authority, while utilizing vibrant teal and amber accents to represent energy and "sparks" of innovation.

**Visual Pillars:**
- **Technical Precision:** Use of grid markers, mathematical "X" and "+" symbols, and dashed lines to evoke engineering blueprints.
- **Human Creativity:** Juxtaposition of strict grids with organic, "scribble" style lineart (doodles) to represent the messy but brilliant process of ideation.
- **Dynamic Growth:** High-contrast photography and aggressive diagonal patterns emphasize movement and scale.

## Colors

The palette is built on a "High-Saturation Professional" logic. The foundation is **Deep Navy (#000033)**, which serves as the primary canvas for most surfaces. 

**Vibrant Teal (#009999)** is the primary action color, used for high-visibility UI elements, progress indicators, and primary buttons. **Innovation Amber (#fbb33d)** is the accent color, reserved exclusively for highlights, call-outs, and decorative lineart to ensure it remains impactful. 

**Slate Blue (#303f59)** and **Marker Blue (#6787bf)** are utilized for technical grid patterns and secondary borders, providing depth without competing with the primary brand colors. All text on dark backgrounds must be pure white or high-lightness teal to maintain accessibility.

## Typography

The typography strategy uses a trio of modern sans-serifs to distinguish between brand impact and technical utility.

- **Hanken Grotesk** is used for headlines. Its sharp, contemporary architecture reflects the brand’s professional and technological focus. Use "ExtraBold" for main display titles to maximize impact.
- **Plus Jakarta Sans** is the primary body face. Its friendly, open counters ensure high readability for long-form content regarding venture terms and startup news.
- **Geist** is used for labels, captions, and data-heavy technical sections. Its monospaced-adjacent feel reinforces the "developer/tech" ecosystem narrative.

**Refinement:** Titles should frequently use "title case" for a more institutional feel, while labels should utilize uppercase with slight letter spacing to act as structural anchors in the layout.

## Layout & Spacing

This design system employs a **Fixed-Fluid Hybrid Grid**. Content is housed in a 12-column container on desktop, but the background utilizes edge-to-edge patterns and textures.

**The Blueprint Grid:**
A signature element is the 30px technical marker grid. Small "+" and "X" symbols should be placed at 30px intervals in background layers. 

**Diagonal Rhythm:**
Use 45-degree diagonal stripes as containers for secondary information or as section transitions. These stripes should follow a consistent weight of ~6px with ~13px intervals.

**Mobile Reflow:**
On mobile, margins compress to 16px. Typography scales down (Headline XL becomes 32px), but the technical markers remain the same size (30px) to maintain their "instrument-like" feel.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Transparency** rather than traditional shadows.

1.  **Base Layer:** Deep Navy (#000033).
2.  **Pattern Layer:** Technical markers and diagonal stripes (Marker Blue at 20-40% opacity).
3.  **Container Layer:** Surfaces are created using Slate Blue (#303f59) with no shadow, but 1px solid borders in Teal or Marker Blue.
4.  **Accent Layer:** Lineart doodles and "highlighter" blocks in Innovation Amber or Teal.

Use **Low-Contrast Outlines** for cards. Instead of shadows, use a 1px border that is slightly lighter than the background color to create a subtle "cut-out" effect. Semi-transparent overlays (64% alpha) should be used on images to allow technical patterns to bleed through.

## Shapes

The shape language is primarily **Sharp and Geometric**. 

- **Containers:** Standard cards and input fields should use a "Soft" (0.25rem) radius. This provides a professional touch without feeling "bubbly."
- **Buttons:** Primary buttons should be sharp (0px radius) to emphasize the brand's architectural rigor.
- **Accent Elements:** The "hourglass" diamond shape from the logo is the primary geometric motif. Use it as a mask for images or as a bullet point in lists.
- **Lineart:** All illustrations must maintain a hand-drawn, "sketch" feel. The stroke weight should be consistent across all doodles to ensure they feel part of the same "brainstorming" session.

## Components

**Buttons:**
Primary buttons are rectangular with 0px roundedness, filled in Vibrant Teal with White text. Secondary buttons use a Teal "ghost" style with a 2px border. Use Innovation Amber for "Warning" or "High-Attention" states.

**Chips / Tags:**
Use for categories like "Fintech," "Legal," or "SaaS." These should have a background color of Slate Blue and a 1px border. The text should be set in Geist Label-sm.

**Technical Pattern Backgrounds:**
Every major section should have a subtle technical marker background. The markers (+) should be placed at the intersections of the layout grid where possible.

**Input Fields:**
Fields are dark-themed. Background: Deep Navy. Border: 1px Slate Blue. On focus, the border transitions to Vibrant Teal with a subtle outer glow (no blur).

**Cards:**
Startup cards should feature an image with a Teal overlay at 30% opacity. The footer of the card should be a solid block of Slate Blue, housing the metadata in Geist typography.

**Lineart Integration:**
Doodles (lightbulbs, arrows, puzzles) should never be the "hero" element. They should act as "marginalia," placed slightly off-center or overlapping the edges of cards and containers to give a sense of organic growth within the rigid grid.