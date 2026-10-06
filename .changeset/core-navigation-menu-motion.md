---
"@kappa-ui/core": minor
---

`tailwind.css` adds the `navigation-menu-motion` utility, which slides a navigation menu panel in from the side of the trigger you came from and out the other way, from Reka UI's `data-motion`. A horizontal menu's `data-motion` already follows the screen in right-to-left text, so unlike `drawer-menu` it isn't mirrored; a vertical one slides up and down. `--navigation-menu-motion-distance` sets how far, 25% of the panel by default. Reduced motion turns it off.
