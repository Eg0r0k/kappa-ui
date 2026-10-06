---
"@kappa-ui/registry": minor
---

Checkbox, Radio, Switch, Slider, Progress, Stepper and `TabsList` take `color`: `primary` (the default), `neutral`, `destructive`, `success`, `warning`, `info`, or any name you declare on `[data-slot][data-color="<name>"]`, as on Button. The root carries `data-color`. On the choice controls the unchecked edge stays `--input` and an invalid control still turns `destructive`. `CheckboxGroup` and `RadioGroup` pass their `color` to every control in them without one, and `ChoiceGroup` takes `color` for the selected card's edge and row's tint. On Tabs it paints the `line` indicator; on a Stepper, the active step. Switch, Checkbox, Radio and Slider now set `data-size`, `md` by default. They need the `@kappa-ui/core` release that lets `tone-control` follow `data-color`.

Progress draws its step names in the tone's text colour. `class="text-success"` still recolours the bar but no longer the step names: use `color="success"` instead.
