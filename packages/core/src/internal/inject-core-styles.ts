const css = `@layer kappa-core {
  [data-kappa-scroll-viewport]::-webkit-scrollbar { display: none }
}`;

let injected = false;

export const injectCoreStyles = () => {
  if (injected || typeof document === "undefined") return;
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(css);
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  injected = true;
};
