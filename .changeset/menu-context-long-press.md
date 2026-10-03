---
"@kappa-ui/registry": patch
---

A `Menu` with `context-menu` marks its target with `data-kappa-longpress` while it is attached, so a tooltip on that target leaves the long press to the menu, as it already did for the context menu trigger. `MenuShortcut` renders left to right in right-to-left text, as the dropdown menu's shortcut did.
