---
"@kappa-ui/registry": minor
---

`Command` and `CommandDialog` take `ignore-filter`, which turns the built-in filter off for items you filter yourself: every item, group and separator stays visible and `CommandEmpty` never shows. `CommandInput` binds the search with `v-model`, and hears when selecting an item clears it. Items mounted after a search was set are filtered too.
