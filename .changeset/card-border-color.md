---
"@kappa-ui/registry": patch
---

`border-b` on `CardHeader` and `border-t` on `CardFooter`, the Card page's divider recipe, draw in `--border` instead of the text colour: both parts carry `border-border`, since Tailwind's preflight leaves borders at `currentColor`.
