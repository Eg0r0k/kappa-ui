# @kappa-ui/registry

## 0.8.0

### Minor Changes

- [`8c1319e`](https://github.com/Eg0r0k/kappa-ui/commit/8c1319e37f914906fd00168368dc6685fa37d8e5) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - ColorPicker: `ColorPicker`, `ColorPickerArea`, `ColorPickerSlider`, `ColorPickerField`, `ColorPickerPreview`, `ColorPickerSwatches` and `ColorPickerSwatch` over Reka UI's colour primitives. One `v-model` string in `hex`, `rgb`, `hsl` or `hsb` feeds every part; the area, the sliders and the swatches work from the keyboard and read out as sliders and options; the sliders are drawn on `Slider`'s parts with its `variant`, `touch-target`, sizes, halo and press scale, one `size` from `xs` to `xl` scales the parts together, and a surrounding `Field` supplies the label, description, error and disabled state.

- [`a455da4`](https://github.com/Eg0r0k/kappa-ui/commit/a455da46c658606f3a730a727226b3c82d740a2f) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Drawer: `DrawerIndent` scales the page behind an open drawer, and a drawer opened from another one stacks on top while the one below steps back.

- [`154d2f7`](https://github.com/Eg0r0k/kappa-ui/commit/154d2f7703df25ba0547892224d84355ffa2b326) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Drawer: `openDrawer` and `defineDrawer` open a drawer from code, and `@/ui/drawer` re-exports `useDialogContext` for the component it opens.

- [`63adf67`](https://github.com/Eg0r0k/kappa-ui/commit/63adf67aa521b59c82d20b3a1134b438e315247c) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Drawer: snap points through `snap-points`, `v-model:active-snap-point`, `snap-to-sequential-points` and `fade-from-index`; `DrawerBody` scrolls only at the largest point; a mouse drags the panel from anywhere; the swipe-to-open example shows a visible zone.

- [`92a9ce3`](https://github.com/Eg0r0k/kappa-ui/commit/92a9ce36df18664245c379e59825f0af8e37167b) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Drawer: `Drawer`, `DrawerTrigger`, `DrawerContent`, `DrawerOverlay`, `DrawerHandle`, `DrawerSwipeArea`, `DrawerHeader`, `DrawerTitle`, `DrawerDescription`, `DrawerBody`, `DrawerFooter` and `DrawerClose` over `@kappa-ui/core/drawer`, shaped like Dialog's parts, on four sides.

- [`b68c6ee`](https://github.com/Eg0r0k/kappa-ui/commit/b68c6ee46c7b5f19f2061414429bae495f2155af) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - InnerLoading: `InnerLoading`, `InnerLoadingContent` and `InnerLoadingOverlay`, a loading overlay for one region. The content turns `inert` while loading, so nothing behind the scrim can be clicked, focused or read; the overlay mounts only while loading with a `Spinner` by default, and focus returns to the control that had it when loading ends.

- [`657321c`](https://github.com/Eg0r0k/kappa-ui/commit/657321c6dc0b503696fe3e51475ffcf9a283fbc2) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Stepper: `Stepper`, `StepperItem`, `StepperTrigger`, `StepperIndicator`, `StepperTitle`, `StepperDescription` and `StepperSeparator` over Reka UI's stepper, shaped after shadcn-vue. The indicator and the separator colour themselves from the step's state, the stepper is linear by default, and one `size` from `xs` to `xl` scales the indicator, its icon, the type, the gaps and the separator.

### Patch Changes

- [`74436ba`](https://github.com/Eg0r0k/kappa-ui/commit/74436bad47de374c328b5421edc4913c80ea7778) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - ButtonGroupSeparator keeps its one-pixel width but no longer fills it with `bg-input`, so it parts the buttons with a gap rather than a line.

- [`0f257de`](https://github.com/Eg0r0k/kappa-ui/commit/0f257de5ae878fa301d45a5e2828ee1be32de1c5) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Card: `outline` and `subtle` draw their edge as a one-pixel ring outside the box instead of a border, so every variant has the same size, as Button's do, and content that reaches the sides, a flush image or a list of items, never covers it.

- [`d169f4d`](https://github.com/Eg0r0k/kappa-ui/commit/d169f4d59ca0baa938f528fa3376f2f0119c6987) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - DataTable attaches row click, keyboard, context-menu and hover listeners only when the matching `onRow*` prop is set, instead of five listeners per row regardless.

- [`686b10b`](https://github.com/Eg0r0k/kappa-ui/commit/686b10bba500234ad255f5dfc6d4b3e90bba54cf) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - ImageLoading and ImageError leave the render tree (`display: none`) while their state is not showing, so the default Spinner stops animating behind loaded images. The fade still plays through `transition-behavior: allow-discrete` and `@starting-style`, and a display class passed to a layer still wins while it is shown.

- [`a2a4d38`](https://github.com/Eg0r0k/kappa-ui/commit/a2a4d38ede7d7866443f9e0edde6f8f701c8cbc2) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Button and Alert: the `outline` variant no longer paints `bg-background`, so an outline button or alert on a tinted surface shows the surface through it, as Badge's `outline` already did.

- [`c0234b2`](https://github.com/Eg0r0k/kappa-ui/commit/c0234b24727ba333a3f9598551133c900b4cc360) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - ScrollArea moves its thumb with `transform` instead of `top` / `inset-inline-start`, so scrolling no longer lays out and repaints the bar on every frame, and the thumb drops its permanent `will-change` layer.
- Updated dependencies [[`92a9ce3`](https://github.com/Eg0r0k/kappa-ui/commit/92a9ce36df18664245c379e59825f0af8e37167b), [`a455da4`](https://github.com/Eg0r0k/kappa-ui/commit/a455da46c658606f3a730a727226b3c82d740a2f), [`154d2f7`](https://github.com/Eg0r0k/kappa-ui/commit/154d2f7703df25ba0547892224d84355ffa2b326), [`63adf67`](https://github.com/Eg0r0k/kappa-ui/commit/63adf67aa521b59c82d20b3a1134b438e315247c), [`b9b2829`](https://github.com/Eg0r0k/kappa-ui/commit/b9b2829ca2c572654bd128d6f5bf1c475db02011)]:
  - @kappa-ui/core@0.7.0

## 0.7.0

### Minor Changes

- [`7323be6`](https://github.com/Eg0r0k/kappa-ui/commit/7323be66354c14fe11f9d4eff9b006d98c4eae8b) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Collapsible: `Collapsible`, `CollapsibleTrigger` and `CollapsibleContent` over Reka UI's collapsible. The content animates with the accordion's timing; closed content stays in the page as `hidden="until-found"` unless `unmount-on-hide` is set.

- [`5af8a9b`](https://github.com/Eg0r0k/kappa-ui/commit/5af8a9b92a6cdc4db8dc8d0926ef3eb61d6dc8af) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Empty: `Empty`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription` and `EmptyContent` for empty states. One `size` from `xs` to `xl` scales the spacing, the icon and the type; the layout draws no surface of its own, so it sits in a card, a table or a page.

- [`c08ee4f`](https://github.com/Eg0r0k/kappa-ui/commit/c08ee4f2d08da0e0841335d8213019a6bd253199) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - PinInput: `PinInput`, `PinInputGroup`, `PinInputSlot` and `PinInputSeparator` over Reka UI's pin input, with the text control variants and sizes of `Input`, one-time-code autofill on by default, and label, state and error from a surrounding `Field`.

- [`07109fb`](https://github.com/Eg0r0k/kappa-ui/commit/07109fb38ff674f194c000d9feb73ae5fba97203) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Toolbar: `Toolbar`, `ToolbarButton`, `ToolbarLink`, `ToolbarSeparator`, `ToolbarToggleGroup` and `ToolbarToggleItem` over Reka UI's toolbar, drawn with `Button` and `ToggleGroup`: one tab stop, arrow-key focus, a framed `outline` or a bare `ghost` variant.

### Patch Changes

- Updated dependencies [[`7323be6`](https://github.com/Eg0r0k/kappa-ui/commit/7323be66354c14fe11f9d4eff9b006d98c4eae8b)]:
  - @kappa-ui/core@0.6.0

## 0.6.0

### Minor Changes

- [`aa71d8d`](https://github.com/Eg0r0k/kappa-ui/commit/aa71d8daa18fe2ca5b2a3ceff43c7f49469c86dd) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Avatar: `Avatar`, `AvatarImage`, `AvatarFallback`, `AvatarGroup` and `AvatarGroupCount`. Five sizes from 24 to 64px; a group overlaps its members by a quarter of their size and rings them in `--avatar-ring`; `Image` goes in an avatar in place of `AvatarImage` for sources and layers.

- [`4e35ec3`](https://github.com/Eg0r0k/kappa-ui/commit/4e35ec3511f84a0f14cccdd00c851833588cfd2f) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Card takes `size` from `xs` to `xl` on one `--card-spacing` (`md` is the default and replaces `default`) and `variant`: `outline` (unchanged, the default), `solid` with a small shadow and no border, `soft` tinted, `subtle` tinted with a border. `ChoiceGroup` is the layout behind `CheckboxGroup` and `RadioGroup`'s `variant` and `orientation`, in its own `choice-group` item; `radio-group` depends on it instead of on `checkbox`.

- [`6ea2d24`](https://github.com/Eg0r0k/kappa-ui/commit/6ea2d24355e8575d52e4daf638619dd389da3e40) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `@kappa-ui/core/hover-card` drives the hover card: on touch, `auto` opens a link on a long press and anything else on a tap, the card stays open while the page scrolls and closes on a tap outside, on Escape or on `disabled`; on a desktop the pointer has to rest for `openDelay`, focus opens only when visible, and `update:open` reports why the card opened or closed. `HoverCard` loses `enableTouch` and gains `touch`, `touchDelay`, `restThreshold` and `disabled`. The card no longer gets stuck after a scroll on touch.

- [`5043a12`](https://github.com/Eg0r0k/kappa-ui/commit/5043a1289edc7f3b2e66ff3ec92155c2606367e0) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `InputFloating` is the input with a floating label; `Input` no longer takes `label`. Replace `<Input label="…">` with `<InputFloating label="…">` from `@/components/ui/input-floating`. The wrapper's `data-slot` is `input-floating`, the input inside it `input-floating-input` and the label `input-floating-label`.

- [`305c540`](https://github.com/Eg0r0k/kappa-ui/commit/305c540350059aca48dc0ca2ea5824c6219ff029) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Splitter: `Splitter`, `SplitterPanel` and `SplitterHandle` over Reka UI's splitter. The handle is a `line` or a `gutter` that lights up in `--primary` while the pointer is in its hit zone, with an optional `grip`; double-clicking it puts the panels beside it back to their starting sizes.

- [`715f6fc`](https://github.com/Eg0r0k/kappa-ui/commit/715f6fcccaafcbabc56cd53f7a5671756c63e477) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Components are coloured by tones. A colour is three inputs, `--tone`, `--tone-foreground` and `--tone-text`, set on `[data-slot][data-color="<name>"]`; core derives `--tone-soft`, `--tone-soft-foreground`, `--tone-border` and `--tone-border-subtle` from them and registers all seven as `tone-*` colours, so `bg-tone`, `text-tone-text` and the rest work as classes. The `--c-*` variables are gone: a rule that set `--c`, `--c-fg`, `--c-soft`, `--c-soft-fg` or `--c-edge` now sets `--tone`, `--tone-foreground` and `--tone-text`, and drops the rest. Button, Badge, Alert, Toggle, the choice controls and Toast read tones; Toast no longer exports `toastAccents`.

### Patch Changes

- [`80f5d64`](https://github.com/Eg0r0k/kappa-ui/commit/80f5d64b537dc6fbbc2a9de4c1f2cc3ccdd32ae6) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - The pill tab indicator is `--input` at 30% in the dark theme, so the active tab sits above its track instead of sinking below it.
- Updated dependencies [[`6ea2d24`](https://github.com/Eg0r0k/kappa-ui/commit/6ea2d24355e8575d52e4daf638619dd389da3e40), [`715f6fc`](https://github.com/Eg0r0k/kappa-ui/commit/715f6fcccaafcbabc56cd53f7a5671756c63e477)]:
  - @kappa-ui/core@0.5.0

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
