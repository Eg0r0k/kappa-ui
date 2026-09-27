import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { h } from "vue";

import { Button } from "@/ui/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/ui/button-group";

afterEach(() => {
  document.body.innerHTML = "";
});

const three = () =>
  ["One", "Two", "Three"].map((label) => h(Button, { variant: "outline", color: "neutral" }, () => label));

const render = (props: Record<string, unknown> = {}, children: () => unknown = three) =>
  mount({ render: () => h(ButtonGroup, props, { default: children }) }, { attachTo: document.body }).get(
    "[data-slot=button-group]",
  ).element as HTMLElement;

const styles = (group: HTMLElement) => [...group.children].map((child) => getComputedStyle(child));

describe("ButtonGroup", () => {
  it("is a horizontal group", () => {
    const group = render();

    expect(group.getAttribute("role")).toBe("group");
    expect(group.dataset.orientation).toBe("horizontal");
    expect(getComputedStyle(group).flexDirection).toBe("row");
  });

  it("squares the inner corners and keeps the outer ones", () => {
    const [first, middle, last] = styles(render());

    expect(first!.borderStartStartRadius).not.toBe("0px");
    expect(first!.borderStartEndRadius).toBe("0px");
    expect([middle!.borderStartStartRadius, middle!.borderStartEndRadius]).toEqual(["0px", "0px"]);
    expect(last!.borderStartStartRadius).toBe("0px");
    expect(last!.borderStartEndRadius).not.toBe("0px");
  });

  it("joins outlined buttons with a single 1px seam", () => {
    const [first, second] = [...render().children].map((child) => child.getBoundingClientRect());

    expect(second!.left).toBe(first!.right - 1);
  });

  it("stacks vertically", () => {
    const group = render({ orientation: "vertical" });
    const [first, middle] = styles(group);
    const [firstBox, middleBox] = [...group.children].map((child) => child.getBoundingClientRect());

    expect(getComputedStyle(group).flexDirection).toBe("column");
    expect(first!.borderBottomLeftRadius).toBe("0px");
    expect(middleBox!.top).toBe(firstBox!.bottom - 1);
    expect([middle!.borderTopLeftRadius, middle!.borderBottomRightRadius]).toEqual(["0px", "0px"]);
  });

  it("rounds the inner corners with --button-group-radius", () => {
    const [, middle] = styles(render({ style: "--button-group-radius: 4px" }));

    expect([middle!.borderStartStartRadius, middle!.borderStartEndRadius]).toEqual(["4px", "4px"]);
  });

  it("draws a vertical separator the height of the group", () => {
    const group = render({}, () => [
      h(Button, { variant: "soft", color: "neutral" }, () => "Copy"),
      h(ButtonGroupSeparator),
      h(Button, { variant: "soft", color: "neutral" }, () => "Paste"),
    ]);
    const separator = group.querySelector<HTMLElement>("[data-slot=button-group-separator]")!;

    expect(separator.dataset.orientation).toBe("vertical");
    expect(separator.getBoundingClientRect().height).toBe(group.getBoundingClientRect().height);
    expect(separator.getBoundingClientRect().width).toBe(1);
    const box = separator.getBoundingClientRect();
    expect(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)).toBe(separator);
  });

  it("keeps the gap between nested groups", () => {
    const group = render({}, () => [
      h(ButtonGroup, () => [h(Button, { variant: "outline" }, () => "A")]),
      h(ButtonGroup, () => [h(Button, { variant: "outline" }, () => "B")]),
    ]);
    const [one, two] = [...group.children].map((child) => child.getBoundingClientRect());

    expect(two!.left - one!.right).toBe(8);
  });

  it("joins text to the buttons at the group's height", () => {
    const group = render({}, () => [
      h(ButtonGroupText, () => "https://"),
      h(Button, { variant: "outline", color: "neutral" }, () => "Go"),
    ]);
    const text = group.querySelector<HTMLElement>("[data-slot=button-group-text]")!;
    const style = getComputedStyle(text);

    expect(text.tagName).toBe("DIV");
    expect(text.getBoundingClientRect().height).toBe(group.getBoundingClientRect().height);
    expect(style.borderStartEndRadius).toBe("0px");
    expect(style.borderTopWidth).toBe("1px");
  });

  it("renders its own element as a label through as-child", () => {
    const group = render({}, () => [
      h(ButtonGroupText, { asChild: true }, () => h("label", { for: "x" }, "Name")),
      h(Button, { variant: "outline", color: "neutral" }, () => "Go"),
    ]);

    expect(group.querySelector("[data-slot=button-group-text]")!.tagName).toBe("LABEL");
  });
});
