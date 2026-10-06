# @kappa-ui/core

The npm half of [kappa-ui](https://kappa-ui.pages.dev), a shadcn-style component registry for Vue 3 and Tailwind CSS v4.

kappa-ui components are copied into your project by the shadcn-vue CLI. Their mechanism lives here instead, so it receives fixes through npm:

- the overlay scrim and portal target, the `vRipple` and `vScrollFade` directives, the toast manager, programmatic dialogs, the tooltip behaviour (rest delay, long press on touch, close reasons), and the `drag` gesture with the swipe actions row built on it;
- `@kappa-ui/core/menu`, the menu parts [Reka UI](https://reka-ui.com) keeps internal, checked in development so a Reka upgrade that drops one fails with a message naming it;
- `@kappa-ui/core/tailwind.css`, the utilities and keyframes the components are drawn with.

The components import Reka UI themselves; it is a peer dependency here (`reka-ui` `^2.10.5`), so your project and kappa-ui share one copy. The CLI installs both with the first component you add, so you rarely need to install them yourself. To update, install the latest release:

```sh
npm install @kappa-ui/core@latest
```

`npm update` stays inside the range the CLI wrote, such as `^0.9.0`, and while the version starts with `0.`, a caret range never reaches the next minor release.

Documentation: https://kappa-ui.pages.dev

## License

MIT. Code adapted from Material Web (Apache-2.0) and Quasar (MIT) is listed in `THIRD_PARTY_NOTICES.md`.
