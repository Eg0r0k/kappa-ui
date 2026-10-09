# @kappa-ui/registry

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
