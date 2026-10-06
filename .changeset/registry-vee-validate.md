---
"@kappa-ui/registry": minor
---

Forms with VeeValidate and Zod. New `standard-schema` lib item with `toTypedSchema`, which lets VeeValidate 4 validate with Zod 4, Valibot or any other Standard Schema: VeeValidate 4 passes a raw Zod 4 schema without a single error, and `@vee-validate/zod` throws on Zod 4 unions. Each issue lands at its field's path, such as `emails[0].address`. New examples bind every kind of control: a bug report, a select and combobox, choice groups, number, tags, pin and range inputs, a field array, an invite dialog with an error from the server, and VeeValidate's own `Form` and `Field` components through the slot.

`lib/field-context` exports `focusFirstInvalid(root)`, which moves focus to the first invalid control in page order once the errors have rendered: the input, the select trigger, the slider thumb, or the box Tab would reach in a checkbox or radio group. A control that can't take focus, such as one in a hidden tab, is skipped. It works with any validation.

`TagsInputInput` no longer lets the form submit when Enter adds a tag on reka-ui 2.10, which cancels that Enter a tick late (unovue/reka-ui#2966). On reka-ui 2.11 nothing changes.
