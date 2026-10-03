---
"@kappa-ui/registry": patch
---

Items that use Reka UI now install `reka-ui` with the range `@kappa-ui/core` takes it as a peer in (`^2.10.5`) instead of the latest release, so a Reka major that the components were not written for no longer reaches new projects or fails the install against core's peer.
