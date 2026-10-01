---
"@kappa-ui/registry": patch
---

ImageLoading and ImageError leave the render tree (`display: none`) while their state is not showing, so the default Spinner stops animating behind loaded images. The fade still plays through `transition-behavior: allow-discrete` and `@starting-style`, and a display class passed to a layer still wins while it is shown.
