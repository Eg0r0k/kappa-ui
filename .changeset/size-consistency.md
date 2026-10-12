---
"@kappa-ui/registry": minor
---

`size` works the same way everywhere. Every component exports its size type (`AlertSize`, `BadgeSize`, `CardSize`, `CheckboxSize`, `RadioSize`, `SwitchSize`, `EmptySize`, `InputFloatingSize`, `ItemSize`, `ListboxSize`, `SeparatorSize`, `SliderSize`, `StepperSize`, `TabsSize`, `TextareaSize`, `TimelineSize`) and the props take it without `null`; Button-based parts take `ButtonSize`, Input `TextControlSize`, SelectTrigger `SelectSize` and Tree `TreeSize`. ToggleGroup and ToolbarToggleGroup carry `data-size` on the group as well. Table's row heights moved into `tableSize`, so a class on DataTable's `ui.table` overrides `--table-row-h` at every size, not only at `md`.
