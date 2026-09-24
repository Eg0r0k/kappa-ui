import { expect, it } from "vitest";

import { injectCoreStyles } from "../../src/internal/inject-core-styles";

it("adopts one delta-core sheet however often it is called", () => {
  const before = document.adoptedStyleSheets.length;

  injectCoreStyles();
  injectCoreStyles();

  expect(document.adoptedStyleSheets).toHaveLength(before + 1);
  const text = [...document.adoptedStyleSheets.at(-1)!.cssRules].map((rule) => rule.cssText).join("\n");
  expect(text).toContain("@layer delta-core");
  expect(text).toContain("[data-delta-scroll-viewport]::-webkit-scrollbar");
  expect(text).toContain("display: none");
});
