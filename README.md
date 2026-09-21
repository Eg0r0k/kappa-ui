# delta-ui

A shadcn-style component registry for Vue. Components are not installed as an
npm package — you copy their source straight into your own project, so you
own and can freely modify the code from day one.

## Using components

```
npx shadcn-vue add https://delta-ui.dev/r/button.json
```

`delta-ui.dev` is a placeholder domain. The real host is whatever the
`HOMEPAGE` constant in `scripts/build-registry.ts` is set to at deploy time —
update that constant (and redeploy) if the domain changes.

**Requires Tailwind CSS v4.** Components rely on v4-only utilities and
semantics (e.g. `size-9`, `min-h-svh`, v4 `outline` behavior) that do not
exist or do not behave the same way on Tailwind v3. The registry-item schema
has no field to declare this, so this README is the authoritative place it's
documented — verify your project is on Tailwind v4 before adding components.

**Adding a component sets `--radius` in your project.** delta-ui ships its own
border-radius scale (`--radius: 0.75rem`, with `--radius-sm/md/lg/xl` derived
from it). Because `--radius` is the same variable shadcn components read, if
your project already uses shadcn, their corners will change to match delta-ui's
too. That is intentional — delta-ui is a design system, not an add-on — but it
is a project-wide effect, so decide before you install rather than after. To
opt out, edit `--radius` back in your own CSS after adding the component; the
component itself only uses `rounded-lg`.

Components also ship a set of easing curves — `--ease-smooth`, `--ease-snappy`,
`--ease-gentle`, `--ease-bouncy` and `--ease-elastic` — usable as the Tailwind
utilities `ease-smooth`, `ease-snappy` and so on. These are delta-ui-specific
names, so unlike `--radius` they cannot collide with anything shadcn defines.
Tailwind only emits a theme variable once something uses it, so expect the
unused curves to be absent from your compiled CSS until you reference them.

## Colour tokens

Components use shadcn's semantic colour tokens — `--background`,
`--foreground`, `--primary`, `--muted`, `--accent`, `--border`, `--input`,
`--ring` and friends, in OKLCH. Chart and sidebar tokens are deliberately not
included. Note there is no `--destructive-foreground`; shadcn dropped it.

Installing the button writes both the light values into `:root` and the dark
values into `.dark`. **Dark mode is class-based**: add `dark` to your `<html>`
element to switch. The components themselves contain no `dark:` utilities at
all — the tokens change value under `.dark`, so every variant follows the
theme on its own.

That means delta-ui does not impose a dark-mode mechanism on you. If your
project drives `dark:` utilities from `prefers-color-scheme`, that keeps
working; only the `.dark` class activates delta-ui's dark values. If you want
`dark:` utilities to follow the class instead, add shadcn's variant yourself:

```css
@custom-variant dark (&:is(.dark *));
```

## Press feedback

Adding the button also installs a `press-scale` utility. It is a utility
rather than a prop, so it composes with anything:

```vue
<Button class="press-scale">Press me</Button>
```

The element dips to `--press-scale` (0.97 by default) over `--press-duration`
while held. On `.is-mobile` it switches to `scale3d` so the animation stays on
the compositor, and honours `--transform-extra` if you are already applying a
transform. Nothing here sets `.is-mobile` — that is your application's job.
Under `prefers-reduced-motion: reduce` both the transition and the transform
are dropped entirely.

**It also adds a base rule**, the same one `shadcn-vue init --pointer`
installs:

```css
@layer base {
  button:not(:disabled),
  [role="button"]:not(:disabled) { cursor: pointer; }
}
```

Tailwind v4 removed the default pointer cursor on buttons. This restores it
for every button in your project, not only delta-ui's — another project-wide
effect to be aware of before installing.

## Loading

```vue
<Button :loading="saving">Save</Button>
<Button :loading="saving" loading-mode="replace">Save</Button>
```

`adjacent` (the default) puts the spinner beside the label, so the button
grows by the spinner's width. `replace` centres the spinner and makes the
label transparent, so the label keeps defining the width and nothing in the
row shifts.

**A busy button is never given the native `disabled` attribute.** Disabling a
focused button drops it from the tab order, the browser moves focus to
`<body>`, and a keyboard user loses their place mid-action while a screen
reader falls silent — exactly when feedback matters most. Instead the button
gets `aria-disabled` and `aria-busy`, stays focusable and announced, and has
its behaviour removed: `pointer-events: none` for the mouse, and a prevented
default on Enter and Space so no click is ever synthesised. This follows
[W3C's guidance on disabled controls][w3c-disabled], the same reasoning
behind Material's `soft-disabled`.

One consequence worth knowing: because the element is inert to pointer
events, the cursor does not change to `wait` while busy. That is the price of
blocking the mouse deterministically rather than relying on event ordering.

[w3c-disabled]: https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_disabled_controls

## Touch targets

`Button` can grow its pressable area to at least 48px without changing how it
looks — adapted from Material Web's `touch-target`:

```vue
<Button touch-target="expand" />   <!-- bigger hit area, may overlap neighbours -->
<Button touch-target="wrapper" />  <!-- bigger hit area, space reserved in layout -->
```

It is off by default. A hit area larger than the visible control is a
deliberate choice — turned on everywhere, adjacent buttons in a dense row
silently overlap and a press can land on the wrong one. Use `wrapper` when
buttons sit close together, `expand` when the button stands alone.

## Repo layout

- `packages/registry` — source of truth for every component (`src/`) and the
  registry manifest (`registry.json`).
- `apps/docs` — the showcase site; also serves the built registry JSON as
  static files under `/r`.

## Scripts

Run from the repo root:

- `pnpm dev` — start the docs/showcase dev server.
- `pnpm build` — build the registry JSON and the docs site.
- `pnpm typecheck` — typecheck the whole workspace.
- `pnpm registry:build` — regenerate `apps/docs/public/r/*.json` from
  `packages/registry/registry.json` without building the docs site.
