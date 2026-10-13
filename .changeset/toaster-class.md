---
"@kappa-ui/registry": patch
---

A class on `Toaster` now wins over its built-in styles: `w-96`, `bottom-24` or `[--toast-gap:1rem]` set the viewport's width, inset and spacing. The toaster's `<style>` block sits in `@layer components` instead of outranking every utility.
