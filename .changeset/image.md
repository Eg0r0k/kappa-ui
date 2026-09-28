---
"@kappa-ui/registry": minor
---

Add Image, with ImageLoading and ImageError: an image in a ratio box with `fit` and `position`, native `srcset`, `sizes` and `<picture>` sources, lazy loading by default, and load and error tracking that holds across SSR hydration. It shows its loading layer while `src` is `undefined` and its error layer when `src` is `null`. The API follows Nuxt Image and Quasar's QImg, without providers.
