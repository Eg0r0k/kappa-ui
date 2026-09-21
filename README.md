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

## A known contrast trade-off

`--primary` is a blue dark enough that white sits on it at 5.74 in light and
5.71 in dark. That is deliberate: the filled button carries white text, and
white needs a dark fill.

The same token is also what `variant="link"` paints text with, straight onto
the page background — and there the requirement inverts. On the dark
background this blue measures **3.46**, below the 4.5 threshold. No single
blue satisfies both: the two requirements cross at roughly L 0.58, where both
land near 4.45 and fail together.

If you rely on `variant="link"` in dark mode, split the roles — keep
`--primary` as the fill and add a lighter token for brand-coloured text, for
example `oklch(0.66 0.17 262)`, which measures 6.14 against the dark page.

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

## Ripple

```
npx shadcn-vue add https://delta-ui.dev/r/ripple.json
```

A directive rather than a prop, so it attaches to anything:

```vue
<Button v-ripple>Press me</Button>
<Button v-ripple="{ color: 'red', opacity: 0.3 }">Tinted</Button>
<Button v-ripple="false">Off</Button>
```

The motion is Material's — a wave that starts at a fifth of the element's
size under the press point and drifts to the centre while it expands, with a
radial-gradient soft edge instead of a hard rim. The implementation is not
Material's: no custom element and no Web Animations API. The directive writes
each press's geometry onto the wave as inline custom properties and a plain
CSS animation does the rest.

A tap shorter than 225ms still shows the ripple for that long, so a quick
click is not a flash you cannot resolve. Holding the press keeps the wave up
until release. Under `forced-colors` it is hidden entirely — a state layer
cannot survive a forced palette and would paint over the control — and under
`prefers-reduced-motion` the wave appears already expanded and only fades, so
the press is still acknowledged without anything travelling.

It needs a positioned host: the directive sets `position: relative` on the
element only if it is still `static`.

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

## Spinner

```
npx shadcn-vue add https://delta-ui.dev/r/spinner.json
```

A standalone loading indicator. It carries no size and no colour of its own —
it inherits `currentColor` and whatever size you give it, which is what makes
it drop straight into a button:

```vue
<Button :disabled="saving">
  <Spinner v-if="saving" />
  Save
</Button>
```

It is `aria-hidden`. A spinner on its own announces nothing useful, so the
state belongs on the control that is busy — a live region you own, or
`aria-disabled` / `aria-busy` you add yourself. Under
`prefers-reduced-motion: reduce` it freezes at its widest frame rather than
disappearing, so it still reads as "loading".

## Loading is composition, not a prop

The button has no `loading` prop and no spinner of its own. You render one
inside it, the way shadcn does:

```vue
<Button :disabled="saving">
  <Spinner v-if="saving" />
  {{ saving ? 'Saving' : 'Save' }}
</Button>
```

Nothing needs configuring: the base styles give any `svg` a 16px size and a
gap, so the spinner lands correctly on its own — and any indicator works, not
only ours. If you want the width to stay put while the label changes, add
`min-w-32` yourself.

Be aware of what native `disabled` costs, because it is a real trade and not
an oversight. A disabled control leaves the tab order, so if it had focus the
browser moves focus to `<body>` — a keyboard user loses their place at the
moment they act, and a screen reader goes quiet. The accessible alternative is
`aria-disabled` plus blocking the behaviour yourself. This component does not
do that for you: it is your copy of the source, so if your app needs it, add
it there.

If you do add `aria-disabled`, note that it only changes what is announced —
the control stays operable, so you also have to remove the behaviour:
`pointer-events: none` for the mouse, and a prevented default on Enter and
Space so no click is ever synthesised. See
[W3C's guidance on disabled controls][w3c-disabled], the same reasoning
behind Material's `soft-disabled`.

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
