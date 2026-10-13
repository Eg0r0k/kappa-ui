---
"@kappa-ui/registry": patch
---

Menubar switches between menus at once: the menu being left closes without its fade, so ArrowLeft back into a menu that was still closing keeps focus in it instead of dropping it to `<body>`. Closing by Escape, a pick or an outside click still fades.
