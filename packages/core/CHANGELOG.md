# @kappa-ui/core

## 0.9.0

### Minor Changes

- [`7e11882`](https://github.com/Eg0r0k/kappa-ui/commit/7e11882c03ffeb0dd739a984550cb337d950a9d4) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `@kappa-ui/core/swipe-actions`: `SwipeRoot`, `SwipeItem`, `SwipeActions`, `SwipeAction`, `SwipeActionContent` and `SwipeContent`, a row that slides sideways on `useDrag` to reveal a strip of actions on its `start` or `end` side and holds open on it, with a velocity-projected threshold, an optional full swipe that clicks the outermost action, one open row per `SwipeRoot`, `v-model:state`, outside-press, `Escape` and scroll dismissal, arrow keys and inert closed strips. `tailwind.css` adds the `swipe-item` utility that animates them.

- [`0f38faa`](https://github.com/Eg0r0k/kappa-ui/commit/0f38faa4ec4529669e97974dbed9b359a2454d15) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `tailwind.css` adds two utilities for controls without a `color` prop: `tone-control` sets the `primary` tone with `--input` as the unchecked edge, and `tone-invalid` switches the tone, the edge and the halo to `destructive`. Put `tone-invalid` under the variant that marks the control invalid, such as `aria-invalid:tone-invalid`.

## 0.8.0

### Minor Changes

- [`e60d032`](https://github.com/Eg0r0k/kappa-ui/commit/e60d0324dc8dbb9421bdfbf2710729f2d7b9e89e) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `@kappa-ui/core/dialog` exports `AlertDialogContent`: Reka UI's alert dialog content with the duties of `DialogContent`, so an alert dialog opened with `openDialog` reports `"escape"` and `"close-button"`, holds while `loading` is on, ignores Escape during IME composition and gets the hidden title and description fallback. `DialogContent` now shares that code.

- [`f4a4e02`](https://github.com/Eg0r0k/kappa-ui/commit/f4a4e02a0589a2b928f0688ef8bd00f35a6a2e2c) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `@kappa-ui/core/drawer-menu`: a menu that lives inside a drawer. `DrawerMenu` holds panels with `role="menu"` and roving focus; `DrawerMenuItem`, `DrawerMenuCheckboxItem`, `DrawerMenuRadioGroup`, `DrawerMenuRadioItem`, `DrawerMenuItemIndicator`, `DrawerMenuGroup`, `DrawerMenuLabel` and `DrawerMenuSeparator` take the props and events of Reka UI's menu parts, so a select closes the drawer unless prevented. `DrawerMenuSub`, `DrawerMenuSubTrigger` and `DrawerMenuSubContent` drill down in the same sheet, with `DrawerMenuBack` at the top of a sub panel; ArrowLeft, Backspace and Escape go back. `tailwind.css` adds the `drawer-menu` utility, which slides between panels and follows the visible panel's height.

- [`ddb5d57`](https://github.com/Eg0r0k/kappa-ui/commit/ddb5d5792dadf9bbb20e65631040c4484b732aec) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `icon-size-*` in `tailwind.css` sizes every `svg` inside an element that has no `size-*` class of its own, from the spacing scale (`icon-size-4`), a length (`icon-size-[18px]`) or a variable (`icon-size-(--menu-icon)`).

### Patch Changes

- [`196be12`](https://github.com/Eg0r0k/kappa-ui/commit/196be12e9916c2a2818747cfcef3cd46b7284271) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A finger drags a drawer through touch events whenever the device reports touch at the moment of the press (`ontouchstart` or `navigator.maxTouchPoints`), as Base UI's Drawer does, instead of only when `ontouchstart` existed at page load. A swipe from the top of a scrolled body now closes the drawer after DevTools switches on touch emulation. A finger whose scroll reaches the edge mid-gesture hands the gesture to the drawer while the browser still lets its moves be cancelled.

- [`8f50769`](https://github.com/Eg0r0k/kappa-ui/commit/8f50769faf376825639de86c3ec62f5f55d98fc4) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `DrawerMenuBack` follows its `DrawerMenuSubTrigger`'s text when that text changes while the submenu is open, such as a live count in the label. Before, it kept the text from when the submenu opened.

- [`4b4d53a`](https://github.com/Eg0r0k/kappa-ui/commit/4b4d53ae6ddaa013b86f73d22070507f9e7ef1a3) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A drag no longer re-renders the drawer's content or the page in `DrawerIndent`: `DrawerContent`, `DrawerOverlay` and `DrawerIndent` write the values that change every frame straight to their elements, and `tailwind.css` registers `--drawer-swipe-movement`, `--drawer-swipe-progress` and the variables derived from them with `inherits: false`, so a frame restyles one element rather than its subtree. Read `--drawer-swipe-movement` and `--drawer-swipe-progress` on the panel or the overlay itself; its children now see `0`.

- [`266a60e`](https://github.com/Eg0r0k/kappa-ui/commit/266a60e10267cebbb08a1da222ea8062e56d8a2a) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `v-tooltip` no longer re-renders its tooltip each time the component holding the element re-renders. It renders again only when its text, arg, `.label` modifier or options change, so a table with a tooltip in every row stays cheap to update.

## 0.7.0

### Minor Changes

- [`92a9ce3`](https://github.com/Eg0r0k/kappa-ui/commit/92a9ce36df18664245c379e59825f0af8e37167b) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `@kappa-ui/core/drawer`: `DrawerRoot`, `DrawerContent`, `DrawerOverlay`, `DrawerHandle` and `DrawerSwipeArea` over Reka UI's dialog, with a swipe-to-dismiss gesture on every side, swipe-to-open from the screen edge and a bottom edge that lifts above the virtual keyboard. New modules `@kappa-ui/core/drag` (`useDrag` over `@use-gesture/vanilla` with the drag-start rules) and `@kappa-ui/core/virtual-keyboard` (`useVirtualKeyboardInset`). `tailwind.css` gains `drawer-slide` and `drawer-overlay-fade`. `@use-gesture/vanilla` and `@vueuse/core` become dependencies. `DismissReason` gains `"swipe"`.

- [`a455da4`](https://github.com/Eg0r0k/kappa-ui/commit/a455da46c658606f3a730a727226b3c82d740a2f) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `DrawerIndent` in `@kappa-ui/core/drawer`: the page element that steps back while a modal drawer is open. Open modal drawers form a stack in the nearest `DrawerIndent`, or a shared one without it. The page follows the first drawer through `--drawer-indent-progress`, `data-side`, `data-swiping` and the part of it on screen (`--drawer-indent-top`, `--drawer-indent-bottom`), kept until its return transition ends, and carries `data-open`. A drawer content gets `--drawer-nested`, `--drawer-nested-progress`, `data-nested-open` and `data-nested-swiping` from the drawers above it. `tailwind.css` adds the `drawer-indent` utility, and `drawer-slide` steps a drawer back while others are open above it.

- [`154d2f7`](https://github.com/Eg0r0k/kappa-ui/commit/154d2f7703df25ba0547892224d84355ffa2b326) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `openDrawer(component, props?, options?)` and `defineDrawer(component, { props, keepMounted, ...options })` in `@kappa-ui/core/drawer` open a drawer from code through the dialog service, with `Drawer`'s props as options. A dialog manager entry can carry a root component, which `DialogHost` renders in place of Reka's `DialogRoot`.

- [`63adf67`](https://github.com/Eg0r0k/kappa-ui/commit/63adf67aa521b59c82d20b3a1134b438e315247c) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `@kappa-ui/core/snap`: `toPixels`, `resolveSnapPoint` and `cycleSnapPoint`. `DrawerRoot` gains `snapPoints`, `activeSnapPoint` (v-model), `snapToSequentialPoints` and `fadeFromIndex`; the content writes `--drawer-snap-offset` and `data-expanded`, the overlay `--drawer-overlay-opacity`, a handle tap cycles the points, and the content skips its scroll check below the largest one. `useDrag` reports a signed release velocity over the last 100 ms and lets a mouse drag from anywhere; `releaseVerdict` takes that velocity.

### Patch Changes

- [`b9b2829`](https://github.com/Eg0r0k/kappa-ui/commit/b9b2829ca2c572654bd128d6f5bf1c475db02011) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - HoverCard roots share one window scroll listener instead of registering one each for their whole lifetime.

## 0.6.0

### Minor Changes

- [`7323be6`](https://github.com/Eg0r0k/kappa-ui/commit/7323be66354c14fe11f9d4eff9b006d98c4eae8b) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `animate-collapsible-down` and `animate-collapsible-up` in `tailwind.css`: the accordion's timing for Reka UI's collapsible, with `overflow: hidden` inside the keyframes so an open panel at rest does not clip.

## 0.5.0

### Minor Changes

- [`6ea2d24`](https://github.com/Eg0r0k/kappa-ui/commit/6ea2d24355e8575d52e4daf638619dd389da3e40) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `@kappa-ui/core/hover-card` drives the hover card: on touch, `auto` opens a link on a long press and anything else on a tap, the card stays open while the page scrolls and closes on a tap outside, on Escape or on `disabled`; on a desktop the pointer has to rest for `openDelay`, focus opens only when visible, and `update:open` reports why the card opened or closed. `HoverCard` loses `enableTouch` and gains `touch`, `touchDelay`, `restThreshold` and `disabled`. The card no longer gets stuck after a scroll on touch.

- [`715f6fc`](https://github.com/Eg0r0k/kappa-ui/commit/715f6fcccaafcbabc56cd53f7a5671756c63e477) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Components are coloured by tones. A colour is three inputs, `--tone`, `--tone-foreground` and `--tone-text`, set on `[data-slot][data-color="<name>"]`; core derives `--tone-soft`, `--tone-soft-foreground`, `--tone-border` and `--tone-border-subtle` from them and registers all seven as `tone-*` colours, so `bg-tone`, `text-tone-text` and the rest work as classes. The `--c-*` variables are gone: a rule that set `--c`, `--c-fg`, `--c-soft`, `--c-soft-fg` or `--c-edge` now sets `--tone`, `--tone-foreground` and `--tone-text`, and drops the rest. Button, Badge, Alert, Toggle, the choice controls and Toast read tones; Toast no longer exports `toastAccents`.

## 0.4.0

### Minor Changes

- [`d290041`](https://github.com/Eg0r0k/kappa-ui/commit/d290041f16221bdabbe9f3df71de6167d71e27c4) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Add Toggle and ToggleGroup. Toggle is a two-state button with Button's variants, colours and sizes, styled when on by `activeVariant` and `activeColor`; ToggleGroup joins toggles like a ButtonGroup, with single or multiple selection and arrow-key navigation. The core colour rules also match `[data-state="on"][data-active-color]`, so an on toggle reads its active colour.

- [`59f9254`](https://github.com/Eg0r0k/kappa-ui/commit/59f9254566e6bcaaddb1424d148cdbdced30c2b5) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Add Tooltip, from shadcn-vue, with its behaviour in `@kappa-ui/core/tooltip`: it opens once the pointer rests on the trigger (moving restarts the wait), on keyboard focus only, and on a long press on touch screens; tooltips under a `TooltipProvider` warm up together; `update:open` reports why it opened or closed; `role="label"` suits icon buttons; `followCursor` keeps it at the pointer. `v-tooltip` gives the same tooltip from a string or an options object, with the side as its argument and `.label` for icon buttons. Button with `aria-disabled="true"` now looks disabled while keeping focus and pointer events, and swallows its click. A Kbd inside a tooltip takes the tooltip's colours.

### Patch Changes

- [`ee10c54`](https://github.com/Eg0r0k/kappa-ui/commit/ee10c54902c4f6af0f71e0668a892a063af0201e) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A tooltip that follows the cursor no longer jumps to the trigger's centre while it fades out after the pointer leaves: the last pointer position is kept until the tooltip is next opened from the keyboard.

## 0.3.0

### Minor Changes

- [`e58b25a`](https://github.com/Eg0r0k/kappa-ui/commit/e58b25a4fef78c248f70cfb54a340adae4b4379a) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Add an `info` colour: `--info`, `--info-foreground` and `--info-text` tokens, `data-color="info"`, and `info` on Button, Badge and toasts.

- [`95f4d61`](https://github.com/Eg0r0k/kappa-ui/commit/95f4d615d81ad36edd1ec0a142cb917b3b4bb2b1) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Add Progress, ported from Nuxt UI, with shadcn's `ProgressLabel` and `ProgressValue`. Core gains the `animate-progress-*` utilities it animates with.

## 0.2.0

### Minor Changes

- [`08ffd28`](https://github.com/Eg0r0k/kappa-ui/commit/08ffd28f416738d8e14e67adf44f1c7a14cda855) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `reka-ui` is now a peer dependency of `@kappa-ui/core` (`^2.10.5`), so your project and kappa-ui share one copy. The primitive re-exports (`@kappa-ui/core/checkbox`, `@kappa-ui/core/utils`, …) are gone: components import `reka-ui` directly, and adding one installs `reka-ui` like any shadcn-vue component. `@kappa-ui/core/menu` stays and, in development, names the missing parts if a Reka upgrade drops them. Breaking for code that imported the removed subpaths: import the same names from `reka-ui`.

- [`c935598`](https://github.com/Eg0r0k/kappa-ui/commit/c935598b16f4049558e8d5c2c95501683c4f5948) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Colour and variant are separate axes: `[data-slot][data-color]` rules in `@kappa-ui/core/tailwind.css` set `--c-*` variables that Button and Badge variants read, so a custom colour is one CSS rule plus `color="<name>"`. Core gains the `touch-target`, `touch-target-margin`, `touch-target-wrapper`, `state-halo`, `choice-row`, `slider-axis`, `slider-touch` and `slider-range-inset` utilities and the `scrollbar-gutter` base rule. The `choice-group`, `text-control`, `menu-styles` and `overlay` registry items are gone: their styles now live in `checkbox`, `input`, `menu` and `popover`.
