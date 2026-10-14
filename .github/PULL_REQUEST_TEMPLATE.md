<!-- What changes and why. The reasoning belongs in the commit bodies too. -->

## Checklist

For any change:

- [ ] `pnpm test` passes locally: format, script tests, lint, every package's tests.
- [ ] A changeset (`pnpm changeset`) for a change users will notice in `@kappa-ui/core` or a component; none for docs only.

For a new component, every step in [CONTRIBUTING.md](../CONTRIBUTING.md):

- [ ] Source under `src/ui/<item>/`, a manifest item with one category, `pnpm registry:build` passes.
- [ ] Examples as manifest items, the props console on the demo.
- [ ] Tests, the Firefox include list if scroll-dependent, visual baselines committed.
- [ ] Docs page numbered in its category, `api/*.yml` per part, the canvas size measured.
- [ ] A changeset opening with ``New `Name` …``.
- [ ] Thumbnail SVG and Figma component, or a note that the maintainer still has to do them.
