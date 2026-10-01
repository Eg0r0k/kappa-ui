import { mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { h, nextTick, ref } from "vue";

import { InnerLoading, InnerLoadingContent, InnerLoadingOverlay } from "@/ui/inner-loading";

type Classes = Partial<Record<"root" | "content" | "overlay", string>>;

afterEach(() => {
  document.body.innerHTML = "";
});

const render = (loading = false, indicator?: () => unknown, classes: Classes = {}) => {
  const state = ref(loading);
  const wrapper = mount(
    {
      render: () =>
        h(InnerLoading, { loading: state.value, class: classes.root }, () => [
          h(InnerLoadingContent, { class: classes.content }, () => h("button", { type: "button" }, "Save")),
          h(InnerLoadingOverlay, { class: classes.overlay }, indicator),
        ]),
    },
    { attachTo: document.body },
  );
  const root = wrapper.element as HTMLElement;
  return {
    state,
    root,
    content: () => root.querySelector<HTMLElement>("[data-slot=inner-loading-content]")!,
    overlay: () => root.querySelector<HTMLElement>("[data-slot=inner-loading-overlay]"),
    button: () => root.querySelector<HTMLButtonElement>("button")!,
  };
};

it("leaves the content alone while not loading", () => {
  const { root, content, overlay, button } = render();

  expect(root.dataset.slot).toBe("inner-loading");
  expect(root.hasAttribute("aria-busy")).toBe(false);
  expect(content().hasAttribute("inert")).toBe(false);
  expect(overlay()).toBeNull();
  button().focus();
  expect(document.activeElement).toBe(button());
});

it("covers and blocks the content while loading", async () => {
  const { state, root, content, overlay, button } = render();

  state.value = true;
  await nextTick();

  expect(root.getAttribute("aria-busy")).toBe("true");
  expect(content().hasAttribute("inert")).toBe(true);
  expect(overlay()!.getAttribute("role")).toBe("status");
  expect(overlay()!.querySelector("[data-slot=spinner]")).not.toBeNull();
  expect(overlay()!.getBoundingClientRect()).toEqual(root.getBoundingClientRect());
  button().focus();
  expect(document.activeElement).not.toBe(button());
});

it("replaces the spinner with its slot", () => {
  const { overlay } = render(true, () => "Saving…");

  expect(overlay()!.textContent).toBe("Saving…");
  expect(overlay()!.querySelector("[data-slot=spinner]")).toBeNull();
});

it("returns focus to the control that had it", async () => {
  const { state, button } = render();
  button().focus();

  state.value = true;
  await vi.waitFor(() => expect(document.activeElement).not.toBe(button()));

  state.value = false;
  await vi.waitFor(() => expect(document.activeElement).toBe(button()));
});

it("keeps the content wrapper out of layout", () => {
  const { content } = render();

  expect(getComputedStyle(content()).display).toBe("contents");
});

it("merges class on each part", () => {
  const { root, content, overlay } = render(true, undefined, {
    root: "p-2",
    content: "text-xs",
    overlay: "bg-card/70",
  });

  expect(root.classList.contains("p-2")).toBe(true);
  expect(root.classList.contains("relative")).toBe(true);
  expect(content().classList.contains("text-xs")).toBe(true);
  expect(overlay()!.classList.contains("bg-card/70")).toBe(true);
  expect(overlay()!.classList.contains("bg-background/70")).toBe(false);
});

it("throws outside InnerLoading", () => {
  expect(() => mount(InnerLoadingContent)).toThrow(/InnerLoading/);
  expect(() => mount(InnerLoadingOverlay)).toThrow(/InnerLoading/);
});
