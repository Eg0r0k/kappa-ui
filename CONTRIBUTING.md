# Contributing

kappa-ui is a shadcn-style registry: the files under `packages/registry/src` are copied verbatim into other people's projects, so a component ships with its manifest entry, examples, tests, docs page, API descriptions, thumbnail and changelog entry in one go. This file lists everything a new component touches, in the order it is usually done, and names the check that fails when a step is skipped. It is written for people and for coding agents alike. When a new check or generated file appears in the repo, add its line here.

The short version for any change: run `pnpm test` before opening a PR, and record a change users will notice with `pnpm changeset` (docs-only changes need none). Merging the "version packages" PR that the release workflow keeps open publishes `@kappa-ui/core` and deploys the site.

## Before you start

- Decide what you are adding. The checklist is for a **registry component** (`registry:ui`, a directory under `packages/registry/src/ui`). A **core module** (`packages/core`, logic without styles) and a **lib item** (`registry:lib`, styles or runtime that several components share) have shorter branches at the end.
- Read the neighbours. The conventions are the ones every directory in `src/ui` already follows: `data-slot` on every root, one `class` prop merged last through `cn()`, state styled from the attribute that carries it (`aria-invalid:`, `data-[state=…]:`), `size` as the [Sizing](https://kappa-ui.pages.dev/docs/sizing) page describes, radii as on [Radius](https://kappa-ui.pages.dev/docs/radius), colour through `data-color` and the tone variables. Arrow functions only, comments near zero, everything in English.
- Name it. The item is kebab-case (`error-state`), every part starts with the component's name (`ErrorStateTitle`), the directory is `src/ui/<item>/`.

## 1. Source: `packages/registry/src/ui/<item>/`

- [ ] One SFC per part, plus `index.ts` that re-exports them and holds the `cva` variants. A part that needs its own styling is its own exported component, never a `*-class` prop.
- [ ] Styles shared with a component that renders this one stay in this `index.ts`; styles shared with one that does not become a `registry:lib` item under `src/lib` (see the lib branch).
- [ ] Import `reka-ui` directly. `reka-ui/internal` is for core only. _Caught by `pnpm lint` (`no-restricted-imports`)._
- [ ] A new npm package goes into `dependencies` of `packages/registry/package.json`, never `devDependencies`: the registry build takes the install range from there. _Caught by `pnpm registry:build`._
- [ ] Every Tailwind class must exist in the theme. A string constant in `index.ts` that is not a class list (a selector, a CSS length) goes into `notClasses` in `eslint.config.js`. _Caught by `pnpm lint`._
- [ ] Keyframes and `@utility` rules go into `packages/core/src/tailwind.css`, not into the item's `css`. A rule that belongs to this one component stays in the item's `css` in the manifest. _Caught by `pnpm registry:build`._
- [ ] After touching `packages/core/src/tokens.css`, `theme.css` or any item's `css`, run `pnpm registry:build` and commit `apps/docs/app/assets/css/registry.css`. _Caught by `node --test scripts/build-registry.test.ts`._
- [ ] Code ported from another project starts with the two-line licence header and is listed in `THIRD_PARTY_NOTICES.md`.

## 2. Manifest: `packages/registry/registry.json`

- [ ] One `registry:ui` item with `name`, `title`, `description`, `categories`, `dependencies`, `registryDependencies` and `files`. Titles and descriptions are English and reach the catalogue and the CLI.
- [ ] `categories` holds exactly one catalogue category: `actions`, `text-input`, `choice`, `forms`, `overlays`, `navigation`, `data-display`, `layout`, `feedback` or `utilities` (the list is `apps/docs/app/lib/categories.ts`). The docs page, the sidebar and the catalogue card take it from here. _Caught by `apps/docs/test/unit/categories.test.ts`._
- [ ] `dependencies` lists every package the files import (`vue` is implicit). `@kappa-ui/core` and `reka-ui` go in without a version; the build stamps them. _Caught by `pnpm registry:build`._
- [ ] `registryDependencies` lists `utils`, `tokens`, and every item whose files are reached through an `@/` import (`button`, `choice-group`, `text-control`, …). _Caught by `pnpm registry:build`._
- [ ] `pnpm registry:build` passes. It validates the manifest and writes `apps/docs/public/r/*.json`.

## 3. Examples: `packages/registry/src/examples/<item>/`

- [ ] `<Name>Demo.vue` is the overview: its item is named `<item>-demo` and the component page shows it first. Each further example demonstrates one thing and gets its own file.
- [ ] Every example is a manifest item: `type: "registry:block"`, `categories: ["example"]`, `registryDependencies` naming the item it demonstrates (plus any other item it uses), `dependencies` for packages such as `@lucide/vue`. The CLI publishes it as `components/examples/<dir>/<File>.vue`. _Caught by `pnpm registry:build` and `packages/registry/test/examples.test.ts`._
- [ ] The demo gets the props console: `defineOptions({ inheritAttrs: false })` in its script, `v-bind="$attrs"` on the demonstrated root, and `meta.demo.controls` on its manifest item listing the props to expose (a prop name takes its values from the API meta; `{ prop, values }` sets them by hand; `{ attribute }` adds a native attribute). _Caught by `pnpm registry:build` and `pnpm --filter @kappa-ui/docs test`._
- [ ] Every example mounts without a Vue warning. _Caught by `packages/registry/test/examples.test.ts`; `apps/docs/test/unit/registry.test.ts` checks that the manifest lists exactly the files under `src/examples`._

## 4. Tests: `packages/registry/test/<item>.test.ts`

- [ ] Behaviour, keyboard and accessibility in real Chromium: `pnpm --filter @kappa-ui/registry exec vitest run test/<item>.test.ts`. Run one browser suite at a time; parallel runs exhaust memory.
- [ ] Anything that depends on scroll position also goes into the Firefox `include` list in `packages/registry/vitest.config.ts`: Firefox has no scroll-driven animations and falls back to the JS-set `data-overflow-*` attributes.
- [ ] Visual baselines: `pnpm test:visual -u` screenshots every example in light and dark, and every control value of the demo, into `packages/registry/test/visual/__screenshots__/examples.visual.ts/`. Commit the new `*-win32.png` files. The baselines are Windows-only and the run is local, not part of CI.

## 5. Docs page: `apps/docs/content/docs/2.components/<nn>.<slug>.md`

- [ ] Frontmatter: `title`, `description` (full sentences, a space after every full stop) and `component: <item>`. The category and the catalogue card come from the manifest item; a page with no item sets `category:` instead.
- [ ] Number the page inside its category's block and shift the neighbours with `git mv` (ErrorState moved pages 55 to 84 down by one). _Group order and a number used twice are caught by `categories.test.ts`._
- [ ] Sections in the order the other pages use: `::component-preview{name="<item>-demo"}`, a sentence pointing at the **Props** menu, Installation (`::install-tabs{name="<item>"}`), Usage with imports as `@/components/ui/<item>` (the consumer's alias, not `@/ui`), a list of the parts, Examples (one `::component-preview` each), API Reference (`::api-reference{parts="A,B,C"}`), Data attributes (`::data-slots`), Keyboard (`::keyboard-table`), Accessibility. _Imports are caught by `content-imports.test.ts`, example names by `apps/docs/test/unit/examples.test.ts`._
- [ ] `apps/docs/api/<part>.yml` for every `.vue` under `src/ui/<item>/`: `component`, `file`, and a description for each prop, emit, slot and exposed member. Leave out empty sections. _Caught by `pnpm --filter @kappa-ui/docs api:build`, which runs before `dev`, `build`, `typecheck` and `test`._
- [ ] Guide pages that describe the component's kind: Sizing when it sets root variables or has a scale of its own, Theming for new tokens, Overlays for a new overlay.
- [ ] Home canvas: the card is generated from the page, but its size is measured. `pnpm build`, then `pnpm --filter @kappa-ui/docs canvas:measure --only <slug>` (or `--url http://localhost:3000` against the dev server) and commit `apps/docs/app/assets/canvas/sizes.json`. `pnpm --filter @kappa-ui/docs canvas:check fit --only <slug>` reports a demo that paints outside its card. Pages in `utilities` stay off the canvas.
- [ ] `pnpm --filter @kappa-ui/docs test` and `pnpm build` pass. The build checks that the page, its OG image and its `/r/*.json` were generated.

## 6. Changeset

- [ ] `pnpm changeset`: `@kappa-ui/registry` minor for a new component, plus `@kappa-ui/core` when a core module is new or changed. Docs, examples and thumbnails need none.
- [ ] Open the text with ``New `Name`: …`` (or ``` `Name` is … ```). The changelog parser reads that lead to mark the catalogue card **New** for 30 days after the release and to link the item's changelog (`apps/docs/scripts/lib/changelog.ts`). A changeset that only mentions the name marks it **Updated**.

## 7. Figma (maintainer)

The Figma file **Kappa UI** and the builders under `docs/superpowers/figma/` live outside the repository, so these steps are the maintainer's. An outside contributor notes in the PR that they are pending.

- [ ] Thumbnail: add the slug to `CATALOGUE` and a recipe to `RECIPES` in `docs/superpowers/figma/thumbnails.ts`, serve it with `node scripts/figma/cli.ts run docs/superpowers/figma/thumbnails.ts --payload '{"only":["<slug>"]}'` and run the printed loader in Figma. Review the 320×200 frame in the `thumbnails` section of the Mockups page: schematic, one accent, the detail that tells it apart from its neighbours, every paint bound to a Color variable.
- [ ] Export: `pnpm figma:thumbs --out apps/docs/app/assets/thumbnails --only <slug>` writes `<slug>.svg` with every colour rewritten to `var(--…)`. Commit it. _Caught by `apps/docs/test/unit/thumbnails.test.ts`: every component page has a thumbnail and every thumbnail a page, 320×200 view box, variable colours only, unique ids._
- [ ] Component: a Section named after the item on the Components page, one component per part named as in code, variant properties mirroring the `cva` names and defaults, a `color` axis when the prop exists, fills and radii bound to the `Color`, `Tone`, `Radius` and `Size` variables, layers named after `data-slot`, a description and a documentation link on each set. New lucide icons go in with `pnpm figma:icons`; a sized component is bound with the `bind-sizes` builder. Items without a look of their own (aspect-ratio, scroll-area, collapsible) are not transferred.

## 8. Before the PR

- [ ] `pnpm format` (Prettier plus the class wrapping), then `pnpm lint`, `pnpm typecheck` and `pnpm test`, one at a time.
- [ ] `pnpm smoke` for a new item: it packs core, serves the registry and installs every item into fresh Vite and Nuxt projects, then typechecks and builds them (network, minutes; `--only vite|nuxt`).
- [ ] Commits in conventional form with a scope and the reasoning in the body, split as the history does: `feat(<item>): …` for source, manifest and tests; `docs(<item>): …` for the page, examples and API; `docs(catalogue): thumbnails for …`.
- [ ] CI runs `pnpm typecheck`, `pnpm test` and `pnpm build`.

## Branch: a core module

Logic that should receive fixes through npm rather than being copied (gesture modules, the overlay scrim, directives, menu internals) goes into `packages/core`.

- [ ] `packages/core/src/<module>/index.ts`; every directory under `src` except `internal` is a module.
- [ ] One entry per module in both `exports` and `publishConfig.exports` of `packages/core/package.json`. tsdown picks the entry up on its own. _Caught by `packages/core/test/node/exports.test.ts`._
- [ ] No `class`, `className`, `classList` or `:class`: styling is the registry's job, and CSS the module needs goes through inline styles or `src/tailwind.css`. _Caught by `packages/core/test/node/classless.test.ts`._
- [ ] Tests under `test/node`, `test/browser` or `test/touch`; `pnpm --filter @kappa-ui/core build` checks the declaration build.
- [ ] Registry items that import it list `@kappa-ui/core` in `dependencies` without a version. The docs page sets `component: <registry item>`, or `category: utilities` when there is no registry item (the Drag, Ripple and Scroll pages).
- [ ] A changeset for `@kappa-ui/core`. The site deploys only once that core is on npm, so a component never reaches the site before the core it needs.

## Branch: a lib item

Shared styles or runtime that several components import and that no one component renders (`text-control`, `utils`).

- [ ] `packages/registry/src/lib/<name>.ts` and a `registry:lib` item in the manifest; the components that import it list it in `registryDependencies`.
- [ ] A docs page when it has an API of its own (the Text Control page). No `api/*.yml`: those are for `.vue` files only.
- [ ] A thumbnail when it has a page: the catalogue needs one per page.
