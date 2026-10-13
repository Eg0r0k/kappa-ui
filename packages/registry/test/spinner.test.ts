import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import { h } from "vue";

import { Button } from "@/ui/button";
import { Spinner } from "@/ui/spinner";

const width = (id: string) => document.querySelector(`[data-testid=${id}]`)!.getBoundingClientRect().width;

it("takes its size from the surrounding text, a class or a Button", () => {
  mount(
    () =>
      h("div", [
        h("div", { style: "width: 400px; font-size: 16px" }, [h(Spinner, { "data-testid": "bare" }), "Loading"]),
        h(Spinner, { class: "size-6", "data-testid": "classed" }),
        h(Button, null, () => [h(Spinner, { "data-testid": "in-button" }), "Save"]),
        h(Button, null, () => [h("svg", { viewBox: "0 0 24 24", "data-testid": "icon" }), "Save"]),
      ]),
    { attachTo: document.body },
  );
  expect(width("bare")).toBe(16);
  expect(width("classed")).toBe(24);
  expect(width("in-button")).toBe(width("icon"));
});

it("lets an animation class replace its own", () => {
  mount(() => h(Spinner, { class: "animate-none" }), { attachTo: document.body });
  expect(getComputedStyle(document.querySelector("[data-slot=spinner]")!).animationName).toBe("none");
});
