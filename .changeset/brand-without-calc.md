---
"@kappa-ui/registry": patch
---

The theme derives `--primary`, `--primary-foreground` and `--ring` from `--brand` without `calc()` over a colour channel. cssnano, which Nuxt runs on production CSS, can't parse `calc(c * 0.6)` and warned on every CSS chunk; the same chroma now comes from mixing `--brand` with a hueless colour, so the colours don't change.
