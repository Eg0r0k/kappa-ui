---
"@kappa-ui/core": patch
---

`tailwind.css` builds next to a plain shadcn-vue theme. Every kappa token it reads now carries its default from the `tokens` item as a fallback: `--color-destructive-foreground`, the `success`, `warning` and `info` colours with their `-foreground` and `-text`, `--state-hover`, `--state-pressed`, `--state-selected`, `--press-scale` and `--press-duration`. Before, a project without the `tokens` item failed the Tailwind build with `Could not resolve value for theme function: theme(--color-destructive-foreground)`. With the tokens installed nothing changes: their values still win. The shadcn tokens, such as `--color-primary`, `--color-foreground` and `--color-input`, stay required.
