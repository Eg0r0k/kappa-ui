---
"@kappa-ui/registry": patch
---

`InputTime` and `InputTimeRange` stay empty when the parent clears their `v-model` and a change of `granularity` or `hourCycle` then remounts the segments; they used to bring back the last typed value.
