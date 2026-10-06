---
"@kappa-ui/registry": patch
---

Enter in `InputDate`, `InputDateRange`, `InputTime` and `InputTimeRange` follows a native input's implicit submission exactly: it clicks the form's submit button, does nothing while that button is disabled, and in a form without one submits only when the field is the form's single text field. Before, a form without a submit button was submitted whatever else it held.
