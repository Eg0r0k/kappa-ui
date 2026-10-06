---
"@kappa-ui/registry": patch
---

Items install every npm dependency in the range the registry is tested against instead of its latest release: `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`, `@tanstack/vue-table` and `@tanstack/vue-virtual`, and in the examples `@formisch/vue`, `valibot`, `@internationalized/date` and `@vueuse/core`, so a major release the components were not written for no longer reaches new projects. `@lucide/vue` stays without a range: the shadcn-vue CLI installs the icon library a project picked and recognises it only by name. The Manual tab on each component page lists the same ranges, `reka-ui` included.
