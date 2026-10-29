# 03 — Design System

Reference images live in `reference-images/`. Study each one and match its visual language.

## Image 1 — `1-tennis-cards.png`
Warm beige canvas, large rounded white app container, very large bold grotesk headlines, pill tags on cards, pastel rounded cards (lime, lilac, teal) with a big photo/illustration at the bottom and a round arrow button "Read more", horizontal card carousel with round prev/next buttons. Use this card language for module cards, crop cards, product cards and the 4-module overview.

## Image 2 — `2-voyager-login.png`
Split-screen auth card. Left: brand, headline, social-style buttons row (render as DISABLED "demo" buttons), inputs with soft grey pill fields, dark green pill CTA. Right: large rounded photo with floating glass annotation pills connected by thin lines to points on the image (e.g. "Pune district . Black cotton soil", "1.2 km to Mandi"). Use for sign-in and create-account.

## Image 3 — `3-liquid-glass-nav.png`
Floating liquid-glass pill navigation bar: translucent, backdrop-blur, subtle inner highlight and specular edge, active item as a darker pill with icon and label. Desktop: floating top-center pill nav. Mobile: floating bottom pill tab bar. Items: Home, My Farm, Crops, Make, Market, Orders. Reuse the glass style for stat chips, weather chips, floating map controls and toasts.

## Image 4 — `4-cultivo-landing.png`
Minimal landing page. Pill nav with dark active pill, "Sign in" text link + outlined "Sign up free" pill, big centered headline ("Bring Fresh Growth To Agriculture" style, written for KrishiCycle), subtext, dark "Get Started" pill button with arrow, decorative four-point sparkles, a huge rounded landscape hero photo with overlay captions, then a stats row (large numbers + small labels), then a big problem statement paragraph with small tabs.

## Palette (CSS variables + Tailwind tokens)
- canvas `#EFEBE3`, white cards
- ink `#0F1A14`
- deep green `#1F5A3D` (primary)
- lime `#C8F23B` (accent)
- lilac `#C9B6F2`
- teal `#7CCFC4`
- amber `#F4B740` (warning)
- red `#D9534F` (error)

Rounded corners 24-32px on cards, full pill on buttons/tags.

## Type and accessibility
Headings Manrope/Plus Jakarta Sans, body Inter, Devanagari Noto Sans Devanagari. Touch targets min 44px, body 16px+, high contrast. Never rely on colour alone (pair colour with icon/text).

## Photography
Unsplash image URLs for agriculture/farm scenes. ALWAYS add an `onError` fallback to a CSS gradient + inline SVG illustration so nothing ever shows a broken image (build a reusable `ImageWithFallback`).

## Glassmorphism
backdrop-blur, semi-transparent white/green layers, 1px light borders, soft shadows. Use sparingly for performance.
