---
"@kappa-ui/registry": patch
---

ColorPicker follows a controlled `v-model` that an undo or a reset sets back to the colour the picker last wrote; it used to skip that value as its own echo and stay on the colour in between.
