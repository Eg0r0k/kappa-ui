# kappa-ui

A shadcn-style component registry for Vue 3 and Tailwind CSS v4. Components are copied into your project, so the code is yours from day one; their mechanism comes from [`@kappa-ui/core`](packages/core) on npm.

```sh
npx shadcn-vue@latest init --preset https://kappa-ui.pages.dev/r/init.json
npx shadcn-vue@latest add @kappa-ui/button
```

Requirements, theming, every component and its API are documented on the
site: run `pnpm dev` and open http://localhost:3000.

Documentation: https://kappa-ui.pages.dev

## Repo layout

- `packages/registry` — source of truth for every component (`src/ui`,
  `src/lib`), the examples (`src/examples`) and the registry manifest
  (`registry.json`).
- `apps/docs` — the documentation site (Nuxt + Nuxt Content). Pages live in
  `content/docs`, API descriptions in `api/*.yml`. It also serves the built
  registry JSON under `/r`.

## Scripts

Run from the repo root:

- `pnpm dev` — build the registry JSON and start the docs dev server.
- `pnpm build` — build the registry JSON, generate the API tables, generate
  the static site, and check that every page and registry file is present.
- `pnpm typecheck` — typecheck the whole workspace.
- `pnpm registry:build` — regenerate `apps/docs/public/r/*.json` from
  `packages/registry/registry.json`.
- `pnpm test` — check formatting, run the root script tests, lint, then run
  every package's tests: the component tests in real Chromium and Firefox,
  and the docs tests.
- `pnpm smoke` — pack `@kappa-ui/core`, build the registry, and install every item into a fresh Vite project and a fresh Nuxt project with the shadcn-vue CLI, then type-check and build both. Needs the network and takes a few minutes; not part of `pnpm test`. `--only vite|nuxt` runs one project, `--keep` keeps the work directory.
- `pnpm format` — format the repo with Prettier.
- `pnpm changeset` — record a change to core or components for the next release.

## Contributing

Run `pnpm test` before opening a PR. A change users will notice, in `packages/core` or in a component, needs a changeset: run `pnpm changeset`, pick the packages, and describe the change for the changelog. Docs-only changes do not. Merging the "version packages" PR that the release workflow keeps open publishes `@kappa-ui/core` and deploys the site.

## License

MIT © 2026 Eg0r0k. Code adapted from Material Web (Apache-2.0) and Quasar (MIT) is listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
