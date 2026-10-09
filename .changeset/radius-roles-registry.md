---
"@kappa-ui/registry": minor
---

Corners come in three roles: `rounded-control-*`, `rounded-surface-*` and `rounded-item-*`, each scaled from `--radius` and tunable on its own with `--control-radius`, `--surface-radius` and `--item-radius`, on `:root` or any element. Every component uses them, and `cn()` merges them, so a `class` prop still wins.

- `--control-radius` was the Input family's frame variable. It now sets every control, and the frames use `--frame-radius`.
- Nested parts no longer turn square at small radii: the InputGroup button, the InputNumber steppers, the TagsInput chips, the DatePicker trigger and the Toast and Tour close buttons.
- Menus, lists, pill tabs, the menubar and the toolbar wrap their corners around their items. Pill tabs are rounder (12/8px at md instead of 8/4px), menus and lists grow by up to 2px, and their rows at sizes `xs` and `xl` follow their height. Item `sm` takes 8px instead of 6.4px.
