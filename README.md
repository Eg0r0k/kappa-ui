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

Colour tokens are not implemented yet; components still use raw Tailwind
palette utilities rather than themeable CSS variables.

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
