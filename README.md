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

Design tokens are not implemented yet; components use raw Tailwind palette
utilities directly rather than themeable CSS variables.

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
