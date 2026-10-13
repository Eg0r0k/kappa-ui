---
"@kappa-ui/registry": patch
---

`Toaster` renders the `ConfigProvider` direction as its viewport's `dir`, so the placement, the dismissing swipe and the progress bar agree: under `ConfigProvider dir="rtl"` a `bottom-end` toaster sits at the left edge and swipes left. An app that sets only `<html dir="rtl">` without a `ConfigProvider` now gets a left-to-right toaster (right edge, swipe right, bar shrinking to the left); wrap the app in `ConfigProvider dir="rtl"`.
