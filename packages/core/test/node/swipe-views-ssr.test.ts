import { expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { SwipeView, SwipeViewsRoot } from "../../src/swipe-views";

const render = async (root: Record<string, unknown>) => {
  const errors: unknown[] = [];
  const app = createSSRApp({
    render: () =>
      h(SwipeViewsRoot, root, () =>
        ["a", "b", "c", "d"].map((value) => h(SwipeView, { key: value, value, "data-test": value }, () => value)),
      ),
  });
  app.config.errorHandler = (error) => {
    errors.push(error);
  };
  app.config.warnHandler = () => {};
  const html = await renderToString(app);
  expect(errors.map(String)).toEqual([]);
  return (value: string) => html.match(new RegExp(`<div[^>]*data-test="${value}"[^>]*>`))?.[0] ?? "";
};

it("renders the model's page active and the others inert on the server", async () => {
  const tag = await render({ modelValue: "c", layout: "stack" });
  expect(tag("c")).toContain('data-state="active"');
  expect(tag("c")).not.toContain("inert");
  for (const value of ["a", "b", "d"]) {
    expect(tag(value)).toContain('data-state="inactive"');
    expect(tag(value)).toContain("inert");
  }
});

it("places the pages by index on the server, a page before the active one just outside the frame", async () => {
  const tag = await render({ modelValue: "c" });
  expect(tag("a")).toContain("--swipe-view-start:0%;--swipe-snap-offset:-100%;--swipe-snap-position:1");
  expect(tag("b")).toContain("--swipe-view-start:100%;--swipe-snap-offset:-200%;--swipe-snap-position:2");
  expect(tag("c")).toContain("--swipe-view-start:200%;--swipe-snap-offset:-200%;--swipe-snap-position:2");
  expect(tag("d")).toContain("--swipe-view-start:300%;--swipe-snap-offset:-200%;--swipe-snap-position:2");
});

it("mirrors the server positions in right-to-left and takes the first page without a model", async () => {
  const tag = await render({ dir: "rtl" });
  expect(tag("a")).toContain('data-state="active"');
  expect(tag("b")).toContain("--swipe-view-start:-100%;--swipe-snap-offset:0%;--swipe-snap-position:0");
});
