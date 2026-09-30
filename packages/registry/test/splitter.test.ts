import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, h } from "vue";

import { Splitter, SplitterHandle, SplitterPanel } from "@/ui/splitter";

afterEach(() => {
  document.body.innerHTML = "";
});

const render = (node: () => VNode) =>
  mount({ render: () => h("div", { style: "width:400px;height:200px" }, node()) }, { attachTo: document.body });

const two = (
  groupProps: Record<string, unknown> = {},
  handleProps: Record<string, unknown> = {},
  handleSlot?: () => VNode[],
) =>
  render(() =>
    h(Splitter, groupProps, () => [
      h(SplitterPanel, { defaultSize: 50, minSize: 20 }, () => "A"),
      h(SplitterHandle, handleProps, handleSlot),
      h(SplitterPanel, { defaultSize: 50, minSize: 20 }, () => "B"),
    ]),
  );

const q = (selector: string) => document.querySelector<HTMLElement>(selector)!;
const sizes = () =>
  [...document.querySelectorAll<HTMLElement>("[data-slot=splitter-panel]")].map((panel) => panel.dataset.panelSize);
const paint = (className: string) => {
  const probe = document.createElement("div");
  probe.className = className;
  document.body.append(probe);
  const color = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return color;
};

it("renders the group, its panels and a separator handle", () => {
  two();
  expect(q("[data-slot=splitter]").dataset.orientation).toBe("horizontal");
  expect(document.querySelectorAll("[data-slot=splitter-panel]")).toHaveLength(2);
  const handle = q("[data-slot=splitter-handle]");
  expect(handle.getAttribute("role")).toBe("separator");
  expect(handle.dataset.variant).toBe("line");
  expect(handle.dataset.state).toBe("inactive");
  expect(handle.tabIndex).toBe(0);
});

it.each([
  ["line", "horizontal", 1, "width"],
  ["line", "vertical", 1, "height"],
  ["gutter", "horizontal", 8, "width"],
  ["gutter", "vertical", 8, "height"],
] as const)("%s is %ipx thick across a %s group and spans the other axis", (variant, direction, px, side) => {
  two({ direction }, { variant });
  const box = q("[data-slot=splitter-handle]").getBoundingClientRect();
  expect(box[side]).toBe(px);
  expect(box[side === "width" ? "height" : "width"]).toBe(side === "width" ? 200 : 400);
});

it("draws a grip with an icon, or the slot, only when asked", () => {
  const plain = two();
  expect(document.querySelector("[data-slot=splitter-grip]")).toBeNull();
  plain.unmount();

  const withIcon = two({}, { grip: true });
  const grip = q("[data-slot=splitter-grip]");
  expect(grip.querySelector("svg")).not.toBeNull();
  expect(grip.getBoundingClientRect().width).toBe(12);
  expect(grip.getBoundingClientRect().height).toBe(16);
  expect(getComputedStyle(grip).rotate).toBe("none");
  withIcon.unmount();

  two({ direction: "vertical" }, { grip: true }, () => [h("i", "x")]);
  const custom = q("[data-slot=splitter-grip]");
  expect(custom.textContent).toBe("x");
  expect(custom.querySelector("svg")).toBeNull();
  expect(getComputedStyle(custom).rotate).toBe("90deg");
});

it("lights up in primary while the pointer is over it", async () => {
  two();
  const handle = q("[data-slot=splitter-handle]");
  expect(getComputedStyle(handle).backgroundColor).toBe(paint("bg-border"));
  await userEvent.hover(handle);
  await expect.poll(() => handle.dataset.state).toBe("hover");
  await expect.poll(() => getComputedStyle(handle).backgroundColor).toBe(paint("bg-primary"));
  await userEvent.hover(q("[data-slot=splitter-panel]"));
  await expect.poll(() => handle.dataset.state).toBe("inactive");
});

it("shows a primary line in a hovered gutter", async () => {
  two({}, { variant: "gutter" });
  const handle = q("[data-slot=splitter-handle]");
  expect(getComputedStyle(handle, "::before").backgroundColor).toBe("rgba(0, 0, 0, 0)");
  await userEvent.hover(handle);
  await expect.poll(() => handle.dataset.state).toBe("hover");
  await expect.poll(() => getComputedStyle(handle, "::before").backgroundColor).toBe(paint("bg-primary"));
  expect(Number.parseFloat(getComputedStyle(handle, "::before").width)).toBe(2);
});

