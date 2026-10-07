---
"@kappa-ui/registry": minor
---

Pressable parts ripple on their own: Button, Toggle, ToggleGroupItem, Item as a link or a button, the calendar days, tabs, accordion, menubar and navigation menu triggers, the items of Menu, Menubar, Select, Combobox, Command, DrawerMenu, Listbox and Tree, and the clear buttons of TagsInput and Combobox. Each imports the directive from `@/lib/ripple`, so `add` brings the `ripple` item along and nothing needs registering. On menu, listbox and tree rows the wave replaces the pressed layer, as `state-layer` already did. Bind `v-ripple="false"` on a Button to turn one off, or set `--kappa-ripple: none` on `:root` to turn them all off.
