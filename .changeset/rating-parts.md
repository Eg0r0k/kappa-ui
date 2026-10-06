---
"@kappa-ui/registry": minor
---

`Rating` is built from parts: `Rating` holds the value and gives `items`, and each `RatingItem` draws one star, so `<Rating v-model="stars" v-slot="{ items }"><RatingItem v-for="item in items" :key="item" :item="item" /></Rating>`. A custom icon goes inside `RatingItem`, with `filled` telling the empty layer from the filled one; the `icon` and `empty-icon` slots are gone. Showing a score is its own part pair, `RatingDisplay` with `RatingDisplayItem`, which takes a `value` and draws it exactly as one `role="img"` picture; the `readonly` prop is gone.
