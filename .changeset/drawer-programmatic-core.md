---
"@kappa-ui/core": minor
---

`openDrawer(component, props?, options?)` and `defineDrawer(component, { props, keepMounted, ...options })` in `@kappa-ui/core/drawer` open a drawer from code through the dialog service, with `Drawer`'s props as options. A dialog manager entry can carry a root component, which `DialogHost` renders in place of Reka's `DialogRoot`.
