# @kappa-ui/core

The npm half of [kappa-ui](https://kappa-ui.pages.dev), a shadcn-style component registry for Vue 3 and Tailwind CSS v4.

kappa-ui components are copied into your project by the shadcn-vue CLI. Their mechanism lives here instead, so it receives fixes through npm:

- a re-export facade over [Reka UI](https://reka-ui.com), one entry per primitive (`@kappa-ui/core/dialog`, `@kappa-ui/core/select`, …);
- the overlay scrim and portal target, the `vRipple` and `vScrollFade` directives, the toast manager and programmatic dialogs;
- `@kappa-ui/core/tailwind.css`, the utilities and keyframes the components are drawn with.

The CLI installs this package with the first component you add, so you rarely need to install it yourself. To update it:

```sh
npm update @kappa-ui/core
```

Documentation: https://kappa-ui.pages.dev

## License

MIT. Code adapted from Material Web (Apache-2.0) and Quasar (MIT) is listed in `THIRD_PARTY_NOTICES.md`.
