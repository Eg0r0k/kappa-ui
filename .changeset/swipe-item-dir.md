---
"@kappa-ui/core": patch
"@kappa-ui/registry": patch
---

`SwipeItem` takes a `dir` prop and renders its direction (the prop, else `ConfigProvider`) as the row's `dir`, so the drag, the arrow keys and the strips' placement agree: before, in `<html dir="rtl">` without a `ConfigProvider`, a drag revealed the empty side and the open strip sat outside the row. Such an app now gets left-to-right rows (strips do not swap); set `dir="rtl"` on the row or wrap the app in `ConfigProvider dir="rtl"`.
