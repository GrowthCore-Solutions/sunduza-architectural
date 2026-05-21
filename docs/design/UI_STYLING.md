# UI Styling System

Sunduza uses **Tailwind CSS v4** for tokens and utilities, plus a **semantic custom CSS layer** for repeated composition. The goal is to strengthen the existing brand without redesigning layouts.

## Layer cake

```
app/layout.tsx          → Next/font CSS variables (--font-display, --font-body)
app/globals.css         → imports only + global base (scroll, focus, a11y)
app/styles/tokens.css   → @theme inline (colors, shadows, motion, z-index)
app/styles/utilities.css → grain, grid, media helpers
app/styles/components.css → surfaces, typography, forms, admin patterns
app/styles/pages.css    → hero, stats, CTA, project media shells
src/client/components/ui/* → thin primitives wired to semantic classes
features + pages        → short class lists (semantic + layout utilities)
```

## When to use what

| Need | Use |
|------|-----|
| One-off spacing or responsive tweak | Tailwind utilities in TSX |
| Repeated panel / card / eyebrow / tab rail | Semantic class in `components.css` |
| Page-specific band (hero, CTA) | Class in `pages.css` |
| New brand color or shadow | Extend `@theme` in `tokens.css` |

Do **not** hard-code hex values in TSX. Add a token, then reference `var(--color-*)` or Tailwind semantic names (`text-ink`, `bg-paper`).

## Semantic classes (reference)

### Surfaces

- `surface-panel` — primary white card
- `surface-panel-muted` / `surface-panel-soft` — lighter variants
- `surface-interactive` — hover lift + border emphasis (respects reduced motion)
- `state-panel` — empty / error messaging

### Typography

- `type-eyebrow` — uppercase label (public pages)
- `type-eyebrow-hero` — wider tracking on hero
- `type-display` / `type-display-light` — serif headings
- `type-lead` — intro body copy

### Layout

- `page-shell` — paper grain + page background
- `page-shell-inner` — max-width content column
- `content-grid-two-col` — booking-style two-column grid

### Admin

- `admin-page-header`, `admin-stat-card`, `admin-list-panel`
- `tab-rail` + `tab-rail-item` + `tab-rail-item--active`
- `list-row` — bordered list item

### Marketing (pages.css)

- `hero-band`, `hero-overlay`, `hero-inner`, `stats-strip`, `service-card`, `cta-band`, `media-card`, `project-hero-media`

### Forms

- `field-control` — input/textarea (used by ui primitives)
- `field-select` — native `<select>` styling

## ui/ primitives

Files under `src/client/components/ui/` should stay **API-stable** (Radix, CVA variants). Extend appearance by:

1. Mapping base styles to semantic classes (`surface-panel`, `field-control`)
2. Adding variants only when behavior changes, not for one page

Do not fork primitives per page.

## Accessibility

- Global `:focus-visible` in `globals.css` base layer
- Hover transforms gated in `@media (prefers-reduced-motion: no-preference)` for interactive surfaces
- Existing `prefers-reduced-motion: reduce` reset remains in base

## Adding a new page

1. Wrap content in `page-shell` + `page-shell-inner` when using the standard marketing layout
2. Use `PageHeader` for title blocks
3. Prefer `surface-panel` over copying border/shadow utilities
4. Run `npm run build` and spot-check mobile + desktop

## Related docs

- [COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md) — component tree and laws
- [LOCKED_DESIGN.md](./LOCKED_DESIGN.md) — locked product decisions
