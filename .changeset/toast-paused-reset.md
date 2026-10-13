---
"@kappa-ui/core": patch
"@kappa-ui/registry": patch
---

Closing the last toast with the mouse no longer leaves the toaster paused: the next toast's progress bar runs, and in Firefox its timer starts and it closes on time. `ToastRecordRoot` clears Reka's paused flag when the last toast unmounts, and `Toaster` clears its own when its list empties.
