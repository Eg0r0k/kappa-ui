---
"@kappa-ui/registry": patch
---

`InnerLoading` no longer sets `aria-busy` on its root while loading. The covered content is already `inert`, and `aria-busy` also held back the overlay's `role="status"` inside it, so screen readers could skip the status the overlay shows.
