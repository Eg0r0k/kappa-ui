---
"@kappa-ui/registry": patch
---

A bare `<Spinner />` is `1em` square, the size of the surrounding text, instead of as wide as its container; a size class or a Button still sizes it. Its styles sit in `@layer components`, so a class such as `animate-none` now replaces its animation.
