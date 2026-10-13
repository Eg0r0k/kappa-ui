---
"@kappa-ui/core": patch
"@kappa-ui/registry": patch
---

Components follow `.dark` through tokens only. The `Tabs` pill fills with the new `--tabs-pill` token (the page background, and `--input` at 30% under `.dark`) instead of `dark:bg-input/30`, and `shimmer` takes its brighter dark highlight from a `.dark` value of `--shimmer-color` instead of `@variant dark`. Both now switch with the `.dark` class even in a project whose own `dark` variant is something else.
