---
"@kappa-ui/core": minor
---

`tailwind.css` adds two utilities for controls without a `color` prop: `tone-control` sets the `primary` tone with `--input` as the unchecked edge, and `tone-invalid` switches the tone, the edge and the halo to `destructive`. Put `tone-invalid` under the variant that marks the control invalid, such as `aria-invalid:tone-invalid`.
