---
name: Adom Shops Administrative Interface
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#3e4a3d'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#6e7b6c'
  outline-variant: '#bdcaba'
  surface-tint: '#006e2d'
  primary: '#006b2c'
  on-primary: '#ffffff'
  primary-container: '#00873a'
  on-primary-container: '#f7fff2'
  inverse-primary: '#62df7d'
  secondary: '#575e70'
  on-secondary: '#ffffff'
  secondary-container: '#d9dff5'
  on-secondary-container: '#5c6274'
  tertiary: '#825100'
  on-tertiary: '#ffffff'
  tertiary-container: '#a36700'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#7ffc97'
  primary-fixed-dim: '#62df7d'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005320'
  secondary-fixed: '#dce2f7'
  secondary-fixed-dim: '#c0c6db'
  on-secondary-fixed: '#141b2b'
  on-secondary-fixed-variant: '#404758'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
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
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-base:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 2rem
  gutter: 1.5rem
  margin-mobile: 1rem
  sidebar-width: 280px
---

## Brand & Style
The design system focuses on utility, clarity, and precision for internal operations. It adopts a **Modern Corporate** style inspired by systematic frameworks, prioritizing rapid data processing and high-density information management without sacrificing visual breathing room. 

The aesthetic is defined by a rigorous adherence to a flat design language, utilizing "ghost" borders and systematic spacing rather than decorative effects. It aims to evoke a sense of reliability and calm efficiency, ensuring that administrative users can navigate complex shop management tasks with minimal cognitive load. The UI remains neutral, allowing the primary green to serve as a functional signal for "action" and "success."

## Colors
The palette is built on a foundation of high-contrast neutrals to ensure maximum legibility. 
- **Primary Green (#16a34a):** Reserved for primary calls to action, active navigation states, and positive status indicators.
- **Surface & Backgrounds:** Use `#ffffff` for the main content area cards and `#f9fafb` for the application canvas to create subtle depth.
- **Functional Accents:** Amber (#f59e0b) is utilized strictly for warning states like low-stock alerts, while Red (#dc2626) is dedicated to destructive actions and error feedback.
- **Borders:** A consistent `#e5e7eb` is used for all structural divisions, ensuring a clean, "boxed" layout that mirrors modern documentation sites.

## Typography
This design system utilizes **Inter** for all UI elements to leverage its exceptional readability at small sizes. The scale is built around a **14px base**, which is the standard for data-rich dashboards.

- **Weighting:** Use `600 (SemiBold)` for headings and `500 (Medium)` for interactive labels/buttons. Use `400 (Regular)` for all long-form data and body text.
- **Letter Spacing:** Headlines utilize a slight negative tracking (-0.01em to -0.02em) to appear tighter and more professional.
- **Hierarchy:** Ensure a clear distinction between page headers and section headers. Use `mono-sm` for SKU numbers, transaction IDs, or code-based attributes.

## Layout & Spacing
The layout follows a **Fluid Grid** model with fixed-width constraints for readability on ultra-wide monitors. 

- **Grid:** A 12-column grid is used for the main dashboard area.
- **Rhythm:** An 8pt spacing system is the primary driver, but for the 14px text base, 4px increments are used for fine-tuning (e.g., label-to-input spacing).
- **Structure:** The interface features a persistent left-hand sidebar (280px) for global navigation. Main content is housed within "Shell" containers with a minimum 32px (2rem) padding on desktop.
- **Responsive:** On mobile, the sidebar collapses into a sheet/drawer, and container padding reduces to 16px.

## Elevation & Depth
In line with the requested aesthetic, this design system avoids heavy shadows and physical metaphors. 

- **Tonal Layers:** Depth is created through background color shifts. The base canvas is `#f9fafb`, while primary interactive cards and panels are `#ffffff`.
- **Low-Contrast Outlines:** All containers, inputs, and cards must feature a 1px solid border (`#e5e7eb`). This "boxed" approach provides clear separation without the need for shadows.
- **Focus States:** Active states for inputs or buttons use a 2px offset ring in the primary green color to ensure accessibility and clear user focus.
- **Shadows:** Only use a single, very subtle shadow for floating elements like popovers, dropdown menus, or modals: `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`.

## Shapes
The design system employs a **Rounded** shape language to soften the professional tone and make the interface feel modern and approachable. 

- **Base Radius:** 14px (0.875rem) is the standard for all primary components including buttons, cards, and input fields.
- **Consistency:** Ensure that nested elements (like an image inside a card) have a slightly smaller radius (10px - 12px) to maintain visual harmony with the outer 14px container.

## Components
- **Buttons:** 14px border radius. Primary buttons use a solid `#16a34a` fill with white text. Secondary buttons use a white fill with a `#e5e7eb` border and `#111827` text.
- **Inputs:** 14px border radius with a 1px border. Use a 14px font size for text entry to prevent iOS zoom-on-focus and maintain consistency.
- **Cards:** White background, 14px radius, 1px `#e5e7eb` border. Padding should be generous, typically 24px (1.5rem) for internal content.
- **Chips/Badges:** Small, 12px radius or pill-shaped. Use subtle background tints (e.g., a 10% opacity green for "Active" status) with high-contrast text.
- **Lists/Tables:** Use a "Clean Table" approach—no vertical borders, only horizontal dividers in `#e5e7eb`. Rows should have a subtle hover state using `#f9fafb`.
- **Icons:** Use Lucide-style 2px stroke-width icons. Icons should be sized at 20px for buttons and 18px for sidebar navigation to maintain balance with 14px text.
- **Checkboxes/Radios:** Primary green fill when checked. 4px radius for checkboxes to match the overall rounded aesthetic.