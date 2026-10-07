---
"@kappa-ui/registry": minor
---

InfiniteScroll takes `shouldLoad`, the "time to load?" check `useInfiniteScroll()` already had: it gets the direction and replaces the `offset` check, and returning `undefined` falls back to `offset`.
