# @kappa-ui/registry

## 0.24.1

### Patch Changes

- [`35a5371`](https://github.com/Eg0r0k/kappa-ui/commit/35a537152bd1fd0a47942246639757800145dc15) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - No component styles an element through a `:has()` on its parent or group any more. Chrome restyles the whole subtree of every `:has()` anchor above a node that is added or removed, once some rule puts `:has()` away from the element it styles: a page wrapped in one such anchor recalculated every element for each list row it mounted. The Dialog, Drawer and Tour headers, the InputGroup and InputNumber insets, the Combobox clear button, the InputFloating notch, a FieldLabel beside a disabled checkbox or radio, the Rating ring, and the Slider and ScrollArea examples now read their neighbours with `~` or a `:has()` on the element itself. The InputGroup addons fade through a variable that the group sets. FileUpload, Image, Marquee and DataTable mark the state on an element instead: the hidden input's focus, an ImageError inside, keyboard focus, and the body above pinned bottom rows. `scripts/has-selectors.test.ts` keeps the pattern out.
  
  `useSwipeSnap` no longer flushes styles for an instant move that leaves the offset where it is, such as new points at rest.
- Updated dependencies [[`35a5371`](https://github.com/Eg0r0k/kappa-ui/commit/35a537152bd1fd0a47942246639757800145dc15)]:
  - @kappa-ui/core@0.17.1

## 0.24.0

### Minor Changes

- [`409c999`](https://github.com/Eg0r0k/kappa-ui/commit/409c9997c26d538af9e4273ccaeaf1f36cd0f75a) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Chart galleries: thirty examples in the Area, Bar and Line galleries, each a registry block ported from shadcn's charts.
  
  `ChartContainer` hands `events` to its default slot, so a chart the crosshair cannot follow (a pie, a horizontal bar) feeds the tooltip from Unovis events in its own template; `events(selector)` returns the same object for the same selector, so the chart does not re-render on every parent render.
  
  Fixes: a hovered area keeps its fill opacity instead of turning opaque; a root with no height keeps the chart's natural height instead of collapsing; the tooltip neither fades nor slides after the pointer under reduced motion.

## 0.23.0

### Minor Changes

- [`8f6aab4`](https://github.com/Eg0r0k/kappa-ui/commit/8f6aab4f0ec8e6793c3108c629c77d4e558cbf0a) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `Chart`: charts on Unovis. `ChartContainer` turns a config into series colours (`--color-<key>`, `light-dark()` pairs) and maps Unovis' variables onto the theme; `ChartCrosshair` reports the hovered point with no trailing line; `ChartTooltip` and `ChartTooltipContent` are Vue components positioned beside the pointer, with slots, zero values shown and a finger supported; `ChartLegend` can hide a series. Five `--chart-*` tokens ship with the `tokens` item, light and dark, validated for colour-vision separation in both modes, so `add @kappa-ui/chart` brings them into a project set up before this release. The theme's `:root` now sets `color-scheme: light`.

- [`330cdd2`](https://github.com/Eg0r0k/kappa-ui/commit/330cdd22a3f9bab867c0bbcf5ae1c1f98e164274) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Breaking: an `id` on `Field` or `FieldSet` lands on the field's root element, so a link to it scrolls to the field. The control's `id` moved to a prop of its own, `controlId` on `Field`; the label still follows it. `<Field id="email">` that was meant for the input becomes `<Field control-id="email">`. `FieldSet` has no `controlId`: its legend names the group, and the `id` it used to take never reached the group.

- [`44fdc9a`](https://github.com/Eg0r0k/kappa-ui/commit/44fdc9a051aa53f74002ee41b050cbfbaff74242) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - ScrollArea: `virtualize` takes `getItemKey`, `anchorTo` and `followOnAppend` from TanStack Virtual. With `getItemKey`, rows are keyed by item instead of index, so a row keeps its element and measured size when rows arrive above it. `anchorTo: 'end'` keeps the first visible row in place as rows are added or removed at either end. `followOnAppend` makes a view at the end follow appended rows: a chat that loads older messages above and new ones below. The new `setScrollPositionSilently(axis, offset)` jumps without emitting `scroll`, `reachEdge` or `virtualScroll`, for restoring a saved position. Both setters now hold in `onMounted` on a virtual list, which TanStack used to scroll back to the top when it attached to the viewport a tick later. `useInfiniteScroll` with a ScrollArea API as its target no longer shifts a list anchored to the end a second time after loading above it.

### Patch Changes

- [`bc6008b`](https://github.com/Eg0r0k/kappa-ui/commit/bc6008bf50d492cb0490e21311bdbb0cec3d8661) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Exits now use the decelerating curve, like entrances. Collapsible, Accordion, the overlay surfaces (Popover, Select, Menu, Tooltip), Drawer, Toast and InnerLoading used to close on `--ease-emphasized-accelerate`, which holds still for most of its duration and then snaps shut; closing on `--ease-standard-decelerate` starts at once and settles gently, so the same duration feels faster. The tokens themselves are unchanged.
- Updated dependencies [[`bc6008b`](https://github.com/Eg0r0k/kappa-ui/commit/bc6008bf50d492cb0490e21311bdbb0cec3d8661), [`0107e40`](https://github.com/Eg0r0k/kappa-ui/commit/0107e40c9f08e57f3042bd796e294d090128997c)]:
  - @kappa-ui/core@0.17.0

## 0.22.1

### Patch Changes

- [`9398d0f`](https://github.com/Eg0r0k/kappa-ui/commit/9398d0f5234c5e0daac84398a0ad1ed17eca72e5) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Item: a long title or description no longer pushes the content under the media or past the row's edge. `ItemContent` can shrink (`min-w-0`) and `ItemTitle` stops at its column (`max-w-full`), so `line-clamp-1` on the title, or a `truncate` span inside it, cuts the text with an ellipsis.

- [`20b5be9`](https://github.com/Eg0r0k/kappa-ui/commit/20b5be9378a39d725cfcc01896dce6a4c6f97455) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - PageIndicator: each page's pressable area now reaches half the gap past its dot, so the row has no dead space between pages, and a hover or a press lights that area up as a halo, as on Checkbox; the dot itself no longer darkens on hover. `touchTarget` still grows the area to 48px.

## 0.22.0

### Minor Changes

- [`95b68d3`](https://github.com/Eg0r0k/kappa-ui/commit/95b68d3ecaa3b70275e69fa6e48f61665c1741d4) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Breaking: the focus ring's colour hook is `--focus-ring-color`, no longer `--color-ring`. `focus-ring` and `focus-ring-inset` read `var(--focus-ring-color, --theme(--color-ring))`, so a `.dark` island (or any subtree that sets `--ring`) rings its controls in its own `--ring`; a class such as `[--color-ring:currentColor]` copied from the kit now has no effect and becomes `[--focus-ring-color:currentColor]`. `tone-control`, `AlertClose`, `BannerClose` and the `ChoiceGroup` cards set the new variable.

- [`6784a5e`](https://github.com/Eg0r0k/kappa-ui/commit/6784a5ec655082852ae5ddf5a3f460cac0973955) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - ScrollArea sizes from its content: `max-h-*`, `flex-1` (with or without `min-h-0`), a grid row and auto height work, so a Card body or a chip strip needs no fixed height. A ScrollArea with no size now shows its content instead of collapsing, and `virtualize` without a bounded height or width warns once in development.
  
  Inside a ScrollArea, a Table's own sideways scrolling turns off, so a sticky `TableHeader` sticks to the area; give the ScrollArea `orientation="both"` when the table can be wider than it.

- [`37a2189`](https://github.com/Eg0r0k/kappa-ui/commit/37a2189daf8b962ba7197afdc89e48db49735cf0) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - ScrollArea virtualizes columns as well as rows (`virtualize.columns`), so a wide virtual grid gets a horizontal bar and `data-overflow-x-*`. The slot renders once per visible cell with `{ item, index, column }`, and the exposed API gains `scrollToColumn` and `columnVirtualizer`.

- [`aac2ce3`](https://github.com/Eg0r0k/kappa-ui/commit/aac2ce302b6e6f356c36fc76354c3794a28027f8) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Breaking: `StepperItem` is the named group `group/stepper-item` instead of a bare `group`, and the indicator and separator read their state through `group-data-[state=…]/stepper-item:` and `group-data-disabled/stepper-item:`. An outer element with the `group` class and a `data-state` (an outer step of a nested stepper, your own wrapper) no longer paints the steps inside it. Classes you copied from the examples as `group-data-[state=completed]:bg-primary` need the new suffix: `group-data-[state=completed]/stepper-item:bg-primary`.

- [`552297f`](https://github.com/Eg0r0k/kappa-ui/commit/552297fddbb274f7e2fe0a5abc4832128e9f4b6d) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - The text-control frame moves to its own lib item `text-control`; Select, Combobox, DatePicker and the other text controls import it from `@/lib/text-control` instead of `@/ui/input`.

### Patch Changes

- [`265cef5`](https://github.com/Eg0r0k/kappa-ui/commit/265cef5c0441a3808b4d1a936d9c9586d2c9049e) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - An open `AccordionTrigger` turns only its chevron (the last icon), not an icon placed before the question, and the chevron stops animating its turn under reduced motion.

- [`b827f85`](https://github.com/Eg0r0k/kappa-ui/commit/b827f85dab7838398e6e19195da23e0a13cd7412) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - An open `AccordionContent` no longer clips its content: the accordion keyframes clip while the panel's height animates, as Collapsible's do, and the part drops its permanent `overflow-hidden`, so a focus ring or a shadow inside an open answer shows in full.

- [`727fdf9`](https://github.com/Eg0r0k/kappa-ui/commit/727fdf9eb92b760110fcb55fe207a5bff72a34a9) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A plain `mt-*` class on `AlertDescription` now sets its gap under `AlertTitle`; the built-in 4px gap comes through a variable instead of a selector that outranked the class.

- [`d6571f8`](https://github.com/Eg0r0k/kappa-ui/commit/d6571f87df1c83646e549451ee37c503b2c48243) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - The footer of an `sm` AlertDialog splits into as many equal columns as it has buttons, so `alert({ size: "sm" })` gives its lone OK button the whole width instead of half.

- [`4712efa`](https://github.com/Eg0r0k/kappa-ui/commit/4712efa23322c76cf68e6dd5c50ab7c3ba1a8922) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A `Kbd` inside a Button wrapped in `TooltipTrigger as-child` (or any other `as-child` trigger) keeps the button's colours, and an `InputGroupButton` wrapped the same way in a block addon keeps the addon's inset. The trigger's `data-slot` replaces the child's own, as in shadcn, so Kbd now keys on the `<button>` element (any button tints it, Toggle and Toolbar items included) and the block addon sets the inset on its children.

- [`d4674af`](https://github.com/Eg0r0k/kappa-ui/commit/d4674aff7b3d8e4362d75d11f6eea8af61560d5f) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `AvatarFallback :delay-ms="0"` shows the fallback once the image fails, like leaving `delayMs` out; Reka's fallback treated `0` as a delay that never started, so the avatar stayed blank.

- [`2b1e734`](https://github.com/Eg0r0k/kappa-ui/commit/2b1e734bb9a5b28b3e77ac275d832207164cab92) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A square Badge with `touchTarget="wrapper"` reserves room at its sides as well as above and below, so the 48px touch areas of neighbouring square badges no longer overlap.

- [`cc8c5ec`](https://github.com/Eg0r0k/kappa-ui/commit/cc8c5ec173de1d9079efbf1e202f93e3e853230b) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A `gap-*` class on `BreadcrumbList` applies at every width; the list's own gap, wider from the `sm` breakpoint up, now comes through `--breadcrumb-gap`, so its `sm:` rule no longer outranks the class.

- [`986a0db`](https://github.com/Eg0r0k/kappa-ui/commit/986a0dbffc6665f83828904f596da6136520a882) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - The default `BreadcrumbSeparator` chevron points the other way in right-to-left text.

- [`28514cf`](https://github.com/Eg0r0k/kappa-ui/commit/28514cf4cbd7ed12dd7b4defa02d0e834caafaaa) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `Button` transitions with Tailwind's default `transition` list instead of `transition-colors`, so `<Button class="press-scale">` dips while held. The dip takes Button's own duration; `--press-duration` applies to elements without a transition of their own.

- [`53b65fd`](https://github.com/Eg0r0k/kappa-ui/commit/53b65fddf6ece408da8d8320e54427b35a55bb3b) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Week numbers in `Calendar` and `RangeCalendar` stay within 1 to 53 in a non-Gregorian calendar such as `fa-IR`'s Persian one: each row's first day is converted to the Gregorian calendar before Reka numbers it, instead of being diffed against January 1 of the same year number in the Gregorian calendar.

- [`dd958f2`](https://github.com/Eg0r0k/kappa-ui/commit/dd958f24a2f73c4e682e33b17e78b85e73b5166e) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `border-b` on `CardHeader` and `border-t` on `CardFooter`, the Card page's divider recipe, draw in `--border` instead of the text colour: both parts carry `border-border`, since Tailwind's preflight leaves borders at `currentColor`.

- [`ac0cc05`](https://github.com/Eg0r0k/kappa-ui/commit/ac0cc05256617ac3ff6a6121ab56f2985cf46786) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `Checkbox`, `Radio`, `Switch` and `Slider` no longer declare `as` and `asChild`, as `Rating` already does: Reka's slot cloned the control's own indicator, thumb or track into the root, which left an inert control. The props are gone from their API tables too.

- [`f29a239`](https://github.com/Eg0r0k/kappa-ui/commit/f29a23978917de695c9aee640ece2f8f4ae68d1e) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A row of a disabled `RadioGroup` or `CheckboxGroup`, or of a group inside a disabled `FieldSet`, looks disabled: `choice-row` drops its hover tint and shows a `not-allowed` cursor when the row's checkbox or radio is disabled, not only when its `Field` is, and `FieldLabel` dims beside a disabled checkbox or radio.

- [`cb25aeb`](https://github.com/Eg0r0k/kappa-ui/commit/cb25aeb0a24adcdcc12319b8f1f095efddd4bd37) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `AlertClose` and `BannerClose` render `type="button"`, so in a form they are no longer its default button: Enter in a field submits the form instead of closing the notice.

- [`1bf62ee`](https://github.com/Eg0r0k/kappa-ui/commit/1bf62eeb8120b216222b6779d8961d490b030cd6) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `cn()` knows the kit's `shadow-shadow-*` elevations: `shadow-none` on a part now removes its elevation instead of losing to it, a shadow colour such as `shadow-black/40` tints it instead of removing it, and two elevations merge to the last one.

- [`7dffb11`](https://github.com/Eg0r0k/kappa-ui/commit/7dffb1170dfa5037752f5f42e88ae723a90354f8) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `CollapsibleContent` puts its `class` on a new `div` inside the animated panel, as `AccordionContent` does, so padding, a border or a display class no longer keep a closed panel visible: Chromium left an empty strip, and Safari, which has no `hidden="until-found"`, showed closed content styled with a display class. The DOM gains that inner `div`; a selector or style that targeted the panel element through your `class` now finds it one level down.

- [`89ede95`](https://github.com/Eg0r0k/kappa-ui/commit/89ede95c545ee4143d9d2ea8c78a3a9b60970734) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `ColorPicker` snaps back to its model when the parent turns an update down, as `Rating` does, instead of showing a colour the model never took.

- [`e04cde3`](https://github.com/Eg0r0k/kappa-ui/commit/e04cde3d029060c44da3bcfa2435b0ec74cf411e) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - ColorPicker follows a controlled `v-model` that an undo or a reset sets back to the colour the picker last wrote; it used to skip that value as its own echo and stay on the colour in between.

- [`b3cd937`](https://github.com/Eg0r0k/kappa-ui/commit/b3cd9377b09056f6491a3c440d45e77dad3e3512) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Components follow `.dark` through tokens only. The `Tabs` pill fills with the new `--tabs-pill` token (the page background, and `--input` at 30% under `.dark`) instead of `dark:bg-input/30`, and `shimmer` takes its brighter dark highlight from a `.dark` value of `--shimmer-color` instead of `@variant dark`. Both now switch with the `.dark` class even in a project whose own `dark` variant is something else.

- [`5e45209`](https://github.com/Eg0r0k/kappa-ui/commit/5e45209570f43e846d75b24d3fd0771e756ed6e8) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - DataTable footer cells take the column's `td` style, as they already took its `td` class, instead of the header's `th` style.

- [`9e522da`](https://github.com/Eg0r0k/kappa-ui/commit/9e522dab3cbbabcc50658d616e241ad41b7cf122) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A DataTable with `onLoadMore` and no `height` looks for its scroller above its own container, which only scrolls sideways: it no longer loads page after page on mount while the end of the page is far away.

- [`5e1669a`](https://github.com/Eg0r0k/kappa-ui/commit/5e1669a27a8217fc9b920523fc5203eb534caccf) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - In page mode, the DataTable header checkbox on a later page selects that page, as its unchecked look promises, instead of clearing the selection made on the first page.

- [`adb6166`](https://github.com/Eg0r0k/kappa-ui/commit/adb61665218e446997e9ad35b48048b4a0932f7f) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `DataTablePagination` keys its page buttons by page number instead of position, so pressing Enter on a page keeps focus on that page instead of the button that slides into its place.

- [`778f538`](https://github.com/Eg0r0k/kappa-ui/commit/778f538523400bd5711fb541fd87dc335b2b68a3) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Selecting all rows of a DataTable leaves the rows `enableRowSelection` locks unchecked and out of the count: the banner and `getSelection().count` say 45 of 50 when five rows are locked, in client mode.

- [`62f072d`](https://github.com/Eg0r0k/kappa-ui/commit/62f072d04e417ca21e6dc025aae42b35ceddea0b) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Setting a bound `v-model:row-selection` back to `undefined` clears the DataTable's checked rows instead of leaving the last selection on screen.

- [`a1eac85`](https://github.com/Eg0r0k/kappa-ui/commit/a1eac85b025212eee0b6016aff348f83bd2e8614) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A server-paginated DataTable follows a `rowCount` that arrives or changes after mount: it shows "1–10 of 95" and pages through it instead of staying on "Page N" or dropping to "0–0 of 0" at the first page change. The page count is computed from the row count and the page size, so page changes past the last page are clamped as TanStack does for a known count.

- [`e04fbcd`](https://github.com/Eg0r0k/kappa-ui/commit/e04fbcd600fa714b0d2ac4ec690f48790b366b44) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A server-rendered DataTable carries its column widths and pinned-column offsets in its HTML, so sized columns render at their width before hydration instead of jumping into it.

- [`8ee8861`](https://github.com/Eg0r0k/kappa-ui/commit/8ee88614dc91921c11c7a3ed3e3fc3ef6b4ba85e) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `DrawerHandle as-child` renders its child with the handle's behaviour; the registry part used to drop its slot, so the handle vanished.

- [`36aba2b`](https://github.com/Eg0r0k/kappa-ui/commit/36aba2b775c25c05e1178b77848be76cbad31cf6) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `DrawerMenu as-child` makes the child the menu root: the child gets the root's attributes (`data-slot`, classes, `dir`, the height variable and the back keys), its own content becomes the root panel, and the submenu panels render inside it. Before, the attributes landed on the root panel and the submenus sat outside the child.

- [`c3a7ba0`](https://github.com/Eg0r0k/kappa-ui/commit/c3a7ba0f9afb1c1b03b653aecb8f4b8994c7a28f) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Enter that saves an `Editable` inside a form no longer submits the form as well. With `submitMode="blur"`, or with Shift or Meta held, Enter keeps the form's own behaviour.

- [`1a307f9`](https://github.com/Eg0r0k/kappa-ui/commit/1a307f96459bf6f08da4ffe30da2c31cf19842d9) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - After Enter or Escape ends an edit, `Editable` gives focus back to its preview instead of dropping it to `<body>` as the input hides, without starting a focus-activated edit again. A save on blur leaves focus where the user moved it.

- [`7c3b1ae`](https://github.com/Eg0r0k/kappa-ui/commit/7c3b1ae01353618acebd18cb5c57888061779da9) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `Editable` sizes its field to the text with classes of its own instead of Reka's inline `all: unset` style: the area is an inline grid with the text and the field in one cell, and the one not in use is invisible. Width, background, font and other classes on `EditableInput` now apply; before, only `!` classes did. The look and the sizing are unchanged, and `autoResize` still turns it off.

- [`b0d5b8b`](https://github.com/Eg0r0k/kappa-ui/commit/b0d5b8b9c7202afab9e2e6d92c9aac261ee58e9b) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `icon-size-*` on `EmptyMedia` now sizes its bare icon: the part's own icon rule sits in `:where()`, so it no longer ties with the class and wins by source order.

- [`750df71`](https://github.com/Eg0r0k/kappa-ui/commit/750df71f5ecf297ed52baee7bfc96a9d8f4e55c5) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A `Field` or `FieldSet` inside a disabled `FieldSet` is disabled too, so a `Slider`, `Rating` or `ColorPicker` in its own Field stops taking focus and input while the form is locked. Only `disabled` passes down; `invalid` and `required` stay with the part that sets them.

- [`0ac645f`](https://github.com/Eg0r0k/kappa-ui/commit/0ac645f205329db9813f42c8d0c6925227b7ba43) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `InnerLoading` no longer sets `aria-busy` on its root while loading. The covered content is already `inert`, and `aria-busy` also held back the overlay's `role="status"` inside it, so screen readers could skip the status the overlay shows.

- [`7fbf5ee`](https://github.com/Eg0r0k/kappa-ui/commit/7fbf5eecff74f9566ba3735da8d69a7a7d7ba081) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `InputGroupButton` inside a disabled Field is disabled, not only faded with its addon: it no longer takes focus or runs its click (InputTimeGroup's "Now" button changed the value of a disabled field). A `disabled` attribute passed to the button still wins.

- [`897f2ac`](https://github.com/Eg0r0k/kappa-ui/commit/897f2ac877f2daa782c12101e8141c5d9dee14b8) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - An `InputGroup` holding a `DatePicker` or `DateRangePicker` keeps its frame in the focus colour while the calendar is open, as the picker's own frame does; focus has moved into the calendar, so the group's focus rule no longer matched.

- [`29fb25c`](https://github.com/Eg0r0k/kappa-ui/commit/29fb25cb5149e8cb4d5ad28d65ec147525c53240) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `InputGroupTextarea` exposes `resize()`, like `Textarea`.

- [`fbe99ae`](https://github.com/Eg0r0k/kappa-ui/commit/fbe99ae73775de9da2a61593d4f48a4073a557ec) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - InputNumber takes its text alignment from its own root through `--input-number-align`: a vertical InputNumber in a horizontal Field is no longer centred, an alignment class such as `text-start` on `InputNumberInput` wins, and a vertical decrement keeps its corner inside a filled Item.

- [`74d8f9f`](https://github.com/Eg0r0k/kappa-ui/commit/74d8f9f7afc20b406cea76d3f04d5ea3d72132ce) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `InputTime` and `InputTimeRange` stay empty when the parent clears their `v-model` and a change of `granularity` or `hourCycle` then remounts the segments; they used to bring back the last typed value.

- [`c227d32`](https://github.com/Eg0r0k/kappa-ui/commit/c227d32ed245d713d127c9a1911cd169fae597ea) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A required `InputTimeRange` whose end is missing when the form submits focuses the end's first segment instead of the start's.

- [`eedbfb0`](https://github.com/Eg0r0k/kappa-ui/commit/eedbfb0045280db328d547be3fcc6b23650d01f0) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A class such as `self-center` or `translate-y-0` on `ItemMedia` now wins over the top alignment it takes beside an `ItemDescription`: `Item` passes that alignment down through `--item-media-align` and `--item-media-shift` instead of a group variant that outranked the class.

- [`0b8fe94`](https://github.com/Eg0r0k/kappa-ui/commit/0b8fe945148a5dbb52b87daa28ae57f8d47b58d2) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `MenuTrigger` renders `type="button"`, so a trigger inside a form opens its menu without submitting the form; with `as-child` the child keeps its own type.

- [`cd67d47`](https://github.com/Eg0r0k/kappa-ui/commit/cd67d47125622259a513b4e243bbab0c4f14646f) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A `Menu` with `target: false` opens centred in the viewport instead of half off its top-left corner (an `anchor` or `self` you pass still wins), and `show(event)` on such a menu with `contextMenu` or `touchPosition` opens at the event's position.

- [`3ca3f0a`](https://github.com/Eg0r0k/kappa-ui/commit/3ca3f0a024c82dd0e2d18da4e76c6720e103ac3d) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A Menubar trigger clicked while another menu (or its own) is still fading out opens its menu: the closing menu no longer treats that press as an outside click and closes the whole bar.

- [`a921978`](https://github.com/Eg0r0k/kappa-ui/commit/a921978c01b9b9ec5be1aee62ea3407f71ccfd01) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Menubar switches between menus at once: the menu being left closes without its fade, so ArrowLeft back into a menu that was still closing keeps focus in it instead of dropping it to `<body>`. Closing by Escape, a pick or an outside click still fades.

- [`7f34747`](https://github.com/Eg0r0k/kappa-ui/commit/7f34747a0fa1ed9bbc9a47d176bfe2aae20b60d5) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Menubar triggers take the line height of their size's label scale; they read a variable nothing defined and fell back to 1.5 times the font size.

- [`ee25b0f`](https://github.com/Eg0r0k/kappa-ui/commit/ee25b0f48614cc718835b2d99dc122130b7de6b6) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - The modal scrim's hold renders a comment instead of a hidden `<span>`, and `PopoverContent`, `DatePickerContent` and `Menu` put it after their slot: `PopoverContent as-child` renders the consumer's element as the panel instead of moving the panel's role, classes and `data-slot` onto the hidden span, and a panel's first element child is the consumer's again.

- [`fb216dc`](https://github.com/Eg0r0k/kappa-ui/commit/fb216dc3534e1c891ee3331e429c0a9e6e9ba3a2) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `NavigationMenuIndicator` renders nothing in a `NavigationMenu` with `:viewport="false"`, where it used to sit under the first item whichever trigger was open, and warns once about it in development.

- [`0f77a24`](https://github.com/Eg0r0k/kappa-ui/commit/0f77a2430b374b10579a9cdf7d82936b8ebbb50e) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - NavigationMenu: the gap between the list and a panel is the root variable `--nav-offset` (4px), read through plain margins, so a margin class on `NavigationMenuContent` wins and `[--nav-offset:…]` on `NavigationMenu` moves the viewport and the indicator's arrow together. The page now shows how to change a vertical trigger's alignment.

- [`ca08048`](https://github.com/Eg0r0k/kappa-ui/commit/ca080482f20d1c59578abc1dca08fa1d7190487a) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A Dialog (or AlertDialog, or a `useConfirm` prompt) opened over a Drawer, or a Drawer opened over a Dialog, dims the page once: the lower overlay turns transparent as it already did for a dialog over a dialog.

- [`d5fd78c`](https://github.com/Eg0r0k/kappa-ui/commit/d5fd78c64ef4032a8e52fd6aec0a635cf3f9922e) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A width class on a `line` PageIndicator (`w-40`, or `h-*` when vertical) now sets its length instead of losing to the `data-[orientation]` rule that stretched it across its parent.

- [`13863fd`](https://github.com/Eg0r0k/kappa-ui/commit/13863fda37f707fd75fb84915fa8ee1260fe548f) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A `disabled` Pagination disables its `as-child` link pages as well: they carry `aria-disabled`, look disabled and do not navigate. Button pages carry `aria-disabled` next to their native `disabled`.

- [`6ad0607`](https://github.com/Eg0r0k/kappa-ui/commit/6ad0607355ee3a4d5d5dd7a0566e45abddb90e3e) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `DatePickerCalendar` and `DateRangePickerCalendar` render a fresh calendar each time the picker opens. With `force-mount`, or when the picker reopened during its close animation, the still-mounted calendar lost its placeholder when the picker reset it, threw and came back empty.

- [`2b1d39a`](https://github.com/Eg0r0k/kappa-ui/commit/2b1d39addb9caa3e30c0251875a95f85d3ef59d0) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `DatePicker` and `DateRangePicker` keep a bound `modelValue`, `open` or `placeholder` until the parent changes it: a parent that refuses a picked date, or binds `open` to `false` without a listener, no longer sees the picker show a value or a panel it never accepted. Unbound, they keep their own state as before.

- [`676e751`](https://github.com/Eg0r0k/kappa-ui/commit/676e751c30178e5bd4014234f277c6784a752585) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Progress clamps a value outside `0` to `max` before Reka sees it, so a float overshoot such as `100.4` shows a full bar instead of Reka rewriting the model to `null`, and `aria-valuenow` never passes `aria-valuemax`. `NaN` shows an indeterminate bar.

- [`1b1de29`](https://github.com/Eg0r0k/kappa-ui/commit/1b1de29eb63f9dd0dd31147e33528e560b3161b0) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `Progress` renders the `ConfigProvider` direction as its root's `dir`, so the determinate fill and the indeterminate animations read one source: before, `<html dir="rtl">` without a `ConfigProvider` mirrored the carousel while the fill still grew from the left. Such an app now gets a left-to-right bar in both modes; wrap the app in `ConfigProvider dir="rtl"`.

- [`7b34963`](https://github.com/Eg0r0k/kappa-ui/commit/7b34963fe065078838db3c2cdb409fdf281867a5) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - The corner role tokens (`--radius-control-*`, `--radius-surface-*`, `--radius-item-*`) move from the `theme` item to the `tokens` item, which every component brings. A project that skipped init and kept its own shadcn theme now gets `rounded-control-*`, `rounded-surface-*` and `rounded-item-*` (and the `rounded-inset-*`/`rounded-outset-*` forms on them) instead of square corners. They scale from your `--radius` and the optional `--control-radius`, `--surface-radius` and `--item-radius` knobs, as before.

- [`1424429`](https://github.com/Eg0r0k/kappa-ui/commit/14244291b81ca8a1326d16f763e28c2a9ec64c0f) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A disabled `RangeCalendar` draws its range ends in the disabled fill, like a disabled `Calendar`'s selected day, instead of solid destructive red: Reka reports every day of a disabled calendar as unavailable, which marked the value invalid, and a calendar root no longer takes the invalid tone while it is disabled.

- [`47435b2`](https://github.com/Eg0r0k/kappa-ui/commit/47435b2368def1d080dbd7576a6f18eddcc3aebf) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A wheel over a ScrollArea's bar or thumb scrolls the area instead of the page: the bar and thumb sit beside the viewport, outside its scroll chain, and now forward the wheel to it. At the area's edge the page still takes the wheel, and Ctrl+wheel still zooms.

- [`f75454e`](https://github.com/Eg0r0k/kappa-ui/commit/f75454e9eca76518bb9f8b83ed650e1317b71f71) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - In external-scroll mode (`virtualize.getScrollElement`), ScrollArea's `getScrollTarget`, `setScrollPosition` and `setScrollPercentage` act on the external scroller instead of the inner viewport, which never scrolls there, so a nested `InfiniteScroll` reads the right edge. `getScroll` and `getScrollPosition` still report the inner viewport in that mode.

- [`97eb8c2`](https://github.com/Eg0r0k/kappa-ui/commit/97eb8c2791942c37d2814c9e1cfb49a92ce4f1fa) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A virtualized ScrollArea given an inline `virtualize` object no longer re-measures on every parent render: equal options keep their resolved form, so the sizes measured above the viewport survive an unrelated update and the list stops jumping. A function `estimateSize` or `getScrollElement` written inline still counts as a change; hoist those.

- [`a751cf6`](https://github.com/Eg0r0k/kappa-ui/commit/a751cf62370a4c0faead4d37928c512a1b140c49) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - ScrollArea measures its content in layout pixels, as it measures its viewport: under a scaled ancestor, and in a Dialog, Popover or Menu that opens with the default scale-in, the content was measured short for its whole life, so the thumb came out too long, the end fade dropped out and `reachEdge` fired early.

- [`288472a`](https://github.com/Eg0r0k/kappa-ui/commit/288472a63f177468f22cbcd820ef4f9beca9bce5) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Only a primary-button press on a ScrollArea's bar or thumb jumps or drags the content; a right or middle press no longer does.

- [`3d564c4`](https://github.com/Eg0r0k/kappa-ui/commit/3d564c4a33fda36ba9bf5d633fdc63a163e0159a) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A long `Select` or `Combobox` list shows the browser's thin scrollbar, as Menu does, instead of scrolling with no visible sign. Reka hides it with an unlayered style, so the viewports set `[scrollbar-width:thin]!`; hiding it again takes an important class too, such as `[&_[data-slot=select-viewport]]:[scrollbar-width:none]!` on `SelectContent` or `[scrollbar-width:none]!` on `ComboboxViewport`.

- [`3adb637`](https://github.com/Eg0r0k/kappa-ui/commit/3adb637eb85f8208d14b5b3c9cd19464b8ed37cf) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A length class on `Separator` now applies: `h-4` on a vertical separator or `w-12` on a horizontal one sizes it instead of losing to the `data-[orientation]` rules that stretched it. The orientation's classes are picked from the prop, and `data-orientation` stays on the element.

- [`9a6eefe`](https://github.com/Eg0r0k/kappa-ui/commit/9a6eefebc5e14bbe1dc36139e152e9934c84159c) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A bare `<Spinner />` is `1em` square, the size of the surrounding text, instead of as wide as its container; a size class or a Button still sizes it. Its styles sit in `@layer components`, so a class such as `animate-none` now replaces its animation.

- [`fc19419`](https://github.com/Eg0r0k/kappa-ui/commit/fc1941988c1ac1310679fda854e26a818193ea33) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A thickness class on `StepperSeparator` (`h-1` across a horizontal stepper, `w-1` down a vertical one) now wins; the separator takes its size-driven thickness through `--stepper-separator-h` and `--stepper-separator-w` instead of `data-[orientation]` rules that outranked the class.

- [`c0f96e5`](https://github.com/Eg0r0k/kappa-ui/commit/c0f96e52f6dc3195c325138693729349b06baa0a) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A vertical `Stepper` draws its separators as a rail: a `StepperSeparator` placed straight in a `StepperItem` runs beside the step from 4px under the indicator to 4px above the next one, where it used to stretch across the row and come out 0px tall. The vertical trigger is a row with the indicator first. The rail spans `--stepper-gap`, the space between steps, and `start-*`, `top-*` and `bottom-*` on the separator move it. `stepperItem` and `stepperTrigger` are now `stepperItemVariants` and `stepperTriggerVariants`, which take the `orientation`. Horizontal steppers are unchanged.

- [`a435c72`](https://github.com/Eg0r0k/kappa-ui/commit/a435c721a7881075514817e3a093c63bf79588e8) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `SwipeItem` takes a `dir` prop and renders its direction (the prop, else `ConfigProvider`) as the row's `dir`, so the drag, the arrow keys and the strips' placement agree: before, in `<html dir="rtl">` without a `ConfigProvider`, a drag revealed the empty side and the open strip sat outside the row. Such an app now gets left-to-right rows (strips do not swap); set `dir="rtl"` on the row or wrap the app in `ConfigProvider dir="rtl"`.

- [`85b907b`](https://github.com/Eg0r0k/kappa-ui/commit/85b907b6f2dd31742ea92bc15d8694aeb6008d10) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A `SwipeView` page that receives focus (when the page holding it leaves the frame, or a Tabs panel reached with Tab) drops the browser's default outline: it shows the kit's inset focus ring after a keyboard action and nothing after a swipe, a tap or a click.

- [`36027c4`](https://github.com/Eg0r0k/kappa-ui/commit/36027c410ceba08a3d51d6aefa5027ed67778cdb) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A class on `Table` now retunes its rows and text: the size variables and the text size live on the root, where the class lands, instead of on the inner `<table>`, which redeclared them. The root also carries `data-size`.

- [`22c2911`](https://github.com/Eg0r0k/kappa-ui/commit/22c29117f602fab8ec62f189df6bdd619d839f78) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Table rows are 36px at `sm`, as the scale and the DataTable virtualizer's estimate say, not 37px; and a DataTable row with an expand or group toggle keeps its size's row height (44px at `md`) instead of growing by a pixel to fit the toggle. Virtualized `sm` tables and tree or grouped tables no longer drift when they scroll to a row.

- [`b81d4d6`](https://github.com/Eg0r0k/kappa-ui/commit/b81d4d6e8f3a5d779f4844facba18bacfcb958a1) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - The `TabsList` indicator follows the active trigger when a tab is inserted before it or removed: the list watches its children and asks Reka's indicator to measure again, which a fixed-width list never prompted.

- [`81c6407`](https://github.com/Eg0r0k/kappa-ui/commit/81c64071056e6746ce1155c8e216f8a24bd2094a) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - The pill `TabsList`'s thumb stays on the triggers when a class such as `p-2` changes the list's padding: it is centred on the list's cross axis instead of sitting 4px in.

- [`88f0beb`](https://github.com/Eg0r0k/kappa-ui/commit/88f0beb9015dc1e34aa49a3fd00b23c1338f56ee) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `flex-none` (or any `flex-*` class) on a horizontal pill `TabsTrigger` now wins over the stretch the list gives its triggers; the list passes the stretch down through `--tabs-trigger-flex`.

- [`939037b`](https://github.com/Eg0r0k/kappa-ui/commit/939037b65963f38a6e01edfec2616a7b6e0585b1) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A focused text control that is `:user-invalid` (a `required` Input, Textarea, InputFloating or PinInput slot left empty) keeps its destructive border; the focus border used to win over it, leaving a primary outer edge around a destructive inner ring.

- [`d5720b8`](https://github.com/Eg0r0k/kappa-ui/commit/d5720b840483bbd1ef0845ef8bb86e46c5768fdc) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - An `autoresize` Textarea mounted while hidden (a closed tab, a Collapsible, a `hidden md:block` column) measures itself when it shows instead of staying collapsed until the user types, and it re-measures by itself when its width changes.

- [`0c80a2d`](https://github.com/Eg0r0k/kappa-ui/commit/0c80a2dbdf5936a2894a7bab9689ac13a0de6568) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `Textarea` works its vertical padding out from the control height of its size and its own line height, so a one-row textarea is as tall as the `Input` of the same size and variant, on narrow screens too (it was 2px taller, 6px below 768px, and the `filled` variant needs 1px more at the top for its single border). Every textarea loses 1 to 6px of vertical padding. A `py-*` class on it still wins.

- [`70d1620`](https://github.com/Eg0r0k/kappa-ui/commit/70d162063997d100a21e5e343b185d7fbfe26f34) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Colours written inside arbitrary values and variables now resolve where the element sits, so a `.dark` island (or any subtree that sets a token) gets its own: the filled Input, InputGroup and DatePicker underline, the Table hover, selected and stripe tints, the disabled Slider and Rating fills and the ColorPicker checkerboard read `--theme(--color-x)` instead of `var(--color-x)`, which Tailwind resolves once on `:root`. The ripple wave reads `--state-pressed` where it is pressed (the `ripple` item no longer pins `--kappa-ripple-opacity` on `:root`), so a subtree that changes `--state-pressed` changes the wave as well as the state layer.

- [`5c0a1ae`](https://github.com/Eg0r0k/kappa-ui/commit/5c0a1ae2e5990d660725f91fb1e789232c13e00a) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Closing the last toast with the mouse no longer leaves the toaster paused: the next toast's progress bar runs, and in Firefox its timer starts and it closes on time. `ToastRecordRoot` clears Reka's paused flag when the last toast unmounts, and `Toaster` clears its own when its list empties.

- [`a68b4b7`](https://github.com/Eg0r0k/kappa-ui/commit/a68b4b7bb27d5b91dede3989387896b966dacbbd) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Toasts stay clickable while a modal Dialog, Drawer or other overlay that blocks outside pointer events is open: a press on a toast's action runs it instead of falling through to the dialog's overlay and closing the dialog.

- [`d30f753`](https://github.com/Eg0r0k/kappa-ui/commit/d30f753fc203f8dbe5e1867185c150408ebd6fb4) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A class on `Toaster` now wins over its built-in styles: `w-96`, `bottom-24` or `[--toast-gap:1rem]` set the viewport's width, inset and spacing. The toaster's `<style>` block sits in `@layer components` instead of outranking every utility.

- [`73e420f`](https://github.com/Eg0r0k/kappa-ui/commit/73e420f6cef9acfd3228aadf90ba33391044ff24) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `Toaster` renders the `ConfigProvider` direction as its viewport's `dir`, so the placement, the dismissing swipe and the progress bar agree: under `ConfigProvider dir="rtl"` a `bottom-end` toaster sits at the left edge and swipes left. An app that sets only `<html dir="rtl">` without a `ConfigProvider` now gets a left-to-right toaster (right edge, swipe right, bar shrinking to the left); wrap the app in `ConfigProvider dir="rtl"`.

- [`ac9afad`](https://github.com/Eg0r0k/kappa-ui/commit/ac9afad6650a396544c20633c4fd29018f57e054) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - An `aria-disabled` Toggle, ToggleGroupItem or ToolbarToggleItem ignores click, Enter and Space like an `aria-disabled` Button, so a toolbar toggle kept focusable for its tooltip no longer changes the model. `swallowWhenDisabled` moves to `@/ui/button`, where the three parts share it.

- [`ea2717b`](https://github.com/Eg0r0k/kappa-ui/commit/ea2717b7ca6d9584495bbcf5648e3604c4e72aef) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - In a ToggleGroup (or a ButtonGroup of toggles) whose `activeVariant` is `outline` or `subtle`, pressed neighbours share one edge instead of drawing two side by side: `Toggle` and `ToggleGroupItem` carry `data-active-variant`, and the group overlaps them by that edge as it does for an outline variant.

- [`49f6278`](https://github.com/Eg0r0k/kappa-ui/commit/49f6278ecf177c4d584801394c80dfe6203fdeb4) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `useTour` returns `loop`, and `TourNext` reads "Next" rather than "Finish" on the last step of a looping tour, where pressing it goes back to the first step.

- [`0a937be`](https://github.com/Eg0r0k/kappa-ui/commit/0a937be60a5b5d0113275ee1c37e301f8fce9498) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `TourContent` honours a listener that calls `preventDefault()` on `openAutoFocus`: focus stays where it is instead of moving to `TourNext`.

- [`01c825f`](https://github.com/Eg0r0k/kappa-ui/commit/01c825fd9a94c72276988ac727a4c2a474776250) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A `Tour` whose tour starts during setup renders on the server: it no longer reads `document.activeElement` there to remember the element to give focus back to.
- Updated dependencies [[`b827f85`](https://github.com/Eg0r0k/kappa-ui/commit/b827f85dab7838398e6e19195da23e0a13cd7412), [`f29a239`](https://github.com/Eg0r0k/kappa-ui/commit/f29a23978917de695c9aee640ece2f8f4ae68d1e), [`b3cd937`](https://github.com/Eg0r0k/kappa-ui/commit/b3cd9377b09056f6491a3c440d45e77dad3e3512), [`97fc92b`](https://github.com/Eg0r0k/kappa-ui/commit/97fc92bc2ac170fa33efdfea882f0bc78e26f70d), [`03cf21f`](https://github.com/Eg0r0k/kappa-ui/commit/03cf21f3a127b262656336a7033088a9de340675), [`36aba2b`](https://github.com/Eg0r0k/kappa-ui/commit/36aba2b775c25c05e1178b77848be76cbad31cf6), [`95b68d3`](https://github.com/Eg0r0k/kappa-ui/commit/95b68d3ecaa3b70275e69fa6e48f61665c1741d4), [`ee25b0f`](https://github.com/Eg0r0k/kappa-ui/commit/ee25b0f48614cc718835b2d99dc122130b7de6b6), [`c2b5813`](https://github.com/Eg0r0k/kappa-ui/commit/c2b5813ac526a7a95fed662ef825884896f6efda), [`7b34963`](https://github.com/Eg0r0k/kappa-ui/commit/7b34963fe065078838db3c2cdb409fdf281867a5), [`0b689cc`](https://github.com/Eg0r0k/kappa-ui/commit/0b689cced404489a8c6e0a9fc02a5eea47a4f1e5), [`30fcc19`](https://github.com/Eg0r0k/kappa-ui/commit/30fcc19b97ad9d8215649aec2f874eaee3f6ea73), [`1fe3cec`](https://github.com/Eg0r0k/kappa-ui/commit/1fe3cec756b2d9c5d782e90db3cec7962af15934), [`26880d8`](https://github.com/Eg0r0k/kappa-ui/commit/26880d816b5c31816fcfc160b2a6ccfd06ccbd1d), [`129bc1d`](https://github.com/Eg0r0k/kappa-ui/commit/129bc1dd4da9bd24b6834b239e55277b8ade11ea), [`8329332`](https://github.com/Eg0r0k/kappa-ui/commit/8329332f78ec917c5235ce525c15e8a11c3d2b18), [`a435c72`](https://github.com/Eg0r0k/kappa-ui/commit/a435c721a7881075514817e3a093c63bf79588e8), [`1960479`](https://github.com/Eg0r0k/kappa-ui/commit/1960479fbd84330168eaed32152af9cd63414e1e), [`1ebc3d6`](https://github.com/Eg0r0k/kappa-ui/commit/1ebc3d6e101f6125032a792e14148aa926d8d0a9), [`76d453f`](https://github.com/Eg0r0k/kappa-ui/commit/76d453f7de0980c67cf8781dcfb6da3d954cef1d), [`895afdc`](https://github.com/Eg0r0k/kappa-ui/commit/895afdcc072b3ebf571e342078822ed86e770d01), [`50250ec`](https://github.com/Eg0r0k/kappa-ui/commit/50250ec24b684549f9c0911f3638123568e23617), [`70d1620`](https://github.com/Eg0r0k/kappa-ui/commit/70d162063997d100a21e5e343b185d7fbfe26f34), [`4892a23`](https://github.com/Eg0r0k/kappa-ui/commit/4892a23c0c96bc049ed16cccfc5ca3517711ae3d), [`5c0a1ae`](https://github.com/Eg0r0k/kappa-ui/commit/5c0a1ae2e5990d660725f91fb1e789232c13e00a), [`6b26bf7`](https://github.com/Eg0r0k/kappa-ui/commit/6b26bf7e73f7cd765734d6a8f868e926098bc22d), [`49f6278`](https://github.com/Eg0r0k/kappa-ui/commit/49f6278ecf177c4d584801394c80dfe6203fdeb4)]:
  - @kappa-ui/core@0.16.0

## 0.21.0

### Minor Changes

- [`6d5114c`](https://github.com/Eg0r0k/kappa-ui/commit/6d5114c54496098db105ea437221a9cf89d1c36d) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `AlertClose`: a close button for `Alert`, like `BannerClose`. It sits at the end of the title's line (centred when horizontal), takes the alert's text colour and a size that follows the alert's, and the text keeps clear of it. `Alert` gains `v-model:open`; the item now depends on `button` and `@lucide/vue`.

- [`7858b46`](https://github.com/Eg0r0k/kappa-ui/commit/7858b46e8994de344d3d6a8447ed570d64dca1df) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `DataTable` takes an `error` prop and slot. Any value but `undefined`, `null` and `false` turns it on, so `:error="query.error.value"` works as is; the `error` slot gets `{ error }`. It shows where the empty message does, in place of the rows, the skeleton and the empty message, and pauses infinite scroll. Without the slot, a string is the message and anything else reads "Something went wrong". `ui.error` styles its box.

- [`b073de0`](https://github.com/Eg0r0k/kappa-ui/commit/b073de035351e86e7697085ba6d0d6b1fe8d25e1) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `DataTree`: a tree drawn from data over the Tree parts, as DataTable is over Table. It takes Tree's props, draws each row from the node's `icon` and `label` (with a checkbox in checkbox mode, or your own through the `item` slot), and shows loading (skeleton rows), empty and error states in its frame through `loading`, `empty` and `error` and their slots, error first. `virtualize` renders only the rows near the view. `v-model` and `v-model:expanded` survive a state.

- [`c30241a`](https://github.com/Eg0r0k/kappa-ui/commit/c30241a4ecda0e03e88576b3e925db63dcd8e960) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `Editable`: text that turns into a field where it stands, over Reka UI. Four parts (`Editable`, `EditableArea`, `EditablePreview`, `EditableInput`); the text and the field take the surrounding type, `autoResize` is on so entering edit mode moves nothing, and edit, save and cancel buttons come from the root slot. A disabled editable leaves the tab order, which Reka's preview does not do on its own.

- [`a45ad9f`](https://github.com/Eg0r0k/kappa-ui/commit/a45ad9f4449b79d55db0097615c3b2edbef741c0) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `ErrorState`: Empty's anatomy for a failure. Six parts (`ErrorState`, `ErrorStateHeader`, `ErrorStateMedia`, `ErrorStateTitle`, `ErrorStateDescription`, `ErrorStateActions`) over the Empty parts, `role="alert"` on the root unless you pass another `role`, a circled exclamation mark in the destructive colour as the default media, and `size` from `xs` to `xl` as on Empty.

- [`7940e7c`](https://github.com/Eg0r0k/kappa-ui/commit/7940e7cebb19942b55b67f08138f160088d38526) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - FileUpload's parts follow its `size` through CSS variables on the root instead of reading it from the context: `--file-upload-gap`, `--file-upload-padding`, `--file-upload-control`, `--file-upload-icon`, `--file-upload-remove-icon`, and `--file-upload-title`, `--file-upload-description` and `--file-upload-name` with their `-leading` twins. A class on a part now wins over its size, and one variable on the root retunes every part. Nothing moves by a pixel. The size-free styles are plain strings now: `fileUploadIcon`, `fileUploadTitle`, `fileUploadDescription`, `fileUploadItemName` and `fileUploadRemoveOverlay` replace the `…Variants` functions, and the dropzone, list, item and preview variants lost their `size` key.

- [`02e469f`](https://github.com/Eg0r0k/kappa-ui/commit/02e469fb8d08df9dacb8a461d07c261173990d45) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `MenuItem`, `MenubarItem` and `DrawerMenuItem` take `color` instead of `variant`: `variant="destructive"` becomes `color="destructive"`, and every other tone (`primary`, `neutral`, `success`, `warning`, `info` or one you declare on `[data-slot][data-color="<name>"]`) now works too. The item, its icon and its hover layer read `--tone-text`; `data-variant` is gone from the item and `data-color` carries the colour.

- [`6de5eb4`](https://github.com/Eg0r0k/kappa-ui/commit/6de5eb4cbe7c6b0d51a7e682a5645ba5b72594a2) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - The Select trigger's chevron and the Combobox chevron grow with `size` like every other control's icons (`--control-icon-*`, 14px at `xs` to 20px at `xl`), and the Select trigger's gap follows `--control-gap-*`; the Combobox clear button stays 2px smaller than the chevron. `sm` and `md` look as before.

- [`ad14b64`](https://github.com/Eg0r0k/kappa-ui/commit/ad14b64b4159ee00cfeb9a44debcd8c569a3b886) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `SelectContent` no longer renders `SelectScrollUpButton` and `SelectScrollDownButton`: a long list scrolls like any other instead of scrolling under the pointer as it hovers an arrow. Both parts stay exported, so a project that wants them puts them back around the viewport in its own `SelectContent`, or wraps the slot in a `ScrollArea`.

- [`e5495ef`](https://github.com/Eg0r0k/kappa-ui/commit/e5495efd7ca83e271b79b6a15bbc41765d25cc17) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `size` works the same way everywhere. Every component exports its size type (`AlertSize`, `BadgeSize`, `CardSize`, `CheckboxSize`, `RadioSize`, `SwitchSize`, `EmptySize`, `InputFloatingSize`, `ItemSize`, `ListboxSize`, `SeparatorSize`, `SliderSize`, `StepperSize`, `TabsSize`, `TextareaSize`, `TimelineSize`) and the props take it without `null`; Button-based parts take `ButtonSize`, Input `TextControlSize`, SelectTrigger `SelectSize` and Tree `TreeSize`. ToggleGroup and ToolbarToggleGroup carry `data-size` on the group as well. Table's row heights moved into `tableSize`, so a class on DataTable's `ui.table` overrides `--table-row-h` at every size, not only at `md`.

- [`95a0fa1`](https://github.com/Eg0r0k/kappa-ui/commit/95a0fa1ef11f99fe7cb11e494954769d80fdf057) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Parts follow their root's `size` through CSS variables instead of the context, so a class on a part wins over the size. PinInput sets `--pin-input-slot`, TagsInput `--tags-input-line` and `--tags-input-delete`, and PinInput, InputNumber, TagsInput and InputGroup set `--control-text` and `--control-text-leading` for the field inside (`textControlText` and `textControlInnerText` in `@/ui/input`). NavigationMenu's triggers and links read the `--nav-*` variables of the menu instead of setting their own, and DataTable's sort buttons and row toggles shrink at `xs` through the table's variables. PinInput's slots now sit `--control-gap-*` apart (2px wider at `sm`, `lg` and `xl`); nothing else moves. `inputNumberInputVariants`, `tagsInputInputVariants` and `tagsInputItemDeleteVariants` became the strings `inputNumberInput`, `tagsInputInput` and `tagsInputItemDelete`, `inputGroupControlText` is gone, and `pinInputSlotVariants` lost its `size` key.

### Patch Changes

- [`1ac32b3`](https://github.com/Eg0r0k/kappa-ui/commit/1ac32b3f261d1ece5888360bf1b65f32272c1d5c) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `AlertDialogMedia` is centred again in an `AlertDialogContent` with `size="sm"`: `AlertDialogHeader` centres its children at `sm`, as the footer keeps its two-column grid.

- [`2fac232`](https://github.com/Eg0r0k/kappa-ui/commit/2fac23241f04edeaf9e5ddbf5c91b0885a7e328a) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - PageIndicator: the dots after a moving pill no longer jump a pixel while it eases. `tailwind.css` registers `--page-indicator-length` with `@property`, the items transition it instead of `width`, and each item takes it rounded to whole pixels, up for the current page and down for the rest, so the two lengths that trade places always add up to the same width.

- [`5ada64b`](https://github.com/Eg0r0k/kappa-ui/commit/5ada64b448678d7d086bc1c8f303ee722beb8427) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A pressed Toggle or ToggleGroup item keeps its on look inside `TooltipTrigger as-child` (or any wrapper that writes its own `data-state`). The on styles read `aria-pressed`, which Reka sets on every toggle, instead of `data-state="on"`, which the tooltip overwrote with `closed`; core's active-colour rules match both, so a custom `[data-state="on"][data-active-color]` rule keeps working.
- Updated dependencies [[`2fac232`](https://github.com/Eg0r0k/kappa-ui/commit/2fac23241f04edeaf9e5ddbf5c91b0885a7e328a), [`5ada64b`](https://github.com/Eg0r0k/kappa-ui/commit/5ada64b448678d7d086bc1c8f303ee722beb8427), [`32546e6`](https://github.com/Eg0r0k/kappa-ui/commit/32546e686df232e355400040c9ea997b64beb5aa)]:
  - @kappa-ui/core@0.15.1

## 0.20.0

### Minor Changes

- [`250226f`](https://github.com/Eg0r0k/kappa-ui/commit/250226ff98bca45595d2ef17808a75393d13e9ed) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `Marquee`: content that scrolls forever. The slot is repeated `repeat` times (two by default) and slid by core's `animate-marquee`; copies after the first are `aria-hidden` with their focusable elements out of the Tab order, while the pointer works on every copy. `paused` stops it for a control of your own, `pause-on-hover` holds it under the pointer, keyboard focus inside stops it, `reverse` runs it the other way, `orientation="vertical"` scrolls a column, and `fade` dissolves the edges through a mask that works on any background. `--marquee-gap`, `--marquee-duration` and `--marquee-fade` tune it from a class.

- [`b7a84d5`](https://github.com/Eg0r0k/kappa-ui/commit/b7a84d5cd8cf0030436d10cb80b9ea0357e0dd37) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `Timeline`: a record of events with an optional current one. Eight parts (`Timeline`, `TimelineItem`, `TimelineIndicator`, `TimelineSeparator`, `TimelineContent`, `TimelineDate`, `TimelineTitle`, `TimelineDescription`), `v-model`/`default-value` for the current record, `reverse` for lists that run newest first, `orientation`, `size` from `xs` to `xl` as the record's density through `--timeline-*` variables on the root, and `color` on the root or on one indicator.

### Patch Changes

- Updated dependencies [[`da01a2a`](https://github.com/Eg0r0k/kappa-ui/commit/da01a2a0226864a15731a4b16584e0226aaca060)]:
  - @kappa-ui/core@0.15.0

## 0.19.0

### Minor Changes

- [`264c758`](https://github.com/Eg0r0k/kappa-ui/commit/264c758d5cd7fa515e9f4da2cd16fb8bd9907008) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Item: `size` is the row's density, as in shadcn. It sets padding, gap and the media size (through `--item-media` on the root), and no longer scales the text of `ItemTitle` and `ItemDescription`, which stay at `text-label-lg` and `text-body-md`. The parts carry no `group-data-[size=…]` variants any more, so a `class` of your own, like `text-body-sm`, `line-clamp-none` or `size-12` on an `ItemMedia`, wins.

- [`adf96cd`](https://github.com/Eg0r0k/kappa-ui/commit/adf96cdafafe2e646fc90abed419f34dc4397942) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Parts no longer style themselves from their root's `size` through `group-data-[size=…]` variants, which beat any plain class of yours. `size` is the density of the root, and a `class` on a part wins:
  
  - Card, Empty, Alert and Stepper: `CardTitle`, `CardDescription`, `EmptyTitle`, `EmptyDescription`, `AlertTitle`, `AlertDescription`, `StepperTitle` and `StepperDescription` keep one text size at every root size (title-md/body-md, title-sm/body-md for Alert, title-sm/body-sm for Stepper). Empty's icon and gaps and Stepper's indicator number still follow the size, through `--empty-icon`, `--empty-header-gap`, `--empty-content-gap` and `--stepper-text` on the root.
  - Menu and DrawerMenu labels, Menubar triggers and the Calendar heading, weekday cells and week numbers keep scaling with the size, through `--menu-label`, `--menubar-text`, `--calendar-heading` and `--calendar-label` (each with a `-leading` twin) set by the root.
  - AlertDialog `size="sm"` centres its text through the content, so `text-start` on `AlertDialogHeader` wins; the footer keeps its two-column grid.

### Patch Changes

- [`4ff76a9`](https://github.com/Eg0r0k/kappa-ui/commit/4ff76a9166fad90e99e4037fa2baecb19fdf88fa) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - ScrollArea: a vertical area gives its content the area's width, so `truncate`, `line-clamp-*` and percentage widths work inside it. Before, the content box grew to the longest line, as in QScrollArea. `horizontal` and `both` keep letting the content grow.
  
  `setScrollPercentage` and `setScrollPosition` measure the viewport when called instead of reading the last observed size, so `setScrollPercentage('vertical', 1)` right after a content change reaches the new end.

## 0.18.0

### Minor Changes

- [`779955e`](https://github.com/Eg0r0k/kappa-ui/commit/779955e6b5e698179c9900e5feef1658cef56df4) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Corners come in three roles: `rounded-control-*`, `rounded-surface-*` and `rounded-item-*`, each scaled from `--radius` and tunable on its own with `--control-radius`, `--surface-radius` and `--item-radius`, on `:root` or any element. Every component uses them, and `cn()` merges them, so a `class` prop still wins.
  
  - `--control-radius` was the Input family's frame variable. It now sets every control, and the frames use `--frame-radius`.
  - Nested parts no longer turn square at small radii: the InputGroup button, the InputNumber steppers, the TagsInput chips, the DatePicker trigger and the Toast and Tour close buttons.
  - Menus, lists, pill tabs, the menubar and the toolbar wrap their corners around their items. Pill tabs are rounder (12/8px at md instead of 8/4px), menus and lists grow by up to 2px, and their rows at sizes `xs` and `xl` follow their height. Item `sm` takes 8px instead of 6.4px.

### Patch Changes

- Updated dependencies [[`6887534`](https://github.com/Eg0r0k/kappa-ui/commit/6887534c8c7d8b707da54f663e312a95b75d1284), [`779955e`](https://github.com/Eg0r0k/kappa-ui/commit/779955e6b5e698179c9900e5feef1658cef56df4)]:
  - @kappa-ui/core@0.14.0

## 0.17.0

### Minor Changes

- [`7951a0f`](https://github.com/Eg0r0k/kappa-ui/commit/7951a0fc256ef40ba789e317d865746ff0cb9994) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `Marker`: an inline status, a bordered row or a labelled separator, from shadcn-vue, with a `color`. New `Banner`: a full-width notice with a title, a subtitle, actions and a close button, `v-model:open` and `color`. New `Tour`: parts over Popover for a guided tour driven by `useTour`. `Skeleton` takes a `color`.

- [`6c50288`](https://github.com/Eg0r0k/kappa-ui/commit/6c50288335a6cb85df8599769c2ecd9d3f6e43a4) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `SwipeViews`: pages that follow the finger, the way native apps page between tabs. It holds the page in the frame in `v-model`, pairs with Tabs on the same model, and lays its `SwipeView`s out in a row that a swipe or a flick moves along. `layout="stack"` lays the pages on top of each other, each sliding in over the one before it, as in a navigation stack. The frame and every page carry CSS variables for layouts and effects of your own. `SwipeViewsSwipeArea` adds a strip at an edge, and `swipe-area-only` makes it the only way to swipe. The mechanism underneath comes as its own item, `swipe-snap`, with `useSwipeSnap` for sheets, galleries and pagers of your own.

### Patch Changes

- Updated dependencies [[`6fb58da`](https://github.com/Eg0r0k/kappa-ui/commit/6fb58dabbc2584b9e3c72d7c72fd912cc2d726da), [`7951a0f`](https://github.com/Eg0r0k/kappa-ui/commit/7951a0fc256ef40ba789e317d865746ff0cb9994), [`7200c46`](https://github.com/Eg0r0k/kappa-ui/commit/7200c4616b871c57ba1ff3deedba9d16f75f57da), [`908bb3b`](https://github.com/Eg0r0k/kappa-ui/commit/908bb3bb589c650741c6e9289b1e875b0b3ca749)]:
  - @kappa-ui/core@0.13.0

## 0.16.0

### Minor Changes

- [`39324b3`](https://github.com/Eg0r0k/kappa-ui/commit/39324b361ee48bee6d0286e968532b37ce6797a7) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - InfiniteScroll takes `shouldLoad`, the "time to load?" check `useInfiniteScroll()` already had: it gets the direction and replaces the `offset` check, and returning `undefined` falls back to `offset`.

- [`18e317c`](https://github.com/Eg0r0k/kappa-ui/commit/18e317c6d7a19dfbefb04e88ba628c6bd72548cb) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Slider's parts are components of their own: `SliderTrack`, `SliderRange`, `SliderThumb` and `SliderHandle`, each taking a `class`. Slider still draws them itself when given no children, so `<Slider v-model>` works as before. Lay them out in its slot, which gives `{ thumbs, values }`, to restyle a part or to name each thumb of a range on its own.

- [`2244090`](https://github.com/Eg0r0k/kappa-ui/commit/2244090e4ef8856c8ec55c3b51595e7dafdf4ae7) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Menus, select lists and popovers no longer melt into the dialog or card they open on. Dialogs, alert dialogs and drawers take a new `--dialog` surface, and in the dark theme `--popover` sits a step above it (0.24 instead of 0.205). Menus and popovers draw their shadow from a new `--shadow-popover`, dialogs from `--shadow-dialog`: a 1px ring over the old shadow in the light theme, and in the dark theme a top highlight, a ring inside and out and a layered drop, so two surfaces of one tone keep an edge between them. A theme without these tokens falls back to `--popover`, `--shadow-lg` and `--shadow-xl`, which is how they looked before; set the role shadows to those to drop the edge.

- [`df7e5fd`](https://github.com/Eg0r0k/kappa-ui/commit/df7e5fd7e74a15a5edccee798f4cb38fb91a3811) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A click on a Tree folder's chevron only opens or closes it. It used to select the row as well, and in checkbox mode check the whole folder, so a folder couldn't be opened without changing what was checked.
  
  In checkbox mode a click checks only on `TreeItemCheckbox`. A click on the rest of the row opens or closes a folder, as in a tree without checkboxes, and does nothing on a leaf; Space still checks the focused row.

### Patch Changes

- [`635a4f4`](https://github.com/Eg0r0k/kappa-ui/commit/635a4f4c0f4836ce87b51ecb2cf7e981d67aaa8a) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - The theme derives `--primary`, `--primary-foreground` and `--ring` from `--brand` without `calc()` over a colour channel. cssnano, which Nuxt runs on production CSS, can't parse `calc(c * 0.6)` and warned on every CSS chunk; the same chroma now comes from mixing `--brand` with a hueless colour, so the colours don't change.

- [`f6972bc`](https://github.com/Eg0r0k/kappa-ui/commit/f6972bc81df1474b4c9013109e9d6c78eb267cec) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `add input-time` installs `@internationalized/date`. InputTime's value is a `Time` from that package, which a project has to import to set one, and pnpm doesn't let a project import what only reka-ui depends on.
- Updated dependencies [[`d675257`](https://github.com/Eg0r0k/kappa-ui/commit/d67525707fcd1aaf8f55ae07a32c4743e79b4e40)]:
  - @kappa-ui/core@0.12.0

## 0.15.0

### Minor Changes

- [`d09f26a`](https://github.com/Eg0r0k/kappa-ui/commit/d09f26af39cf8740b38a3c3c97f19ccdbd2fe3e3) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Pressable parts ripple on their own: Button, Toggle, ToggleGroupItem, Item as a link or a button, the calendar days, tabs, accordion, menubar and navigation menu triggers, the items of Menu, Menubar, Select, Combobox, Command, DrawerMenu, Listbox and Tree, and the clear buttons of TagsInput and Combobox. Each imports the directive from `@/lib/ripple`, so `add` brings the `ripple` item along and nothing needs registering. On menu, listbox and tree rows the wave replaces the pressed layer, as `state-layer` already did. Bind `v-ripple="false"` on a Button to turn one off, or set `--kappa-ripple: none` on `:root` to turn them all off.

### Patch Changes

- Updated dependencies [[`3e1a8a0`](https://github.com/Eg0r0k/kappa-ui/commit/3e1a8a0fbd233bef58298a5da89f1f8ef3aa56a7)]:
  - @kappa-ui/core@0.11.0

## 0.14.0

### Minor Changes

- [`2add2d3`](https://github.com/Eg0r0k/kappa-ui/commit/2add2d393e21a52b99793b8f1022b024f285a125) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `FileUpload` is built from parts, after Dice UI's anatomy: `FileUpload` (the files, the checks, the hidden input, paste, Field wiring and `size`), `FileUploadDropzone` (drops and a click, `variant`), `FileUploadTrigger` (the button that opens the dialog, `as-child` for a Button), `FileUploadIcon`, `FileUploadTitle`, `FileUploadDescription`, `FileUploadList` (`layout` list or grid), `FileUploadItem`, `FileUploadItemPreview`, `FileUploadItemMetadata`, `FileUploadItemDelete` and `FileUploadClear`, plus `fileKey(file)` for `v-for` keys. The zone that is one button is `FileUploadDropzone as-child` on the trigger; a zone with a Browse button holds an `as-child` trigger and is no tab stop itself. The props `mode`, `layout`, `position`, `label`, `description`, `icon`, `file-icon`, `file-image`, `file-delete`, `preview`, `interactive` and `dropzone`, the 14 slots and the exposed `triggerEl` are gone: compose the parts instead, and put a ref on the trigger for Formisch. `removeFile` takes the file, not an index. A trigger without a dropzone no longer takes drops.

- [`2c0edc3`](https://github.com/Eg0r0k/kappa-ui/commit/2c0edc3cde1959ceb764bcb039a1cd3721f634e9) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `Kbd` takes a `size`, `xs` to `xl` (16 to 28px tall), with the label and icons scaled to match. `md` is the size it had before.

- [`90d509d`](https://github.com/Eg0r0k/kappa-ui/commit/90d509dedf70ab39f9eddc93c6895c2fa0f182ec) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `Rating` is built from parts: `Rating` holds the value and gives `items`, and each `RatingItem` draws one star, so `<Rating v-model="stars" v-slot="{ items }"><RatingItem v-for="item in items" :key="item" :item="item" /></Rating>`. A custom icon goes inside `RatingItem`, with `filled` telling the empty layer from the filled one; the `icon` and `empty-icon` slots are gone. Showing a score is its own part pair, `RatingDisplay` with `RatingDisplayItem`, which takes a `value` and draws it exactly as one `role="img"` picture; the `readonly` prop is gone.

- [`b8167cf`](https://github.com/Eg0r0k/kappa-ui/commit/b8167cf7528615ebeb7073dd83814b390074c315) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `Tree` no longer draws its rows: render a `TreeItem` for each of the default slot's `items` and fill it with `TreeItemToggle`, `TreeItemCheckbox`, `TreeItemIcon`, `TreeItemLabel` or anything else, as with Reka's `TreeRoot`. The `item`, `item-leading`, `item-label` and `item-trailing` slots, `TreeItem`'s `leading`, `label` and `trailing` slots, and `label-key` are gone; the row's state comes with `TreeItem`'s slot. Virtualization is a part: put a `TreeVirtualizer` in a tree rendered `as="div"` with a height, instead of `virtualize`; its `text-content` gives typeahead each node's text. `checkbox` stays a selection mode (multiple, cascade, `aria-checked`) and no longer adds checkboxes by itself.

### Patch Changes

- [`ef1938f`](https://github.com/Eg0r0k/kappa-ui/commit/ef1938f040d7317fb48bbff2e7ffef8f3d0164db) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `CommandList` takes no room when it has nothing to show: with every item filtered out and no `CommandEmpty`, or with no items at all, it collapses, padding included. The line between the input and the results now belongs to the list, so it goes with it, and an input with nothing under it no longer ends in a stray border.

## 0.13.2

### Patch Changes

- [`e5cbc67`](https://github.com/Eg0r0k/kappa-ui/commit/e5cbc67b28ec5b0c93f5ffae3e24beb64faca4d8) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `FileUpload` exposes the element that takes focus as `triggerEl` instead of `triggerRef`. In a Nuxt project the auto-imported Vue `triggerRef` is typed on every component instance, so `triggerRef` on a template ref read as a function and the Formisch example failed to type-check.

## 0.13.1

### Patch Changes

- [`84b03c8`](https://github.com/Eg0r0k/kappa-ui/commit/84b03c81e0a987f8b40d2b685102de0c71ff6eb5) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `DateRangePicker` installs and type-checks in a fresh project. Its `index.ts` re-exported the shared `DatePicker` parts with `export … from`, and the shadcn-vue CLI rewrites the alias only in imports, so the installed file still pointed at `@/registry/kappa-ui/ui/date-picker`.

## 0.13.0

### Minor Changes

- [#12](https://github.com/Eg0r0k/kappa-ui/pull/12) [`d9c272f`](https://github.com/Eg0r0k/kappa-ui/commit/d9c272f26679ebe25e3179908630260ecf4ff4b4) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `DatePicker` and `DateRangePicker`: an `InputDate` or `InputDateRange` with a calendar button that opens a `Calendar` or `RangeCalendar` in a popover, so a date can be typed or picked into the same `v-model`. `<DatePicker v-model="date" />` renders the whole thing; the parts (`DatePickerInput`, `DatePickerTrigger`, `DatePickerValue`, `DatePickerContent`, `DatePickerCalendar` and their range twins) compose a layout of your own, including the shadcn-style outline button with `DatePickerTrigger as-child`. The field comes in Input's five variants and five sizes, the calendar follows the field's size unless it has its own, and inside an `InputGroup` the picker takes the group's frame. Picking a day closes the calendar (not when there are time segments, whose typed time a pick keeps), clicking the selected day keeps it, every month draws six weeks so the panel doesn't jump, and Alt+ArrowDown opens it from a segment. Focus on open lands on the selected day, today or the first day you can pick, never on a hidden copy from the neighbouring month. `focus` and `blur` fire once for the field, the button and the calendar together, so validate-on-blur doesn't flag the field while the calendar is open. In a Field, a button trigger takes the label, the description and the invalid state, and `name` submits through a hidden input: `YYYY-MM-DD` for a date, `name[start]` and `name[end]` for a range, with `required` needing both ends.

- [#12](https://github.com/Eg0r0k/kappa-ui/pull/12) [`936ab40`](https://github.com/Eg0r0k/kappa-ui/commit/936ab4003dab1131ec4189332dd2a0abdaabdd3d) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `InputDate` and `InputDateRange`: segmented date fields over Reka UI's `DateField` and `DateRangeField`, in Input's five variants and five sizes, with optional time segments, `min-value`/`max-value`, `is-date-unavailable`, `loading` and Field wiring. Inside an `InputGroup` they drop their own frame and take the group's variant and size. Pasting an ISO date (`2025-03-14`, or `2025-03-14T09:30`) fills every segment, and Enter submits the form through its submit button, like a native date input. `InputDateRange` submits `name[start]` and `name[end]` as ISO dates, empty until that end is filled, and `required` needs both.
  
  `InputTime` and `InputTimeRange` get the same fixes. `focus` and `blur` now fire once when focus enters or leaves the field, so a form library's validate-on-blur runs; before, they never fired. Clicking the frame outside the segments focuses the first one, Enter submits the form, and changing `granularity` or `hour-cycle` after mount rebuilds the segments instead of leaving stale ones. `InputTimeRange` with `name` now submits `name[start]` and `name[end]` instead of one `start - end` field, which read `undefined - undefined` while empty and never failed `required`. If your server reads the old field, read the two new ones.

- [#12](https://github.com/Eg0r0k/kappa-ui/pull/12) [`839ae3d`](https://github.com/Eg0r0k/kappa-ui/commit/839ae3dc1559b832b5dbd41cc4784f674a79995a) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `Menubar`: a desktop-style row of menus over Reka UI's Menubar, with the shadcn-vue parts (`MenubarMenu`, `MenubarTrigger`, `MenubarContent`, `MenubarItem`, `MenubarCheckboxItem`, `MenubarRadioGroup`, `MenubarRadioItem`, `MenubarItemIndicator`, `MenubarLabel`, `MenubarSeparator`, `MenubarShortcut`, `MenubarGroup`, `MenubarSub`, `MenubarSubTrigger`, `MenubarSubContent`) and Menu's items, five sizes and state layers. `size` sets the triggers and every menu from `xs` to `xl`; `variant` is `outline`, `soft` or `ghost`. The arrow keys wrap by default, `v-model` is typed as the open menu's value, long menus scroll inside the viewport, and a few Reka gaps are closed: moving to an earlier menu with the arrows or the pointer no longer closes the whole bar, Tab from an open menu continues from the bar instead of the end of the page, a menu open on first render is linked to its trigger by `aria-controls`, and `preventDefault()` in `@close-auto-focus` keeps focus off the trigger.

- [#12](https://github.com/Eg0r0k/kappa-ui/pull/12) [`65ef2c8`](https://github.com/Eg0r0k/kappa-ui/commit/65ef2c828c4d5c7e5df5399cd1c1fd6e62f01056) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `navigation-menu` item: `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuTrigger`, `NavigationMenuContent`, `NavigationMenuLink`, `NavigationMenuIndicator`, `NavigationMenuViewport` and `navigationMenuTriggerStyle`, Reka UI's navigation menu with shadcn-vue's part names. Panels open on hover, click or key in one viewport under the list that resizes and slides between them, or under their own trigger with `:viewport="false"`. The root takes `size` (`xs` to `xl` on the control scale, default `md`), `variant` (`ghost` or `link`), a logical `align` and `orientation="vertical"` for a column with panels beside it. `NavigationMenuLink` looks like a trigger at the top level and like a block with a title and a description in a panel, marks the current page with `active` and takes `disabled`. It works around Reka bugs still in 2.11: values that contain each other (`docs` and `docs-api`) opening the wrong panel, ArrowLeft and ArrowRight moving the wrong way in right-to-left text, between top-level items and between a panel's links, and Space closing a panel without a viewport instead of reaching its field or button. Needs the `@kappa-ui/core` release with `navigation-menu-motion`.

- [#12](https://github.com/Eg0r0k/kappa-ui/pull/12) [`11239a6`](https://github.com/Eg0r0k/kappa-ui/commit/11239a6ff69ab7caa722e5af8505afaa597b22cb) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `Rating` component, on Reka UI's Rating: a row of stars to pick a score in whole, half, quarter or tenth steps. It takes `size` from `xs` to `xl` on the control tokens, so it lines up with a Button of the same size, and `color` like the other choice controls, with `warning` for gold stars. `hoverable` previews the value under a mouse or a pen but never under a finger, `clearable` takes the score back, and `touch-target`, vertical and right-to-left layouts and `icon` and `empty-icon` slots work as elsewhere.
  
  `readonly` shows an exact value, 4.3 fills the fifth star to 30%, as one picture named "Rated 4.3 out of 5", with no radios for screen readers to announce. In a Field it takes the field's id, label, description, error, invalid, required and disabled state. In a plain form, a rating with nothing picked, or cleared, submits an empty value, so native `required` holds until a star is picked.

- [#12](https://github.com/Eg0r0k/kappa-ui/pull/12) [`7376882`](https://github.com/Eg0r0k/kappa-ui/commit/7376882877b4e087baff0cab4ec291bb2002c16e) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `Calendar` and `RangeCalendar`: month grids over Reka UI's Calendar and RangeCalendar, in Material 3 look, with the heading at the start, the arrows at the end and round days. Calendar picks one date or several; RangeCalendar picks a start and an end, fills both and draws a soft band between them, with a preview while the end is picked. Both come in five sizes on the control scale (`xs` to `xl`, 36px days at `md`), take `color`, show several months side by side with the neighbouring months' days hidden, add week numbers with `week-numbers`, and wire to `Field`: the field label and the month name label the calendar, and an invalid field turns the selection `destructive`. Each part is exported for a layout of your own, and a `heading` slot with `setPlaceholder` takes month and year pickers. `is-date-disabled` and `is-date-unavailable` can be swapped after mount, `initial-focus` skips the hidden copies of other months' days, and on reka-ui 2.10 a `v-model` rebuilt as a new object for the same day no longer sends the view back to its month.

- [#12](https://github.com/Eg0r0k/kappa-ui/pull/12) [`5a478d3`](https://github.com/Eg0r0k/kappa-ui/commit/5a478d36ccc36106507b86fc5efe267b78b8c4f5) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Checkbox, Radio, Switch, Slider, Progress, Stepper and `TabsList` take `color`: `primary` (the default), `neutral`, `destructive`, `success`, `warning`, `info`, or any name you declare on `[data-slot][data-color="<name>"]`, as on Button. The root carries `data-color`. Whatever they draw straight on the page takes the colour's `--tone-text`: a checked edge, the radio's dot, the default slider's range and thumb, the progress bar and the tab line. That keeps a bright `success`, `warning` or `info` at 3:1 against the page. Fills with something on them, like the checked box, the switch track and the active step, keep `--tone`. On the choice controls the unchecked edge stays `--input` and an invalid control still turns `destructive`. Keyboard focus rings a control in a colour other than `primary` in its `--tone-text`, red once it's invalid. `CheckboxGroup` and `RadioGroup` pass their `color` to every control in them without one, and `ChoiceGroup` takes `color` for the selected card's edge, the focused card's ring and the selected row's tint. Switch, Checkbox, Radio and Slider now set `data-size`, `md` by default. They need the `@kappa-ui/core` release that lets `tone-control` follow `data-color`.
  
  Recoloured Switch, Checkbox, Radio or Slider with `class="[--tone:…] [--tone-foreground:…]"`, as the theming page used to suggest? Their edges and marks now read `--tone-text`, so add `[--tone-text:…]` to the class, or use `color`.

- [#12](https://github.com/Eg0r0k/kappa-ui/pull/12) [`277f092`](https://github.com/Eg0r0k/kappa-ui/commit/277f092d1a59c3ebd1ddfcf83b6a2aa6afbee1fd) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `FileUpload`: a drop zone (`mode="area"`) or a Button (`mode="button"`) that picks files into a `File` or, with `multiple`, a `File[]` `v-model`. Files come from the dialog, a drop or a paste, and all three go through `accept`, `max-size` and `max-files`, so a file of the wrong type never reaches the model even when the user picks "All files" in the dialog; whatever is turned away comes back through `reject` with a reason. Files show as a `list` or a `grid` of thumbnails, under the frame or `inside` it, with a Remove button each that moves focus to the next one. The hidden file input always holds the files on screen, so `name` submits them with a native form, `required` blocks an empty one, and a form reset puts back the starting files. A file drag is always taken, even a rejected one, so the browser never opens the file in place of the page. Five sizes on the control scale, `outline`, `soft` and `subtle` frames, Field wiring, and slots for every part, including `triggerAttrs` for your own button.

- [#12](https://github.com/Eg0r0k/kappa-ui/pull/12) [`93e57a0`](https://github.com/Eg0r0k/kappa-ui/commit/93e57a08392608669378d45f8d0adf0f4ce509ab) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Every size on the control scale is named `xs` to `xl`; `default` and the bare `icon` are gone. To move over:
  
  - `Button`: `size="default"` becomes `size="md"`, or leave `size` out; `size="icon"` becomes `size="icon-md"`. The full set is `xs` to `xl` and `icon-xs` to `icon-xl`. `Toggle`, `ToggleGroup`, `ToggleGroupItem`, the `Toolbar` parts, `AlertDialogAction`, `AlertDialogCancel` and `ToastAction` take the same names; Button, Toggle and ToggleGroup default to `md`, the Toolbar parts keep `sm` and ToastAction keeps `xs`. `InputGroupButton` keeps its own `xs`, `sm`, `icon-xs` and `icon-sm`, 24 and 32px to fit inside the group, `xs` by default. `Pagination` hands its `md` to Button as it is. Button, Toggle and `ToggleGroupItem` set `data-variant`, `data-color` and `data-size` even when you leave them at their defaults.
  - `AlertDialogContent`: `size="default"` becomes `size="md"`, still the default; `sm` is unchanged. The `size` option of `useConfirm`'s `confirm`, `alert` and `prompt` takes the same names.
  - `Table` and `DataTable`: `density` becomes `size`, `data-density` becomes `data-size`, and the `TableDensity` type is now `TableSize`. `sm`, `md` and `lg` keep their 36, 44 and 52px rows; `xs` (28px) and `xl` (60px) are new, and DataTable's virtual row estimates cover them. The cells' padding above and below the text is now `--table-cell-py` on the table: 8px as before, 3px at `xs`. At `xs`, DataTable's sort buttons and expand and group toggles shrink to fit the row. The `table-density` example is now `table-sizes`.
  - `DrawerMenu`: `size` takes `xs` to `xl` like Menu and reads the control scale, plus room for a thumb. `sm`, `md` and `lg` keep their 40, 48 and 56px rows, padding and icons; `xs` is 36px and `xl` 64px. Overriding a `--control-*` token on `:root` now resizes DrawerMenu rows as well.
  - `Select` and `Combobox`: the list opens at the trigger's or anchor's size instead of always at `md`, so `<SelectTrigger size="xl">` opens an `xl` list. `size` on `SelectContent` or `ComboboxList` picks another. Behind an `as-child` button, set `size` on `ComboboxAnchor` to match the button. The Select list now sets its menu variables on `SelectContent` instead of its viewport, so a class such as `[--menu-item-height:2.5rem]` on `SelectContent` reaches the items.
  - `Input`, `Textarea`, `InputFloating`, `SelectTrigger`, `ComboboxAnchor` and `Separator` set `data-size` with the default filled in, and the anchor sets `data-variant` too. With `as-child`, the anchor leaves the button's own `data-variant` and `data-size` alone.

- [#12](https://github.com/Eg0r0k/kappa-ui/pull/12) [`00b6660`](https://github.com/Eg0r0k/kappa-ui/commit/00b6660830b0b64bb3132a87940c7f2efad72e02) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `Tree`: nested items to browse, select or check, over Reka UI's Tree, with `TreeItem`, `TreeItemToggle`, `TreeItemCheckbox`, `TreeItemIcon` and `TreeItemLabel` for rows of your own. Pass `items` and it renders each node's `label`, `icon` and chevron; `children: []` makes a folder that loads later, and `loading` shows a spinner and sets `aria-busy`. It takes `v-model` (the nodes you passed in, never copies), `v-model:expanded` (keys), `multiple`, `selection-behavior`, `checkbox` with cascading checks, `toggle-on-click`, `virtualize`, `name` for plain form posts (`required` keeps an empty one from submitting), Field wiring, `ghost` (default) and `outline` variants and the five control sizes. It exposes `expandAll`, `collapseAll` and `scrollToKey`; `getAncestorKeys` and `flattenTree` come with it.
  
  The tree keeps its own selection instead of Reka UI's, which fixes a few things on the way: checking a child then its folder no longer leaves the child in the model twice, cascading checks follow `getChildren` to any depth and leave disabled nodes alone, a model echoed back with only leaves shows its folders checked, and a large selection no longer stalls on a deep watch. Typeahead works right after an arrow key or a Space, Tab enters on the selected row, only the selected row of a single-select tree has `aria-selected`, and a virtualized tree keeps focus when rows above the focused one open. Two nodes with the same key get a warning in development.

- [#12](https://github.com/Eg0r0k/kappa-ui/pull/12) [`d71e3ef`](https://github.com/Eg0r0k/kappa-ui/commit/d71e3ef7be029b95bf1642deae808f3c035e7d8b) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Forms with VeeValidate and Zod. New `standard-schema` lib item with `toTypedSchema`, which lets VeeValidate 4 validate with Zod 4, Valibot or any other Standard Schema: VeeValidate 4 passes a raw Zod 4 schema without a single error, and `@vee-validate/zod` throws on Zod 4 unions. Each issue lands at its field's path, such as `emails[0].address`. New examples bind every kind of control: a bug report, a select and combobox, choice groups, number, tags, pin and range inputs, a field array, an invite dialog with an error from the server, and VeeValidate's own `Form` and `Field` components through the slot.
  
  `lib/field-context` exports `focusFirstInvalid(root)`, which moves focus to the first invalid control in page order once the errors have rendered: the input, the select trigger, the slider thumb, or the box Tab would reach in a checkbox or radio group. A control that can't take focus, such as one in a hidden tab, is skipped. It works with any validation.
  
  `TagsInputInput` no longer lets the form submit when Enter adds a tag on reka-ui 2.10, which cancels that Enter a tick late (unovue/reka-ui#2966). On reka-ui 2.11 nothing changes.

### Patch Changes

- [#12](https://github.com/Eg0r0k/kappa-ui/pull/12) [`0fc923b`](https://github.com/Eg0r0k/kappa-ui/commit/0fc923b2719a39cb01eaa2990e3e0b49e8882989) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Left and right drawers keep their rounded corners and their handle on the inner edge in right-to-left text. `side` names a screen edge, but the corners and the handle were placed with logical classes, so under `dir="rtl"` they ended up against the edge of the screen.

- [#12](https://github.com/Eg0r0k/kappa-ui/pull/12) [`0e81516`](https://github.com/Eg0r0k/kappa-ui/commit/0e815160caeb529db6f5eec8cd01e05072005798) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Enter in `InputDate`, `InputDateRange`, `InputTime` and `InputTimeRange` follows a native input's implicit submission exactly: it clicks the form's submit button, does nothing while that button is disabled, and in a form without one submits only when the field is the form's single text field. Before, a form without a submit button was submitted whatever else it held.

- [#12](https://github.com/Eg0r0k/kappa-ui/pull/12) [`82d69e4`](https://github.com/Eg0r0k/kappa-ui/commit/82d69e43c66b48d0fcc4a650c281903597685d5c) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Items install every npm dependency in the range the registry is tested against instead of its latest release: `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`, `@tanstack/vue-table` and `@tanstack/vue-virtual`, and in the examples `@formisch/vue`, `valibot`, `@internationalized/date` and `@vueuse/core`, so a major release the components were not written for no longer reaches new projects. `@lucide/vue` stays without a range: the shadcn-vue CLI installs the icon library a project picked and recognises it only by name. The Manual tab on each component page lists the same ranges, `reka-ui` included, and shows `@lucide/vue` with the range it is tested against, since a manual install skips the CLI.

- [#12](https://github.com/Eg0r0k/kappa-ui/pull/12) [`9e49fe5`](https://github.com/Eg0r0k/kappa-ui/commit/9e49fe55b344c8076818b146d8e129670d612f20) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `scroll-fade` brings the `tokens` item. The core stylesheet it imports reads the status colours and `--destructive-foreground` from the tokens, so adding it by URL to a project with a plain shadcn-vue theme failed the Tailwind build with `Could not resolve value for theme function: theme(--color-destructive-foreground)`.

- [#12](https://github.com/Eg0r0k/kappa-ui/pull/12) [`5af8c25`](https://github.com/Eg0r0k/kappa-ui/commit/5af8c25e20a9c818e41792b275bc2d1483f4632e) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - With Reka UI 2.11, the toasts in a `Toaster` ease to their new height again when a toast arrives or closes and when the stack expands, instead of jumping to it. Reka 2.11 measures each toast by setting its inline height to `auto`, which cut the toast's height transition short. The toast now takes its height from `min-height` and `max-height`, which the measuring leaves alone. With Reka UI 2.10 the stack looks and moves as before.
- Updated dependencies [[`65ef2c8`](https://github.com/Eg0r0k/kappa-ui/commit/65ef2c828c4d5c7e5df5399cd1c1fd6e62f01056), [`3b30d74`](https://github.com/Eg0r0k/kappa-ui/commit/3b30d74fab198e31a727d58ef4dc06bc73f686ea), [`5a478d3`](https://github.com/Eg0r0k/kappa-ui/commit/5a478d36ccc36106507b86fc5efe267b78b8c4f5)]:
  - @kappa-ui/core@0.10.0

## 0.12.0

### Minor Changes

- [`c79028b`](https://github.com/Eg0r0k/kappa-ui/commit/c79028b66e69acfc5085910b431e29724ffaa03a) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - The control scale is now a set of tokens: `--control-height-*`, `--control-padding-*`, `--control-icon-*` and `--control-gap-*` for `xs` to `xl`, added to `:root` by the `tokens` item. Button, Input, InputFloating, Select, Combobox, InputNumber, TagsInput, PinInput, InputTime, InputGroup, Menu, Tabs, ColorPicker and Pagination read them, so overriding one on `:root` resizes every control of that size.
  
  Some sizes that strayed from the scale now follow it. Button icons are 20px at `lg` and `xl` instead of 16px, and so are the icons of Toggle, ToggleGroup, Toolbar and Pagination at those sizes. The gap between an icon and its label is 6, 8, 8, 10 and 12px from `xs` to `xl`, about half the icon, everywhere that has one: Button and the components built on it (where it was 4, 6, 8, 8 and 8px), Menu items and the Select, Combobox and Command lists (8, 10, 12, 12 and 12px), and Tabs triggers (6, 8, 8, 8 and 10px). Inset and checkbox or radio items move their labels with it, so they stay in line with items that have an icon. Everything else keeps its size.

- [`81e522c`](https://github.com/Eg0r0k/kappa-ui/commit/81e522cf4f6929eac679fc39d1bfc93c96e846da) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `Listbox` takes `size`, from `xs` to `xl` (default `md`), and sets `data-size`. Options are 28 to 48px tall and their padding, gap, icons and text follow the control scale, like a menu of the same size. At `md` the gap between an icon and its label is now 8px instead of 12px.

## 0.11.0

### Minor Changes

- [`44a7ce2`](https://github.com/Eg0r0k/kappa-ui/commit/44a7ce25cc8d58e018ff81f876e5728bcb84bd8c) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `Command` and `CommandDialog` take `ignore-filter`, which turns the built-in filter off for items you filter yourself: every item, group and separator stays visible and `CommandEmpty` never shows. `CommandInput` binds the search with `v-model`, and hears when selecting an item clears it. Items mounted after a search was set are filtered too.

- [`9f4b062`](https://github.com/Eg0r0k/kappa-ui/commit/9f4b062b183ff1904aa881af19a3c1faa62af6b4) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - The default theme rounds corners at `0.5rem` instead of `0.75rem`, draws cards, dialogs, menus and popovers without an edge (`--surface-border: transparent`), and brightens the info colour to `oklch(0.79 0.17 256)` with matching `--info-foreground` and `--info-text`. To keep the old look, set `--radius: 0.75rem`, `--surface-border: var(--border)` and the previous `--info*` values in your stylesheet.

### Patch Changes

- [`11cf46c`](https://github.com/Eg0r0k/kappa-ui/commit/11cf46cf9d0e6e5e792c5ae22d609b29265680a3) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - DataTable no longer breaks hydration when a header, footer or cell renders an empty string (`header: ""` on an actions or expand column, an empty value). Such a render now outputs nothing, through the new `DataTableRender`, which the table uses in place of `FlexRender`.

- The text control frame of `InputGroup`, `InputNumber`, `TagsInput` and the `Combobox` anchor ignores what sits in an `InputGroupAddon`: a disabled checkbox's hidden form input no longer greys the frame or fades the addons, and the browser focusing it after a failed submit no longer lights the frame. A focused control that fails native validation shows the destructive edge again instead of the focus one.

## 0.10.0

### Minor Changes

- [`8f31bd2`](https://github.com/Eg0r0k/kappa-ui/commit/8f31bd2f656e19ec0403ca3cc41ff0615a0b2966) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `Command`: a filterable list of commands over Reka UI's Listbox, ported from shadcn-vue, in Menu's five sizes: `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandLabel`, `CommandItem`, `CommandSeparator`, `CommandShortcut` and `CommandDialog`.

- [`e03458c`](https://github.com/Eg0r0k/kappa-ui/commit/e03458c4fca12fc7aaad6cb44ca30b95c7c9397a) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `InputTime` and `InputTimeRange`: segmented time fields over Reka UI's `TimeField` and `TimeRangeField`, in Input's five variants and five sizes, with 12- or 24-hour cycles, hour, minute or second granularity, `step`, `min-value`/`max-value`, `loading` and Field wiring. Inside an `InputGroup` they drop their own frame and take the group's variant and size.

- [`7e11882`](https://github.com/Eg0r0k/kappa-ui/commit/7e11882c03ffeb0dd739a984550cb337d950a9d4) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `SwipeActions` item: the core swipe parts with tone-coloured actions (`color`, icon over label) and an opaque content layer. New `drag` lib item re-exporting core's `useDrag`, with a docs page.

- [`0a9aa94`](https://github.com/Eg0r0k/kappa-ui/commit/0a9aa94f326503b39d7a8d70e5087b642c711187) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - `DropdownMenu` and `ContextMenu` are removed: `Menu` covers both, opening on click from the element it sits in or from a `MenuTrigger`, and with `context-menu` on right-click and long-press. It has the same parts (`MenuItem`, `MenuCheckboxItem`, `MenuRadioGroup`, `MenuRadioItem`, `MenuLabel`, `MenuSeparator`, `MenuShortcut`, `MenuGroup`, `MenuSub`, `MenuSubTrigger`, `MenuSubContent`), sizes and styles, so moving over means renaming the parts and replacing `DropdownMenuTrigger`/`ContextMenuTrigger` and the content part with a `Menu` inside the element that opens it; `align="end"` becomes `anchor="bottom end" self="top end"`. Copies already in a project keep working. The Breadcrumb, ButtonGroup, DrawerMenu and overlay examples use `Menu`.

### Patch Changes

- [`93791d7`](https://github.com/Eg0r0k/kappa-ui/commit/93791d7068e162e65536fb7fd195d07058183df8) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - A `Menu` with `context-menu` marks its target with `data-kappa-longpress` while it is attached, so a tooltip on that target leaves the long press to the menu, as it already did for the context menu trigger. `MenuShortcut` renders left to right in right-to-left text, as the dropdown menu's shortcut did.

- [`e03458c`](https://github.com/Eg0r0k/kappa-ui/commit/e03458c4fca12fc7aaad6cb44ca30b95c7c9397a) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - The text control frame of `InputGroup`, `InputNumber`, `TagsInput` and the `Combobox` anchor reads focus, invalid and disabled from any `input`, `textarea` or `role="spinbutton"` inside it, not only from a direct child. An `InputGroupAddon` click focuses the first segment of a segmented control, and addons fade when any input inside the group is disabled.

- [`0f38faa`](https://github.com/Eg0r0k/kappa-ui/commit/0f38faa4ec4529669e97974dbed9b359a2454d15) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Switch, Checkbox, Radio and Slider take their tone from core's `tone-control` and `tone-invalid` utilities instead of a dozen variable assignments each, so they need the `@kappa-ui/core` release that adds them. They look the same, and a `[--tone:…]` class still recolours them. Long class strings across the components are now wrapped by variant group.

- [`9cf316b`](https://github.com/Eg0r0k/kappa-ui/commit/9cf316b66b76ee3188d87dfe139e09540b163212) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Items that use Reka UI now install `reka-ui` with the range `@kappa-ui/core` takes it as a peer in (`^2.10.5`) instead of the latest release, so a Reka major that the components were not written for no longer reaches new projects or fails the install against core's peer.
- Updated dependencies [[`7e11882`](https://github.com/Eg0r0k/kappa-ui/commit/7e11882c03ffeb0dd739a984550cb337d950a9d4), [`0f38faa`](https://github.com/Eg0r0k/kappa-ui/commit/0f38faa4ec4529669e97974dbed9b359a2454d15)]:
  - @kappa-ui/core@0.9.0

## 0.9.0

### Minor Changes

- [`f3e1bd4`](https://github.com/Eg0r0k/kappa-ui/commit/f3e1bd40e8fbea9611e6bcab8b5f1654e44c8dff) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `AlertDialog`: shadcn's parts over Reka UI's AlertDialog on Dialog's window and overlay, with `AlertDialogMedia`, a `sm` size, and `AlertDialogAction` / `AlertDialogCancel` that take Button's `variant`, `color` and `size`. New `confirm` item: `useConfirm()` returns `confirm`, `alert` and `prompt`, which open alert dialogs from code and resolve with a `DialogResult`; `onConfirm` holds the dialog with a spinner while it runs and keeps it open if it throws, and `prompt` validates its value.

- [`3724c06`](https://github.com/Eg0r0k/kappa-ui/commit/3724c06d7b4ea6f78c8d7dc6b865553aa2ab1825) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `Combobox`: a text input that filters a list of options as you type, over Reka UI's Combobox. `ComboboxAnchor` is Input's frame with its variants and sizes and holds `ComboboxInput`, `ComboboxCancel` and the chevron `ComboboxTrigger`; with `as-child` the anchor and trigger become a button of your own and the input moves into the list. `ComboboxList`, `ComboboxViewport`, `ComboboxItem`, `ComboboxGroup`, `ComboboxLabel`, `ComboboxSeparator` and `ComboboxEmpty` take Select's list styles. Single or multiple choice, wired to a surrounding Field.

- [`74f9dd1`](https://github.com/Eg0r0k/kappa-ui/commit/74f9dd1551e6326dac7b612eae10b844714acc77) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `DrawerMenu`: a menu inside a drawer for touch screens, with `DrawerMenuItem`, `DrawerMenuCheckboxItem`, `DrawerMenuRadioGroup`, `DrawerMenuRadioItem`, `DrawerMenuGroup`, `DrawerMenuLabel`, `DrawerMenuSeparator` and submenus (`DrawerMenuSub`, `DrawerMenuSubTrigger`, `DrawerMenuSubContent`) that drill down in the same sheet with a back row, in `sm`, `md` and `lg`. Its parts take the props and events of the dropdown and context menu parts, so one menu definition renders through any of the three.

- [`0c326fd`](https://github.com/Eg0r0k/kappa-ui/commit/0c326fd260f5f1e163e922a61e1b5ea7935ce1cb) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `InputNumber`: a number field over Reka UI's NumberField with `InputNumberInput`, `InputNumberIncrement` and `InputNumberDecrement` parts inside one frame, in Input's variants and sizes, horizontal or vertical, with `min`, `max`, `step`, `formatOptions` and `locale`, wired to a surrounding Field.
  
  `Input` now exports `textControlFrameVariant`, the text control variants for a frame around a control, read from the control's focus, invalid and disabled state. `InputGroup` draws its frame from it; its radius variable is renamed from `--input-group-radius` to `--control-radius`.

- [`3fcff02`](https://github.com/Eg0r0k/kappa-ui/commit/3fcff0240983a56fc3bb22db592f46071131cbe0) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `PageIndicator`: marks the current page among `count` as dots, a stretched pill or line segments, with a `PageIndicatorItem` per page. `v-model:page` counts from 1; five sizes, any tone, both orientations; `cumulative` and `progress` fill story bars and autoplay; `readonly` turns it into a labelled picture; `touchTarget` grows the pressable areas. The items are buttons with roving focus.

- [`a7aad5f`](https://github.com/Eg0r0k/kappa-ui/commit/a7aad5f647b9dee6c64049465d2815832d9ecc4f) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - New `TagsInput`: tags typed into one text control frame over Reka UI's TagsInput, with `TagsInputItem` chips drawn as badges, `TagsInputItemText`, `TagsInputItemDelete` and `TagsInputInput` parts, in Input's variants and sizes, with delimiter, paste, max and duplicate handling, wired to a surrounding Field.

### Patch Changes

- [`99c55af`](https://github.com/Eg0r0k/kappa-ui/commit/99c55af35b145a6c23a7a07d773b46a63fdd50b6) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - Components size their icons with core's `icon-size-*` instead of `[&_svg:not([class*='size-'])]:size-*`, so `class="icon-size-5"` resizes the icons in a Button, a Badge or a menu item, and `cn` lets the later of two `icon-size-*` classes win. A Button tightens its padding beside a `data-icon="inline-start"` or `"inline-end"` icon on the logical side, so the right side in right-to-left text.

- [`f4d7e8e`](https://github.com/Eg0r0k/kappa-ui/commit/f4d7e8e861f4e8923e721596d3001b44923e5335) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - ScrollArea's scrollbar carries `data-no-drag`, so dragging its thumb with a mouse inside a Drawer scrolls instead of moving the drawer.
- Updated dependencies [[`e60d032`](https://github.com/Eg0r0k/kappa-ui/commit/e60d0324dc8dbb9421bdfbf2710729f2d7b9e89e), [`196be12`](https://github.com/Eg0r0k/kappa-ui/commit/196be12e9916c2a2818747cfcef3cd46b7284271), [`8f50769`](https://github.com/Eg0r0k/kappa-ui/commit/8f50769faf376825639de86c3ec62f5f55d98fc4), [`f4a4e02`](https://github.com/Eg0r0k/kappa-ui/commit/f4a4e02a0589a2b928f0688ef8bd00f35a6a2e2c), [`4b4d53a`](https://github.com/Eg0r0k/kappa-ui/commit/4b4d53ae6ddaa013b86f73d22070507f9e7ef1a3), [`ddb5d57`](https://github.com/Eg0r0k/kappa-ui/commit/ddb5d5792dadf9bbb20e65631040c4484b732aec), [`266a60e`](https://github.com/Eg0r0k/kappa-ui/commit/266a60e10267cebbb08a1da222ea8062e56d8a2a)]:
  - @kappa-ui/core@0.8.0

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
