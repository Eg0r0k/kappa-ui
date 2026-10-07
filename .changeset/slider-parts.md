---
"@kappa-ui/registry": minor
---

Slider's parts are components of their own: `SliderTrack`, `SliderRange`, `SliderThumb` and `SliderHandle`, each taking a `class`. Slider still draws them itself when given no children, so `<Slider v-model>` works as before. Lay them out in its slot, which gives `{ thumbs, values }`, to restyle a part or to name each thumb of a range on its own.
