---
"@kappa-ui/registry": minor
---

Parts follow their root's `size` through CSS variables instead of the context, so a class on a part wins over the size. PinInput sets `--pin-input-slot`, TagsInput `--tags-input-line` and `--tags-input-delete`, and PinInput, InputNumber, TagsInput and InputGroup set `--control-text` and `--control-text-leading` for the field inside (`textControlText` and `textControlInnerText` in `@/ui/input`). NavigationMenu's triggers and links read the `--nav-*` variables of the menu instead of setting their own, and DataTable's sort buttons and row toggles shrink at `xs` through the table's variables. PinInput's slots now sit `--control-gap-*` apart (2px wider at `sm`, `lg` and `xl`); nothing else moves. `inputNumberInputVariants`, `tagsInputInputVariants` and `tagsInputItemDeleteVariants` became the strings `inputNumberInput`, `tagsInputInput` and `tagsInputItemDelete`, `inputGroupControlText` is gone, and `pinInputSlotVariants` lost its `size` key.
