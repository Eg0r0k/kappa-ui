---
"@kappa-ui/registry": patch
---

`scroll-fade` brings the `tokens` item. The core stylesheet it imports reads the status colours and `--destructive-foreground` from the tokens, so adding it by URL to a project with a plain shadcn-vue theme failed the Tailwind build with `Could not resolve value for theme function: theme(--color-destructive-foreground)`.
