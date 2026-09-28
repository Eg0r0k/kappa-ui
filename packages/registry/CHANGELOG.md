# @kappa-ui/registry

## 0.3.0

### Minor Changes

- [`311dead`](https://github.com/Eg0r0k/kappa-ui/commit/311deadeebb2b43443462327ce3d634d9d7d0f03) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Add Alert: `Alert`, `AlertTitle`, `AlertDescription` and `AlertActions`, with Button's variants and colours, five sizes and two orientations.

- [`a014941`](https://github.com/Eg0r0k/kappa-ui/commit/a014941ab88c6a6d8df75000d74e3fdaa8be67ec) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Add Breadcrumb, from shadcn-vue.

- [`e58b25a`](https://github.com/Eg0r0k/kappa-ui/commit/e58b25a4fef78c248f70cfb54a340adae4b4379a) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Add an `info` colour: `--info`, `--info-foreground` and `--info-text` tokens, `data-color="info"`, and `info` on Button, Badge and toasts.

- [`95f4d61`](https://github.com/Eg0r0k/kappa-ui/commit/95f4d615d81ad36edd1ec0a142cb917b3b4bb2b1) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Add Progress, ported from Nuxt UI, with shadcn's `ProgressLabel` and `ProgressValue`. Core gains the `animate-progress-*` utilities it animates with.

- [`3c1d762`](https://github.com/Eg0r0k/kappa-ui/commit/3c1d76299b51a1a766887e9a40116d9eb1a8532c) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Add shadow tokens `--shadow-xs` to `--shadow-xl`, used as `shadow-shadow-xs` to `shadow-shadow-xl`. Dialogs, popovers, menus, toasts, slider thumbs and the pill tab indicator read them, so a theme can change every elevation at once.

### Patch Changes

- [`2e93a46`](https://github.com/Eg0r0k/kappa-ui/commit/2e93a46bc9f26ffa4cb93510770f612f2427ae5a) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Darken the light theme's `--muted-foreground` from `oklch(0.54 0 0)` to `oklch(0.53 0 0)`, so muted text on `--muted` fills, like inactive tabs, reaches 4.5:1 (it was 4.42:1).
- Updated dependencies [[`e58b25a`](https://github.com/Eg0r0k/kappa-ui/commit/e58b25a4fef78c248f70cfb54a340adae4b4379a), [`95f4d61`](https://github.com/Eg0r0k/kappa-ui/commit/95f4d615d81ad36edd1ec0a142cb917b3b4bb2b1)]:
  - @kappa-ui/core@0.3.0

## 0.2.0

### Minor Changes

- [`08ffd28`](https://github.com/Eg0r0k/kappa-ui/commit/08ffd28f416738d8e14e67adf44f1c7a14cda855) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `reka-ui` is now a peer dependency of `@kappa-ui/core` (`^2.10.5`), so your project and kappa-ui share one copy. The primitive re-exports (`@kappa-ui/core/checkbox`, `@kappa-ui/core/utils`, …) are gone: components import `reka-ui` directly, and adding one installs `reka-ui` like any shadcn-vue component. `@kappa-ui/core/menu` stays and, in development, names the missing parts if a Reka upgrade drops them. Breaking for code that imported the removed subpaths: import the same names from `reka-ui`.

- [`c935598`](https://github.com/Eg0r0k/kappa-ui/commit/c935598b16f4049558e8d5c2c95501683c4f5948) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Colour and variant are separate axes: `[data-slot][data-color]` rules in `@kappa-ui/core/tailwind.css` set `--c-*` variables that Button and Badge variants read, so a custom colour is one CSS rule plus `color="<name>"`. Core gains the `touch-target`, `touch-target-margin`, `touch-target-wrapper`, `state-halo`, `choice-row`, `slider-axis`, `slider-touch` and `slider-range-inset` utilities and the `scrollbar-gutter` base rule. The `choice-group`, `text-control`, `menu-styles` and `overlay` registry items are gone: their styles now live in `checkbox`, `input`, `menu` and `popover`.

### Patch Changes

- [`03747c6`](https://github.com/Eg0r0k/kappa-ui/commit/03747c69f8e205f8a9e5a17762a4c5b0a7b66a19) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `dropdown-menu` and `context-menu` carry their own item, label, separator, shortcut and size styles again, with the same look as `menu`, so adding either one no longer installs the `menu` component.
- Updated dependencies [[`08ffd28`](https://github.com/Eg0r0k/kappa-ui/commit/08ffd28f416738d8e14e67adf44f1c7a14cda855), [`c935598`](https://github.com/Eg0r0k/kappa-ui/commit/c935598b16f4049558e8d5c2c95501683c4f5948)]:
  - @kappa-ui/core@0.2.0
