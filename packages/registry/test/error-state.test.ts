import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { h } from "vue";

import {
  ErrorState,
  ErrorStateActions,
  ErrorStateDescription,
  ErrorStateHeader,
  ErrorStateMedia,
  ErrorStateTitle,
} from "@/ui/error-state";

const mounted: { unmount: () => void }[] = [];
afterEach(() => {
  while (mounted.length) mounted.pop()!.unmount();
});

const render = (root: Record<string, unknown> = {}, media?: () => unknown) => {
  const wrapper = mount(
    {
      render: () =>
        h("div", { style: "width:600px" }, [
          h(ErrorState, root, () => [
            h(ErrorStateHeader, () => [
              h(ErrorStateMedia, null, media ? { default: media } : undefined),
              h(ErrorStateTitle, () => "Couldn't load projects"),
              h(ErrorStateDescription, () => "Try again in a moment."),
            ]),
            h(ErrorStateActions, () => h("button", "Retry")),
          ]),
        ]),
    },
    { attachTo: document.body },
  );
  mounted.push(wrapper);
  return wrapper;
};

const q = (selector: string) => document.querySelector<HTMLElement>(selector);
const colourOf = (className: string) => {
  const probe = document.createElement("span");
  probe.className = className;
  document.body.append(probe);
  const colour = getComputedStyle(probe).color;
  probe.remove();
  return colour;
};

it("renders six parts with their own data-slots in place of Empty's", () => {
  render();
  for (const slot of [
    "error-state",
    "error-state-header",
    "error-state-media",
    "error-state-title",
    "error-state-description",
    "error-state-actions",
  ]) {
    expect(q(`[data-slot=${slot}]`)).not.toBeNull();
  }
  expect(q("[data-slot^=empty]")).toBeNull();
  expect(q("[data-slot=error-state]")!.dataset.size).toBe("md");
  expect(q("[data-slot=error-state-title]")!.tagName).toBe("H3");
});

it("is an alert unless given another role", () => {
  render();
  expect(q("[data-slot=error-state]")!.getAttribute("role")).toBe("alert");
  mounted.pop()!.unmount();
  render({ role: "status" });
  expect(q("[data-slot=error-state]")!.getAttribute("role")).toBe("status");
});

it("shows an error icon in the destructive colour until the media slot replaces it", () => {
  render();
  const media = q("[data-slot=error-state-media]")!;
  expect(media.querySelector("svg")).not.toBeNull();
  expect(getComputedStyle(media).color).toBe(colourOf("text-destructive"));
  mounted.pop()!.unmount();
  render({}, () => h("img", { alt: "" }));
  expect(q("[data-slot=error-state-media] svg")).toBeNull();
  expect(q("[data-slot=error-state-media] img")).not.toBeNull();
});

it("sizes the icon from the root's size, as Empty does", () => {
  render({ size: "lg" });
  expect(q("[data-slot=error-state]")!.dataset.size).toBe("lg");
  expect(q("[data-slot=error-state-media] svg")!.getBoundingClientRect().width).toBe(48);
});

it("forwards as to the title", () => {
  mounted.push(mount(() => h(ErrorStateTitle, { as: "h2" }, () => "Oops"), { attachTo: document.body }));
  expect(q("[data-slot=error-state-title]")!.tagName).toBe("H2");
});
