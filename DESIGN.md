---
name: Mindmesh
colors:
  surface: '#0f1417'
  surface-dim: '#0f1417'
  surface-bright: '#353a3d'
  surface-container-lowest: '#0a0f12'
  surface-container-low: '#171c1f'
  surface-container: '#1b2023'
  surface-container-high: '#262b2e'
  surface-container-highest: '#313539'
  on-surface: '#dfe3e7'
  on-surface-variant: '#bcc8d1'
  inverse-surface: '#dfe3e7'
  inverse-on-surface: '#2c3134'
  outline: '#86929a'
  outline-variant: '#3d484f'
  surface-tint: '#75d1ff'
  primary: '#92d9ff'
  on-primary: '#003548'
  primary-container: '#00c2ff'
  on-primary-container: '#004c66'
  inverse-primary: '#006688'
  secondary: '#d2bbff'
  on-secondary: '#3f008e'
  secondary-container: '#6001d1'
  on-secondary-container: '#c9aeff'
  tertiary: '#5ae9ac'
  on-tertiary: '#003824'
  tertiary-container: '#36cc92'
  on-tertiary-container: '#005136'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c2e8ff'
  primary-fixed-dim: '#75d1ff'
  on-primary-fixed: '#001e2b'
  on-primary-fixed-variant: '#004d67'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0f1417'
  on-background: '#dfe3e7'
  surface-variant: '#313539'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style
The design system embodies a premium, high-performance aesthetic tailored for marketing orchestration. It draws inspiration from the precision of developer tools and the fluidity of modern creative platforms. The brand personality is technical, visionary, and hyper-efficient.

The visual style is a fusion of **Modern Corporate** and **Glassmorphism**, characterized by a deep obsidian-navy base and hyper-focused neon accents. Key visual motifs include:
- **Subtle Dot-Grids:** Used in background layers to provide a sense of technical structure and depth.
- **Luminous Glows:** Soft radial gradients in blue and purple behind key components to signify activity and intelligence.
- **Micro-Precision:** Ultra-thin borders and refined typography that suggest a tool of extreme accuracy.
- **Fluid Motion:** Interactions should feel weightless, utilizing background blurs and staggered entrance animations.

## Colors
This design system utilizes a "Deep Space" palette. The core interface relies on varying levels of dark navy to establish hierarchy rather than traditional grays. 

- **The Base:** The `#040B1A` background provides a high-contrast canvas for neon elements.
- **Neon Accents:** Blue and Purple are used for primary actions and data visualizations. They should be used sparingly against the dark background to maintain a premium feel.
- **Semantic Colors:** Green (Success), Red (Error), and Yellow (Warning) are saturated to ensure visibility against the dark backdrop while adhering to the technical aesthetic.
- **Transparency:** Use the white-based border (`rgba(255, 255, 255, 0.06)`) consistently to define boundaries without adding visual bulk.

## Typography
Inter is used exclusively to maintain a systematic and utilitarian feel. 

- **Hierarchy:** Use `display-lg` for dashboard hero stats and `headline-md` for card titles.
- **Technical Detail:** `label-md` uses uppercase styling and increased letter spacing to denote metadata, small tags, or overlines.
- **Readability:** Body text should primarily use the `text_primary` color for high legibility, while `text_muted` is reserved for descriptions and secondary information.
- **Weights:** Stick to 400 (Regular) for body and 600 (Semi-Bold) for headers to maintain the "Linear-style" clean lines.

## Layout & Spacing
The layout follows a strict **4px baseline grid** to achieve the "Framer" level of precision. 

- **Grid System:** A 12-column fluid grid is used for the main dashboard content. Sidebars are fixed at 240px or 280px depending on nesting.
- **Safe Margins:** Desktop layouts use a 32px outer margin, scaling down to 16px on mobile.
- **Vertical Spacing:** Use `xl` (32px) and `xxl` (48px) to separate major sections, ensuring the "Minimalist" breathing room.
- **Contextual Padding:** Cards and containers should use a uniform 24px padding (`lg`) to ensure data density doesn't compromise clarity.

## Elevation & Depth
Elevation is achieved through **Tonal Layering** and **Glassmorphism** rather than traditional heavy shadows.

- **Level 0 (Base):** `#040B1A` — The infinite canvas.
- **Level 1 (Cards):** `#0A1628` — Soft background blur (12px) and the standard subtle border.
- **Level 2 (Overlays/Hovers):** `#0F1E35` — Used for active states and dropdowns, often accompanied by a subtle 1px inner highlight on the top edge.
- **Glow Effects:** Critical elements (like the active progress bar or status pills) emit a soft radial glow (`box-shadow: 0 0 15px rgba(0, 194, 255, 0.2)`).
- **Glassmorphism:** Modals and navigation bars should use a 20px backdrop-filter blur with a 40% opaque surface color to maintain context of the underlying data.

## Shapes
The shape language is "Rounded," balancing technical rigor with approachable software design.

- **Components:** Buttons and input fields use `rounded` (0.5rem) corners.
- **Containers:** Large dashboard cards and modals use `rounded-lg` (1rem) to create a soft, contained feel.
- **Status Pills:** Always use the maximum radius (pill-shaped) to distinguish them from interactive buttons.
- **Progress Bars:** Should have fully rounded ends to emphasize the "fluid" nature of marketing orchestration.

## Components
Consistent application of these components ensures the high-end dashboard feel.

- **Buttons:** 
  - *Primary:* Blue-to-Purple gradient background with white text.
  - *Secondary:* Ghost style with the standard subtle border and a blur hover effect.
- **Status Pills:** Small, uppercase text inside a semi-transparent background (10% opacity of the semantic color) with a 1px solid border of the same color.
- **Vertical Timeline Cards:** Used for orchestration steps. A thin vertical line (2px, `#0F1E35`) connects nodes. Active nodes glow with the primary blue.
- **Animated Progress Bars:** Uses a dual-tone gradient fill. The background track is `#0A1628`. The fill should have a subtle "shimmer" animation moving left to right.
- **Input Fields:** Dark base (`#040B1A`) with a subtle border. On focus, the border color changes to Primary Blue with a 2px outer glow.
- **Glassmorphism Containers:** Specifically for sidebar navigation or floating action panels, using high blur and low opacity to create a "Vercel-like" depth.