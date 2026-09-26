# delta-ui

A shadcn-style component registry for Vue. Components are not installed as an
npm package — you copy their source straight into your own project, so you
own and can freely modify the code from day one.

```
npx shadcn-vue add https://delta-ui.dev/r/button.json
```

Requirements, theming, every component and its API are documented on the
site: run `pnpm dev` and open http://localhost:3000.

`delta-ui.dev` is a placeholder domain. The real host comes from the
`DELTA_UI_URL` environment variable at build time; both the registry and the
site read it.

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
- `pnpm test` — run the registry script tests, the component tests in real
  Chromium, and the docs tests.

## License

MIT © 2026 Eg0r0k. Code adapted from Material Web (Apache-2.0) and Quasar (MIT) is listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
