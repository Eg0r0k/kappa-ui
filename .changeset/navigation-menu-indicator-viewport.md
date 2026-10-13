---
"@kappa-ui/registry": patch
---

`NavigationMenuIndicator` renders nothing in a `NavigationMenu` with `:viewport="false"`, where it used to sit under the first item whichever trigger was open, and warns once about it in development.
