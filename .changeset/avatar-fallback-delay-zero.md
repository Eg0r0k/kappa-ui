---
"@kappa-ui/registry": patch
---

`AvatarFallback :delay-ms="0"` shows the fallback once the image fails, like leaving `delayMs` out; Reka's fallback treated `0` as a delay that never started, so the avatar stayed blank.
