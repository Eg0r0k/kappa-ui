---
"@kappa-ui/core": patch
---

SwipeViews: when the page holding focus turns inert after a page change (a button in it that moves to the next page, say), focus moves to the new page itself instead of dropping to `<body>`. The page gets `tabindex="-1"` if it has none, and nothing inside it is focused, so no virtual keyboard opens after a swipe.
