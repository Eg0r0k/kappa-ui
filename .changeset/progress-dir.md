---
"@kappa-ui/registry": patch
---

`Progress` renders the `ConfigProvider` direction as its root's `dir`, so the determinate fill and the indeterminate animations read one source: before, `<html dir="rtl">` without a `ConfigProvider` mirrored the carousel while the fill still grew from the left. Such an app now gets a left-to-right bar in both modes; wrap the app in `ConfigProvider dir="rtl"`.
