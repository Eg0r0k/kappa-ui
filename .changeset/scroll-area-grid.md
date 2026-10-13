---
"@kappa-ui/registry": minor
---

ScrollArea virtualizes columns as well as rows (`virtualize.columns`), so a wide virtual grid gets a horizontal bar and `data-overflow-x-*`. The slot renders once per visible cell with `{ item, index, column }`, and the exposed API gains `scrollToColumn` and `columnVirtualizer`.
