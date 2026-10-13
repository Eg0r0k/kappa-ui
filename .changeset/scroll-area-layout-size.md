---
"@kappa-ui/registry": patch
---

ScrollArea measures its content in layout pixels, as it measures its viewport: under a scaled ancestor, and in a Dialog, Popover or Menu that opens with the default scale-in, the content was measured short for its whole life, so the thumb came out too long, the end fade dropped out and `reachEdge` fired early.
