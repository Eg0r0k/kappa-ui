---
"@kappa-ui/registry": minor
---

Parts no longer style themselves from their root's `size` through `group-data-[size=…]` variants, which beat any plain class of yours. `size` is the density of the root, and a `class` on a part wins:

- Card, Empty, Alert and Stepper: `CardTitle`, `CardDescription`, `EmptyTitle`, `EmptyDescription`, `AlertTitle`, `AlertDescription`, `StepperTitle` and `StepperDescription` keep one text size at every root size (title-md/body-md, title-sm/body-md for Alert, title-sm/body-sm for Stepper). Empty's icon and gaps and Stepper's indicator number still follow the size, through `--empty-icon`, `--empty-header-gap`, `--empty-content-gap` and `--stepper-text` on the root.
- Menu and DrawerMenu labels, Menubar triggers and the Calendar heading, weekday cells and week numbers keep scaling with the size, through `--menu-label`, `--menubar-text`, `--calendar-heading` and `--calendar-label` (each with a `-leading` twin) set by the root.
- AlertDialog `size="sm"` centres its text through the content, so `text-start` on `AlertDialogHeader` wins; the footer keeps its two-column grid.
