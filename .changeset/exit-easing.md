---
"@kappa-ui/core": patch
"@kappa-ui/registry": patch
---

Exits now use the decelerating curve, like entrances. Collapsible, Accordion, the overlay surfaces (Popover, Select, Menu, Tooltip), Drawer, Toast and InnerLoading used to close on `--ease-emphasized-accelerate`, which holds still for most of its duration and then snaps shut; closing on `--ease-standard-decelerate` starts at once and settles gently, so the same duration feels faster. The tokens themselves are unchanged.
