---
"@kappa-ui/core": patch
"@kappa-ui/registry": patch
---

No component styles an element through a `:has()` on its parent or group any more. Chrome restyles the whole subtree of every `:has()` anchor above a node that is added or removed, once some rule puts `:has()` away from the element it styles: a page wrapped in one such anchor recalculated every element for each list row it mounted. The Dialog, Drawer and Tour headers, the InputGroup and InputNumber insets, the Combobox clear button, the InputFloating notch, a FieldLabel beside a disabled checkbox or radio, the Rating ring, and the Slider and ScrollArea examples now read their neighbours with `~` or a `:has()` on the element itself. The InputGroup addons fade through a variable that the group sets. FileUpload, Image, Marquee and DataTable mark the state on an element instead: the hidden input's focus, an ImageError inside, keyboard focus, and the body above pinned bottom rows. `scripts/has-selectors.test.ts` keeps the pattern out.

`useSwipeSnap` no longer flushes styles for an instant move that leaves the offset where it is, such as new points at rest.
