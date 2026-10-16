---
"@kappa-ui/core": minor
---

The scrollbar's space is kept only while an overlay locks scrolling, as Base UI does, instead of on every page. `@kappa-ui/core/tailwind.css` no longer sets `html { scrollbar-gutter: stable }`, so a page too short to scroll no longer shows an empty strip along its edge on Windows. Dialog, Drawer, Select, Menu, Popover and DatePicker set `scrollbar-gutter: stable` on `<html>` while the page is locked and it would otherwise scroll, and remove it afterwards; a gutter your stylesheet already reserves is left alone. Keep `ConfigProvider` with `:scroll-body="false"`. Want the old always-on gutter? Add `html { scrollbar-gutter: stable; }` to your stylesheet.
