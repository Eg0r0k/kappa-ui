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

  it("collapses the borders between outlined buttons", () => {
    const [first, second] = styles(render());

    expect(first!.borderInlineStartWidth).toBe("1px");
    expect(second!.borderInlineStartWidth).toBe("0px");
  });

  it("stacks vertically", () => {
    const group = render({ orientation: "vertical" });
    const [first, middle] = styles(group);

    expect(getComputedStyle(group).flexDirection).toBe("column");
    expect(first!.borderBottomLeftRadius).toBe("0px");
    expect(middle!.borderTopWidth).toBe("0px");
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
