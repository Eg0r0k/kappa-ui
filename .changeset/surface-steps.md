---
"@kappa-ui/registry": minor
---

Menus, select lists and popovers no longer melt into the dialog or card they open on. Dialogs, alert dialogs and drawers take a new `--dialog` surface, and in the dark theme `--popover` sits a step above it (0.24 instead of 0.205). Menus and popovers draw their shadow from a new `--shadow-popover`, dialogs from `--shadow-dialog`: a 1px ring over the old shadow in the light theme, and in the dark theme a top highlight, a ring inside and out and a layered drop, so two surfaces of one tone keep an edge between them. A theme without these tokens falls back to `--popover`, `--shadow-lg` and `--shadow-xl`, which is how they looked before; set the role shadows to those to drop the edge.
