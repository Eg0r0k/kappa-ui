---
"@kappa-ui/core": patch
---

`v-ripple` measures its host in the host's own CSS pixels: under a scaled ancestor (`transform: scale()`, such as a zoomed canvas or the page behind an open `DrawerIndent`), a wave now starts under the pointer and is sized for the host instead of starting at the scaled point and growing from the shrunken rect. A keyboard wave is centred the same way.
