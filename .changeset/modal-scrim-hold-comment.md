---
"@kappa-ui/core": patch
"@kappa-ui/registry": patch
---

The modal scrim's hold renders a comment instead of a hidden `<span>`, and `PopoverContent`, `DatePickerContent` and `Menu` put it after their slot: `PopoverContent as-child` renders the consumer's element as the panel instead of moving the panel's role, classes and `data-slot` onto the hidden span, and a panel's first element child is the consumer's again.
