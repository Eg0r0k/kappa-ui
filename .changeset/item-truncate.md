---
"@kappa-ui/registry": patch
---

Item: a long title or description no longer pushes the content under the media or past the row's edge. `ItemContent` can shrink (`min-w-0`) and `ItemTitle` stops at its column (`max-w-full`), so `line-clamp-1` on the title, or a `truncate` span inside it, cuts the text with an ellipsis.
