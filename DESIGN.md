---
name: Kinetic Logic
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#584235'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#8c7263'
  outline-variant: '#e0c0af'
  surface-tint: '#994700'
  primary: '#994700'
  on-primary: '#ffffff'
  primary-container: '#ff7a00'
  on-primary-container: '#5c2800'
  inverse-primary: '#ffb68b'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#005ac2'
  on-tertiary: '#ffffff'
  tertiary-container: '#6d9fff'
  on-tertiary-container: '#003577'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbc8'
  primary-fixed-dim: '#ffb68b'
  on-primary-fixed: '#321200'
  on-primary-fixed-variant: '#753400'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  mono-code:
    fontFamily: monospace
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 48px
  sidebar-width: 260px
  container-max: 1440px
---

## Brand & Style

The design system is engineered for efficiency, clarity, and precision, catering to developers and prompt engineers who require high-density information management without cognitive fatigue. It adopts a **Modern Corporate** aesthetic with a utilitarian core, blending the reliability of enterprise software with the vibrant energy of emerging AI technologies. 

The visual language emphasizes a "content-first" philosophy, where the interface recedes to highlight user-generated prompts and LLM outputs. It evokes a sense of professional mastery through structured layouts, high-contrast navigation, and purposeful splashes of energetic color.

## Colors

The palette utilizes high-contrast zoning to differentiate between orchestration (the sidebar) and execution (the content area).

- **Primary (Vibrant Orange):** Reserved strictly for primary call-to-actions, status highlights, and active state indicators.
- **Secondary (Deep Navy):** Used for the structural shell (sidebars and headers) to provide a grounded, authoritative frame.
- **Backgrounds:** The main workspace uses a very light gray (`#F8FAFC`) to reduce eye strain, while cards and inputs use pure white to pop against the substrate.
- **Accents:** A technical blue is used for secondary interactive elements like links and multi-select tags.

## Typography

This design system uses a dual-font strategy. **Manrope** is used for headlines to provide a modern, slightly geometric character that feels refined and contemporary. **Inter** is used for all functional UI text, body copy, and data displays due to its exceptional legibility at small sizes and neutral tone.

For prompt editors and variable blocks, a monospaced font stack is mandatory to ensure character alignment and readability of technical syntax.

## Layout & Spacing

The system employs a **Fluid Grid** with fixed-width structural anchors. The application follows a "Dashboard Shell" model:
- **Navigation Rail:** A fixed-width left sidebar (`260px`) contains primary navigation.
- **Utility Header:** A slim top bar for breadcrumbs and global actions.
- **Content Canvas:** A fluid area that uses a 12-column grid system for organizing cards and tables.

Spacing follows a strict 4px/8px baseline rhythm to maintain vertical alignment. Large margins (`32px`) are used between major functional blocks to preserve the "minimalist" feel and prevent the UI from feeling cluttered during complex prompt engineering tasks.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layering** and **Low-Contrast Outlines** rather than heavy shadows.

- **Level 0 (Floor):** Neutral background (`#F8FAFC`).
- **Level 1 (Cards/Inputs):** White surface with a 1px solid border (`#E2E8F0`).
- **Level 2 (Dropdowns/Modals):** White surface with a subtle, diffused shadow (0px 4px 12px rgba(0,0,0,0.05)) to indicate temporary interaction.
- **Active State:** Elements being interacted with may receive a subtle primary-colored glow or a thicker border to indicate focus.

## Shapes

The design system utilizes **Soft** roundedness (`4px` for standard components, `8px` for cards). This maintains a professional, "engineered" look that is approachable but not overly playful. 

- **Inputs and Buttons:** 4px radius.
- **Containers/Cards:** 8px radius.
- **Status Badges:** Fully rounded (pill-shaped) to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Solid Vibrant Orange with white text. High visibility for "Execute" or "Save" actions.
- **Secondary:** Transparent with a Deep Navy border and text.
- **Ghost:** Text-only for low-priority navigation.

### AI Settings (Specialized)
- **Temperature Sliders:** Uses a custom track where the "hotter" (higher) end of the slider shifts slightly towards the primary orange, while the "cooler" end remains neutral.
- **Token Counters:** Small, monospaced labels embedded within input footers to track prompt length.

### Data Tables
- Clean, borderless rows with a subtle hover state (`#F1F5F9`).
- **Status Badges:** Use semantic colors with low-opacity backgrounds (e.g., Green for "Live", Amber for "Draft", Red for "Error").

### Form Inputs
- Top-aligned labels using `label-sm` typography.
- Focus states utilize a 2px outer ring of the primary orange or a soft blue.
- Code blocks in inputs should have a distinct light-gray background to separate logic from natural language.

### Navigation Sidebar
- Deep Navy background.
- Active items use a "Left Border" highlight in primary orange and a subtle background tint to indicate selection.
