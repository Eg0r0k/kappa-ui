# @kappa-ui/registry

## 0.5.0

### Minor Changes

- [`e931ebe`](https://github.com/Eg0r0k/kappa-ui/commit/e931ebedb6357a988ea2e613997dca8f174bae20) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Add DataTable over TanStack Table v9: columns and data, per-column header and cell slots, sorting with an accessible header button, a scroll area with sticky header and footer, pinned columns with offsets from the width model, density and stripes, row events, client and manual pagination, loading and empty states, and row virtualization with one row group per row and exact spacers. Row selection with a checkbox column, shift-click ranges, a page and select-all banner and a `source` on `update:rowSelection`; expanding into detail rows and trees; grouping with aggregated cells; pinned rows in sticky row groups; infinite scroll through `onLoadMore`, `hasMore` and `loadMore`. The table styles gain `rowGroup` and `pinnedRows`, a sticky `TableHeader` and `TableFooter` read `--table-sticky-top` and `--table-sticky-bottom` for the offset under a fixed app bar, and `useInfiniteScroll` accepts a `shouldLoad` that returns `undefined` to fall back to the pixel check.

- [`976b350`](https://github.com/Eg0r0k/kappa-ui/commit/976b35065dffb752cda5fb61bfd10329d81c6e9b) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Add HoverCard, from shadcn-vue, on the popover surface: a card shown on hover or focus of a link, with `openDelay` and `closeDelay`.

- [`86397f1`](https://github.com/Eg0r0k/kappa-ui/commit/86397f14c10a8ef26571db317d71d9756b0a4e4e) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Add `MenuTrigger`: a Reka-shaped part that marks the element opening a `Menu` placed next to it, so `<MenuTrigger as-child><Button /></MenuTrigger><Menu />` reads like a dropdown menu. A `Menu` with the default target prefers a sibling trigger over the element it is placed in.

- [`9181705`](https://github.com/Eg0r0k/kappa-ui/commit/9181705840699b48cbd949a8bd3c0363be134535) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - ScrollArea scrolls on both axes with `orientation="both"`, emits `reachEdge` once per entry into an edge zone (`edgeOffset` widens it), and ships `useInfiniteScroll` and `InfiniteScroll`: loading on approach to any of four edges with a promise, `'stop'` to end a direction, initial fill of the viewport and a kept reading position when content is prepended.

- [`79560bc`](https://github.com/Eg0r0k/kappa-ui/commit/79560bcb93f1fbce838df16988dcde36918a0815) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Add the Table primitives: shadcn-named parts with borders on the cells, sticky header and footer, pinned columns with an edge shadow, density, stripes, selected and clickable rows, a visually hidden caption and an empty row. Their classes are one `tableStyles` object, which the coming data table shares.

- [`d290041`](https://github.com/Eg0r0k/kappa-ui/commit/d290041f16221bdabbe9f3df71de6167d71e27c4) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Add Toggle and ToggleGroup. Toggle is a two-state button with Button's variants, colours and sizes, styled when on by `activeVariant` and `activeColor`; ToggleGroup joins toggles like a ButtonGroup, with single or multiple selection and arrow-key navigation. The core colour rules also match `[data-state="on"][data-active-color]`, so an on toggle reads its active colour.

- [`59f9254`](https://github.com/Eg0r0k/kappa-ui/commit/59f9254566e6bcaaddb1424d148cdbdced30c2b5) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Add Tooltip, from shadcn-vue, with its behaviour in `@kappa-ui/core/tooltip`: it opens once the pointer rests on the trigger (moving restarts the wait), on keyboard focus only, and on a long press on touch screens; tooltips under a `TooltipProvider` warm up together; `update:open` reports why it opened or closed; `role="label"` suits icon buttons; `followCursor` keeps it at the pointer. `v-tooltip` gives the same tooltip from a string or an options object, with the side as its argument and `.label` for icon buttons. Button with `aria-disabled="true"` now looks disabled while keeping focus and pointer events, and swallows its click. A Kbd inside a tooltip takes the tooltip's colours.

### Patch Changes

- [`5f82937`](https://github.com/Eg0r0k/kappa-ui/commit/5f829372846f75c9333ac75be945c21860571da2) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - ScrollArea's bars and thumbs let touches through on a touch screen (`pointer: coarse`), so a finger that lands on the bar scrolls the content natively instead of grabbing the thumb.
- Updated dependencies [[`d290041`](https://github.com/Eg0r0k/kappa-ui/commit/d290041f16221bdabbe9f3df71de6167d71e27c4), [`ee10c54`](https://github.com/Eg0r0k/kappa-ui/commit/ee10c54902c4f6af0f71e0668a892a063af0201e), [`59f9254`](https://github.com/Eg0r0k/kappa-ui/commit/59f9254566e6bcaaddb1424d148cdbdced30c2b5)]:
  - @kappa-ui/core@0.4.0

## 0.4.0

### Minor Changes

- [`c0d0a59`](https://github.com/Eg0r0k/kappa-ui/commit/c0d0a5903f6d64ceac86ca37e3ec447796a4c697) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Add Image, with ImageLoading and ImageError: an image in a ratio box with `fit` and `position`, native `srcset`, `sizes` and `<picture>` sources, lazy loading by default, and load and error tracking that holds across SSR hydration. It shows its loading layer while `src` is `undefined` and its error layer when `src` is `null`. The API follows Nuxt Image and Quasar's QImg, without providers.

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
