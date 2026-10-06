---
"@kappa-ui/registry": minor
---

Every `size` prop takes names from one scale, `xs` to `xl`, with `md` as the default. To move over:

- `Button`: `size="default"` becomes `size="md"`, or leave `size` out; `size="icon"` becomes `size="icon-md"`. The full set is `xs` to `xl` and `icon-xs` to `icon-xl`. `Toggle`, `ToggleGroup`, `ToggleGroupItem`, the `Toolbar` parts, `AlertDialogAction`, `AlertDialogCancel`, `ToastAction` and `InputGroupButton` take the same names, and keep their own defaults (`sm` in a toolbar, `xs` on a toast action and in an input group). `Pagination` hands its `md` to Button as it is. Button, Toggle and `ToggleGroupItem` set `data-variant`, `data-color` and `data-size` even when you leave them at their defaults.
- `AlertDialogContent`: `size="default"` becomes `size="md"`, still the default; `sm` is unchanged. The `size` option of `useConfirm`'s `confirm`, `alert` and `prompt` takes the same names.
- `Table` and `DataTable`: `density` becomes `size`, `data-density` becomes `data-size`, and the `TableDensity` type is now `TableSize`. `sm`, `md` and `lg` keep their 36, 44 and 52px rows; `xs` (28px) and `xl` (60px) are new, and DataTable's virtual row estimates cover them. The `table-density` example is now `table-sizes`.
- `DrawerMenu`: `size` takes `xs` to `xl` like Menu and reads the control scale, plus room for a thumb. `sm`, `md` and `lg` keep their 40, 48 and 56px rows, padding and icons; `xs` is 36px and `xl` 64px. Overriding a `--control-*` token on `:root` now resizes DrawerMenu rows as well.
- `Select` and `Combobox`: the list opens at the trigger's or anchor's size instead of always at `md`, so `<SelectTrigger size="xl">` opens an `xl` list. `size` on `SelectContent` or `ComboboxList` picks another. Behind an `as-child` button, set `size` on `ComboboxAnchor` to match the button. The Select list now sets its menu variables on `SelectContent` instead of its viewport, so a class such as `[--menu-item-height:2.5rem]` on `SelectContent` reaches the items.
- `Input`, `Textarea`, `InputFloating`, `SelectTrigger`, `ComboboxAnchor` and `Separator` set `data-size` with the default filled in, and the anchor sets `data-variant` too. With `as-child`, the anchor leaves the button's own `data-variant` and `data-size` alone.
