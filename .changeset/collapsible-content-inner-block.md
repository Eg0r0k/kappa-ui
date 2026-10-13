---
"@kappa-ui/registry": patch
---

`CollapsibleContent` puts its `class` on a new `div` inside the animated panel, as `AccordionContent` does, so padding, a border or a display class no longer keep a closed panel visible: Chromium left an empty strip, and Safari, which has no `hidden="until-found"`, showed closed content styled with a display class. The DOM gains that inner `div`; a selector or style that targeted the panel element through your `class` now finds it one level down.
