# @kappa-ui/core

## 0.16.0

### Minor Changes

- [`95b68d3`](https://github.com/Eg0r0k/kappa-ui/commit/95b68d3ecaa3b70275e69fa6e48f61665c1741d4) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Breaking: the focus ring's colour hook is `--focus-ring-color`, no longer `--color-ring`. `focus-ring` and `focus-ring-inset` read `var(--focus-ring-color, --theme(--color-ring))`, so a `.dark` island (or any subtree that sets `--ring`) rings its controls in its own `--ring`; a class such as `[--color-ring:currentColor]` copied from the kit now has no effect and becomes `[--focus-ring-color:currentColor]`. `tone-control`, `AlertClose`, `BannerClose` and the `ChoiceGroup` cards set the new variable.

### Patch Changes

- [`b827f85`](https://github.com/Eg0r0k/kappa-ui/commit/b827f85dab7838398e6e19195da23e0a13cd7412) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - An open `AccordionContent` no longer clips its content: the accordion keyframes clip while the panel's height animates, as Collapsible's do, and the part drops its permanent `overflow-hidden`, so a focus ring or a shadow inside an open answer shows in full.

- [`f29a239`](https://github.com/Eg0r0k/kappa-ui/commit/f29a23978917de695c9aee640ece2f8f4ae68d1e) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A row of a disabled `RadioGroup` or `CheckboxGroup`, or of a group inside a disabled `FieldSet`, looks disabled: `choice-row` drops its hover tint and shows a `not-allowed` cursor when the row's checkbox or radio is disabled, not only when its `Field` is, and `FieldLabel` dims beside a disabled checkbox or radio.

- [`b3cd937`](https://github.com/Eg0r0k/kappa-ui/commit/b3cd9377b09056f6491a3c440d45e77dad3e3512) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Components follow `.dark` through tokens only. The `Tabs` pill fills with the new `--tabs-pill` token (the page background, and `--input` at 30% under `.dark`) instead of `dark:bg-input/30`, and `shimmer` takes its brighter dark highlight from a `.dark` value of `--shimmer-color` instead of `@variant dark`. Both now switch with the `.dark` class even in a project whose own `dark` variant is something else.

- [`97fc92b`](https://github.com/Eg0r0k/kappa-ui/commit/97fc92bc2ac170fa33efdfea882f0bc78e26f70d) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `useDrag` on touch: a nested drag that refused a finger (its `canStart` said no) no longer starts later in the same gesture once an outer drag owns it, so a Swipe Actions row inside a Swipe Views page and the page no longer move together on a back-and-forth swipe.

- [`03cf21f`](https://github.com/Eg0r0k/kappa-ui/commit/03cf21f3a127b262656336a7033088a9de340675) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `useDrag` on touch reports each move's own `velocity` and `direction` in `onMove`, as the pointer path does, instead of a velocity of 0 and the direction from the start of the gesture.

- [`36aba2b`](https://github.com/Eg0r0k/kappa-ui/commit/36aba2b775c25c05e1178b77848be76cbad31cf6) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `DrawerMenu as-child` makes the child the menu root: the child gets the root's attributes (`data-slot`, classes, `dir`, the height variable and the back keys), its own content becomes the root panel, and the submenu panels render inside it. Before, the attributes landed on the root panel and the submenus sat outside the child.

- [`ee25b0f`](https://github.com/Eg0r0k/kappa-ui/commit/ee25b0f48614cc718835b2d99dc122130b7de6b6) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - The modal scrim's hold renders a comment instead of a hidden `<span>`, and `PopoverContent`, `DatePickerContent` and `Menu` put it after their slot: `PopoverContent as-child` renders the consumer's element as the panel instead of moving the panel's role, classes and `data-slot` onto the hidden span, and a panel's first element child is the consumer's again.

- [`c2b5813`](https://github.com/Eg0r0k/kappa-ui/commit/c2b5813ac526a7a95fed662ef825884896f6efda) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Progress in a right-to-left document: the `swing` and `elastic` animations stay inside the track, mirrored, instead of sliding off its edge, and under reduced motion the `carousel` and `carousel-inverse` animations pulse like the others instead of sliding.

- [`7b34963`](https://github.com/Eg0r0k/kappa-ui/commit/7b34963fe065078838db3c2cdb409fdf281867a5) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - The corner role tokens (`--radius-control-*`, `--radius-surface-*`, `--radius-item-*`) move from the `theme` item to the `tokens` item, which every component brings. A project that skipped init and kept its own shadcn theme now gets `rounded-control-*`, `rounded-surface-*` and `rounded-item-*` (and the `rounded-inset-*`/`rounded-outset-*` forms on them) instead of square corners. They scale from your `--radius` and the optional `--control-radius`, `--surface-radius` and `--item-radius` knobs, as before.

- [`0b689cc`](https://github.com/Eg0r0k/kappa-ui/commit/0b689cced404489a8c6e0a9fc02a5eea47a4f1e5) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `v-ripple` measures its host in the host's own CSS pixels: under a scaled ancestor (`transform: scale()`, such as a zoomed canvas or the page behind an open `DrawerIndent`), a wave now starts under the pointer and is sized for the host instead of starting at the scaled point and growing from the shrunken rect. A keyboard wave is centred the same way.

- [`30fcc19`](https://github.com/Eg0r0k/kappa-ui/commit/30fcc19b97ad9d8215649aec2f874eaee3f6ea73) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `v-ripple` waits Material Web's 150 ms before rippling under a touch, so a finger that lands on a row to start a scroll no longer flashes a wave; a quick tap still ripples on release. A secondary mouse button no longer ripples.

- [`1fe3cec`](https://github.com/Eg0r0k/kappa-ui/commit/1fe3cec756b2d9c5d782e90db3cec7962af15934) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `shimmer-reverse` flips the sweep in right-to-left text too: there the shimmer already runs reversed, and the class now turns it back to normal instead of leaving it as is.

- [`26880d8`](https://github.com/Eg0r0k/kappa-ui/commit/26880d816b5c31816fcfc160b2a6ccfd06ccbd1d) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `state-layer` no longer tints a natively disabled element or one marked `data-disabled` under the mouse or on press, only an `aria-disabled` one as before; a disabled `Item as="button"` stays flat.

- [`129bc1d`](https://github.com/Eg0r0k/kappa-ui/commit/129bc1dd4da9bd24b6834b239e55277b8ade11ea) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - SwipeActions: when an action runs from the keyboard or Escape closes the row while focus is in a strip, focus goes back to the element last focused in the row's content (or its first focusable element) instead of dropping to `<body>` as the strip turns inert.

- [`8329332`](https://github.com/Eg0r0k/kappa-ui/commit/8329332f78ec917c5235ce525c15e8a11c3d2b18) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - SwipeActions: an arrow key that a widget inside the row already handled (a ToggleGroup or other roving-focus group calls `preventDefault`) no longer opens or closes the row.

- [`a435c72`](https://github.com/Eg0r0k/kappa-ui/commit/a435c721a7881075514817e3a093c63bf79588e8) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `SwipeItem` takes a `dir` prop and renders its direction (the prop, else `ConfigProvider`) as the row's `dir`, so the drag, the arrow keys and the strips' placement agree: before, in `<html dir="rtl">` without a `ConfigProvider`, a drag revealed the empty side and the open strip sat outside the row. Such an app now gets left-to-right rows (strips do not swap); set `dir="rtl"` on the row or wrap the app in `ConfigProvider dir="rtl"`.

- [`1960479`](https://github.com/Eg0r0k/kappa-ui/commit/1960479fbd84330168eaed32152af9cd63414e1e) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A `SwipeItem` rendered open on the server (`v-model:state` restored to `start` or `end`) no longer crashes the render by adding its outside-press and Escape listeners to a `document` that does not exist there; the hydrated row adds them on the client.

- [`1ebc3d6`](https://github.com/Eg0r0k/kappa-ui/commit/1ebc3d6e101f6125032a792e14148aa926d8d0a9) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `useSwipeSnap` clamps an `active` index outside its points when it starts, so `active` 5 over three points rests on the last one instead of writing an offset of 0 and a position of 5.

- [`76d453f`](https://github.com/Eg0r0k/kappa-ui/commit/76d453f7de0980c67cf8781dcfb6da3d954cef1d) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A disabled SwipeViews marks its swipe areas `data-disabled`, so the registry's strips stop catching taps over the page's edge; the root context gains `disabled`.

- [`895afdc`](https://github.com/Eg0r0k/kappa-ui/commit/895afdcc072b3ebf571e342078822ed86e770d01) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - SwipeViews: when the page holding focus turns inert after a page change (a button in it that moves to the next page, say), focus moves to the new page itself instead of dropping to `<body>`. The page gets `tabindex="-1"` if it has none, and nothing inside it is focused, so no virtual keyboard opens after a swipe.

- [`50250ec`](https://github.com/Eg0r0k/kappa-ui/commit/50250ec24b684549f9c0911f3638123568e23617) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - SwipeViews renders its state on the server: pages register during setup, so the server HTML marks the page in `v-model` `active` and the others `inert`, and each page places itself by index (in percent of its own size) until the root has measured the pages in the browser, so the first paint shows the model's page instead of the first one, or the last one in the stack layout. Hydration matches the server HTML. `--swipe-snap-offset`, `--swipe-view-offset` and `--swipe-view-stack` are registered as `<length-percentage>`; the root context gains `resolved`, `measured` and `resort`, and a registered page's `element` is set once it mounts.

- [`70d1620`](https://github.com/Eg0r0k/kappa-ui/commit/70d162063997d100a21e5e343b185d7fbfe26f34) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Colours written inside arbitrary values and variables now resolve where the element sits, so a `.dark` island (or any subtree that sets a token) gets its own: the filled Input, InputGroup and DatePicker underline, the Table hover, selected and stripe tints, the disabled Slider and Rating fills and the ColorPicker checkerboard read `--theme(--color-x)` instead of `var(--color-x)`, which Tailwind resolves once on `:root`. The ripple wave reads `--state-pressed` where it is pressed (the `ripple` item no longer pins `--kappa-ripple-opacity` on `:root`), so a subtree that changes `--state-pressed` changes the wave as well as the state layer.

- [`4892a23`](https://github.com/Eg0r0k/kappa-ui/commit/4892a23c0c96bc049ed16cccfc5ca3517711ae3d) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A toast that is already closed when it first renders (closed by `max` in the same tick it was added, or added and removed in one tick) is dropped and its `onClose` runs, instead of staying in `toasts` until the toaster unmounts.

- [`5c0a1ae`](https://github.com/Eg0r0k/kappa-ui/commit/5c0a1ae2e5990d660725f91fb1e789232c13e00a) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Closing the last toast with the mouse no longer leaves the toaster paused: the next toast's progress bar runs, and in Firefox its timer starts and it closes on time. `ToastRecordRoot` clears Reka's paused flag when the last toast unmounts, and `Toaster` clears its own when its list empties.

- [`6b26bf7`](https://github.com/Eg0r0k/kappa-ui/commit/6b26bf7e73f7cd765734d6a8f868e926098bc22d) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `useTour` follows the page while a tour is open: a string target that mounts after its step opened (a route or a `v-if` section) anchors the panel once it appears, and a target removed mid-step centres the panel instead of pinning it to the viewport's top-left corner.

- [`49f6278`](https://github.com/Eg0r0k/kappa-ui/commit/49f6278ecf177c4d584801394c80dfe6203fdeb4) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `useTour` returns `loop`, and `TourNext` reads "Next" rather than "Finish" on the last step of a looping tour, where pressing it goes back to the first step.

## 0.15.1

### Patch Changes

- [`2fac232`](https://github.com/Eg0r0k/kappa-ui/commit/2fac23241f04edeaf9e5ddbf5c91b0885a7e328a) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - PageIndicator: the dots after a moving pill no longer jump a pixel while it eases. `tailwind.css` registers `--page-indicator-length` with `@property`, the items transition it instead of `width`, and each item takes it rounded to whole pixels, up for the current page and down for the rest, so the two lengths that trade places always add up to the same width.

- [`5ada64b`](https://github.com/Eg0r0k/kappa-ui/commit/5ada64b448678d7d086bc1c8f303ee722beb8427) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A pressed Toggle or ToggleGroup item keeps its on look inside `TooltipTrigger as-child` (or any wrapper that writes its own `data-state`). The on styles read `aria-pressed`, which Reka sets on every toggle, instead of `data-state="on"`, which the tooltip overwrote with `closed`; core's active-colour rules match both, so a custom `[data-state="on"][data-active-color]` rule keeps working.

- [`32546e6`](https://github.com/Eg0r0k/kappa-ui/commit/32546e686df232e355400040c9ea997b64beb5aa) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `useTour`: `reference` keeps the current step's target after the tour closes instead of turning `undefined`, so the popover's exit animation plays where it was rather than jumping to the top-left corner.

## 0.15.0

### Minor Changes

- [`da01a2a`](https://github.com/Eg0r0k/kappa-ui/commit/da01a2a0226864a15731a4b16584e0226aaca060) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `tailwind.css`: `animate-marquee` and `animate-marquee-vertical` slide an element by its own size plus `--marquee-gap` over `--marquee-duration` (20s), the other way under `dir="rtl"` and not at all under reduced motion; `marquee-fade` dissolves `--marquee-fade` (25%) of each edge through a mask, along the axis named by the element's `data-orientation`.

## 0.14.0

### Minor Changes

- [`779955e`](https://github.com/Eg0r0k/kappa-ui/commit/779955e6b5e698179c9900e5feef1658cef56df4) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `rounded-inset-*` and `rounded-outset-*` utilities for nested corners. `rounded-inset-<radius>/<inset>` keeps a part inside a frame concentric and never below half the outer radius, so it no longer turns square at small radii. `rounded-outset-<radius>/<inset>` grows a container from the items inside it, and stays square around square items.

### Patch Changes

- [`6887534`](https://github.com/Eg0r0k/kappa-ui/commit/6887534c8c7d8b707da54f663e312a95b75d1284) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A finger drag no longer freezes when a second finger touches the screen: `useDrag` keeps following the first finger and releases when it lifts, so SwipeViews, `useSwipeSnap`, Drawer and SwipeActions settle instead of staying stuck mid-drag. A second finger that lands before the drag starts still keeps it from starting. A pen or mouse pressed during a finger drag, or a finger during a pen or mouse drag, no longer starts a second drag on top of the first.

## 0.13.0

### Minor Changes

- [`6fb58da`](https://github.com/Eg0r0k/kappa-ui/commit/6fb58dabbc2584b9e3c72d7c72fd912cc2d726da) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Nested drags no longer start together: the innermost `useDrag` that starts takes the gesture, and an outer one gets it only when the inner one refuses it. A closed SwipeActions row no longer moves towards a side without actions, so that swipe reaches what is around the row. `scrollBlocksDrag` reads a right-to-left scroller from its start on the right.

- [`7951a0f`](https://github.com/Eg0r0k/kappa-ui/commit/7951a0fc256ef40ba789e317d865746ff0cb9994) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `shimmer` utilities in `@kappa-ui/core/tailwind.css`, ported from shadcn-vue: a highlight that sweeps across text drawn with `background-clip: text`, with `shimmer-once`, `shimmer-reverse`, `shimmer-none` and `shimmer-color-*`, `shimmer-duration-*`, `shimmer-spread-*`, `shimmer-angle-*`. New `@kappa-ui/core/tour` with `useTour`, ported from Nuxt UI: the state of a guided tour whose `reference` a popover anchor follows; a step without a target, or whose target matches nothing, sits in the centre of the viewport and sets `centered`. `animate-skeleton-wave` draws its band in the element's tone when the element has a `data-color`.

- [`7200c46`](https://github.com/Eg0r0k/kappa-ui/commit/7200c4616b871c57ba1ff3deedba9d16f75f57da) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `@kappa-ui/core/swipe-snap`: `useSwipeSnap` pages between snap points measured in px. A drag follows the finger, the release settles on the nearest point or the next one after a flick, and a finger can catch a settle mid-way. `rubberband: false` stops a drag hard at the edge instead of letting it stretch. It writes `--swipe-snap-offset` and `--swipe-snap-position` on its element for CSS to move things with; the new `swipe-snap` utility transitions them and `swipe-view` passes them one level down.

- [`908bb3b`](https://github.com/Eg0r0k/kappa-ui/commit/908bb3bb589c650741c6e9289b1e875b0b3ca749) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `@kappa-ui/core/swipe-views`: `SwipeViewsRoot`, `SwipeView` and `SwipeViewsSwipeArea`, headless pages that follow the finger. The root measures its pages, binds the page in the frame with `v-model` and writes `--swipe-snap-offset` and `--swipe-snap-position`; every page gets `--swipe-view-index`, `--swipe-view-start`, `data-state`, and `inert` while out of the frame, and the `swipe-view` utility derives `--swipe-view-offset` and `--swipe-view-stack` from them. `layout` (`row` or `stack`) is carried as `data-layout`, and the root sets `dir`. A swipe area is a strip that starts a swipe towards the page on its side; `swipeAreaOnly` makes it the only way to swipe.

## 0.12.0

### Minor Changes

- [`d675257`](https://github.com/Eg0r0k/kappa-ui/commit/d67525707fcd1aaf8f55ae07a32c4743e79b4e40) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A DrawerMenu panel that leaves now waits for any animation or transition running on it, not only for a keyframe animation, so the slide between panels can be replaced with plain CSS: keyframes on `data-motion`, or a transition on `data-state` with `@starting-style` for the arriving panel. A transition used to be cut short: the panel hid at once when `animation-name` was `none`.

## 0.11.0

### Minor Changes

- [`3e1a8a0`](https://github.com/Eg0r0k/kappa-ui/commit/3e1a8a0fbd233bef58298a5da89f1f8ef3aa56a7) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `vRipple` leaves a disabled host alone (`:disabled`, `aria-disabled="true"` or `data-disabled`), and a `v-ripple` on a component that already ripples now overrides the one inside it from the first render, not only after an update.
  
  `--kappa-ripple: none` turns the ripple off for an element and everything inside it, read at the moment of the press: put it on `:root` to go without ripples, built-in ones included. `state-layer` now yields its pressed layer only while a wave is showing, so a press keeps its feedback once the ripple is off.

## 0.10.0

### Minor Changes

- [#12](https://github.com/Eg0r0k/kappa-ui/pull/12) [`65ef2c8`](https://github.com/Eg0r0k/kappa-ui/commit/65ef2c828c4d5c7e5df5399cd1c1fd6e62f01056) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `tailwind.css` adds the `navigation-menu-motion` utility, which slides a navigation menu panel in from the side of the trigger you came from and out the other way, from Reka UI's `data-motion`. A horizontal menu's `data-motion` already follows the screen in right-to-left text, so unlike `drawer-menu` it isn't mirrored; a vertical one slides up and down. `--navigation-menu-motion-distance` sets how far, 25% of the panel by default. Reduced motion turns it off.

- [#12](https://github.com/Eg0r0k/kappa-ui/pull/12) [`5a478d3`](https://github.com/Eg0r0k/kappa-ui/commit/5a478d36ccc36106507b86fc5efe267b78b8c4f5) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `tone-control` works with a `color` prop. On an element with `data-slot` and `data-color` it leaves `--tone`, `--tone-foreground` and `--tone-text` to the `[data-slot][data-color]` rules, so the control takes that tone, and it keeps `--input` as the unchecked edge. A colour other than `primary` also rings the control in its `--tone-text`. Any other element gets `primary` exactly as before, now including `--tone-text`, so copies of Switch, Checkbox, Radio and Slider made before the prop look the same. `tone-invalid` now turns `--tone-text` `destructive` along with the rest of the tone, so edges, marks and rings drawn in it go red on an invalid control too. Copies made before the prop don't read `--tone-text`, so they look the same. `choice-row` tints a selected option in its group's tone when the group has `data-slot` and `data-color`, and in `primary` when it doesn't.

### Patch Changes

- [#12](https://github.com/Eg0r0k/kappa-ui/pull/12) [`3b30d74`](https://github.com/Eg0r0k/kappa-ui/commit/3b30d74fab198e31a727d58ef4dc06bc73f686ea) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `tailwind.css` builds next to a plain shadcn-vue theme. Every kappa token it reads now carries its default from the `tokens` item as a fallback: `--color-destructive-foreground`, the `success`, `warning` and `info` colours with their `-foreground` and `-text`, `--state-hover`, `--state-pressed`, `--state-selected`, `--press-scale` and `--press-duration`. Before, a project without the `tokens` item failed the Tailwind build with `Could not resolve value for theme function: theme(--color-destructive-foreground)`. With the tokens installed nothing changes: their values still win. The shadcn tokens, such as `--color-primary`, `--color-foreground` and `--color-input`, stay required.

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
