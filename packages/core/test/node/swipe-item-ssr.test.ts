import { expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { SwipeAction, SwipeActions, SwipeContent, SwipeItem } from "../../src/swipe-actions";

it("renders an open row on the server without touching document", async () => {
  const errors: unknown[] = [];
  const app = createSSRApp({
    render: () =>
      h(SwipeItem, { state: "end" }, () => [
        h(SwipeActions, { side: "end" }, () => h(SwipeAction, () => "Delete")),
        h(SwipeContent, () => "Row"),
      ]),
  });
  app.config.errorHandler = (error) => {
    errors.push(error);
  };
  app.config.warnHandler = () => {};
  const html = await renderToString(app);
  expect(errors.map(String)).toEqual([]);
  expect(html).toContain('data-state="end"');
});