it("resizes by keyboard-resize-by on the arrow keys", async () => {
  two();
  await expect.poll(sizes).toEqual(["50.0", "50.0"]);
  q("[data-slot=splitter-handle]").focus();
  await userEvent.keyboard("{ArrowRight}");
  await expect.poll(sizes).toEqual(["60.0", "40.0"]);
  await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
  await expect.poll(sizes).toEqual(["40.0", "60.0"]);
});

it("pushes the next panel along once a neighbour is at its minimum", async () => {
  render(() =>
    h(Splitter, {}, () => [
      h(SplitterPanel, { defaultSize: 30, minSize: 20 }, () => "A"),
      h(SplitterHandle),
      h(SplitterPanel, { defaultSize: 40, minSize: 20 }, () => "B"),
      h(SplitterHandle),
      h(SplitterPanel, { defaultSize: 30, minSize: 20 }, () => "C"),
    ]),
  );
  await expect.poll(sizes).toEqual(["30.0", "40.0", "30.0"]);
  q("[data-slot=splitter-handle]").focus();
  await userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}");
  await expect.poll(sizes).toEqual(["60.0", "20.0", "20.0"]);
});

it("puts both neighbours back to their starting sizes on double-click", async () => {
  two();
  const handle = q("[data-slot=splitter-handle]");
  handle.focus();
  await userEvent.keyboard("{ArrowRight}{ArrowRight}");
  await expect.poll(sizes).toEqual(["70.0", "30.0"]);
  await userEvent.dblClick(handle);
  await expect.poll(sizes).toEqual(["50.0", "50.0"]);
});

it("resets only the group whose handle was double-clicked", async () => {
  render(() =>
    h(Splitter, {}, () => [
      h(SplitterPanel, { defaultSize: 50 }, () => "A"),
      h(SplitterHandle, { id: "outer-handle" }),
      h(SplitterPanel, { defaultSize: 50 }, () =>
        h(Splitter, { direction: "vertical" }, () => [
          h(SplitterPanel, { defaultSize: 50 }, () => "B"),
          h(SplitterHandle, { id: "inner-handle" }),
          h(SplitterPanel, { defaultSize: 50 }, () => "C"),
        ]),
      ),
    ]),
  );
  await expect.poll(sizes).toEqual(["50.0", "50.0", "50.0", "50.0"]);
  q("#outer-handle").focus();
  await userEvent.keyboard("{ArrowRight}");
  q("#inner-handle").focus();
  await userEvent.keyboard("{ArrowDown}");
  await expect.poll(sizes).toEqual(["60.0", "40.0", "60.0", "40.0"]);
  await userEvent.dblClick(q("#inner-handle"));
  await expect.poll(sizes).toEqual(["60.0", "40.0", "50.0", "50.0"]);
});

it("keeps a disabled handle inert", async () => {
  two({}, { disabled: true });
  const handle = q("[data-slot=splitter-handle]");
  expect(handle.dataset.disabled).toBe("");
  await userEvent.hover(handle);
  expect(handle.dataset.state).toBe("inactive");
  handle.focus();
  await userEvent.keyboard("{ArrowRight}");
  await userEvent.dblClick(handle);
  expect(sizes()).toEqual(["50.0", "50.0"]);
});

it("exposes the panel's methods", async () => {
  const wrapper = render(() =>
    h(Splitter, {}, () => [
      h(SplitterPanel, { ref: "side", defaultSize: 30, minSize: 10, collapsible: true, collapsedSize: 5 }, () => "A"),
      h(SplitterHandle),
      h(SplitterPanel, { defaultSize: 70 }, () => "B"),
    ]),
  );
  const side = wrapper.vm.$refs.side as {
    collapse: () => void;
    expand: () => void;
    resize: (size: number) => void;
    getSize: () => number;
    isCollapsed: boolean;
  };
  await expect.poll(sizes).toEqual(["30.0", "70.0"]);
  side.collapse();
  await expect.poll(sizes).toEqual(["5.0", "95.0"]);
  expect(side.isCollapsed).toBe(true);
  side.expand();
  await expect.poll(sizes).toEqual(["30.0", "70.0"]);
  side.resize(40);
  await expect.poll(() => side.getSize()).toBe(40);
});
