import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { h } from "vue";

import { Card } from "@/ui/card";
import { Checkbox } from "@/ui/checkbox";

const tokens = ["rounded-xs", "rounded-sm", "rounded-md", "rounded-lg", "rounded-xl", "rounded-2xl", "rounded-3xl", "rounded-4xl"];

const radiiUnder = (radius?: string) => {
  const host = document.createElement("div");
  if (radius) host.style.setProperty("--radius", radius);
  host.innerHTML = tokens.map((token) => `<div class="${token}"></div>`).join("");
  document.body.append(host);
  return [...host.children].map((child) => getComputedStyle(child).borderRadius);
};

afterEach(() => {
  document.body.innerHTML = "";
});

it("scales every radius token with --radius", () => {
  expect(radiiUnder()).toEqual(["2.4px", "7.2px", "9.6px", "12px", "16.8px", "21.6px", "26.4px", "31.2px"]);
});

it("drops every radius token to zero when --radius is zero", () => {
  expect(radiiUnder("0px")).toEqual(tokens.map(() => "0px"));
});

it("squares cards and checkboxes when --radius is zero", () => {
  const wrapper = mount(
    { render: () => h("div", { style: "--radius: 0px" }, [h(Card, () => "Card"), h(Checkbox)]) },
    { attachTo: document.body },
  );

  expect(getComputedStyle(wrapper.get("[data-slot=card]").element).borderRadius).toBe("0px");
  expect(getComputedStyle(wrapper.get("[data-slot=checkbox]").element).borderRadius).toBe("0px");
  wrapper.unmount();
});

const radiusOf = (element: Element, corner = "borderTopLeftRadius") =>
  getComputedStyle(element)[corner as "borderTopLeftRadius"];

it("rounds controls by their height: md up to 28px, lg up to 40px, xl from 48px", async () => {
  const { Button } = await import("@/ui/button");
  const { Input } = await import("@/ui/input");
  const { Textarea } = await import("@/ui/textarea");
  const { SelectTrigger, Select } = await import("@/ui/select");
  const { InputGroup, InputGroupInput } = await import("@/ui/input-group");
  const wrapper = mount(
    {
      render: () =>
        h("div", [
          ...(["xs", "sm", "default", "lg", "xl", "icon-xs", "icon-sm", "icon", "icon-lg", "icon-xl"] as const).map((size) =>
            h(Button, { size, "data-case": `button-${size}` }, () => "B"),
          ),
          ...(["xs", "sm", "md", "lg", "xl"] as const).flatMap((size) => [
            h(Input, { size, "data-case": `input-${size}` }),
            h(Textarea, { size, "data-case": `textarea-${size}` }),
            h(Select, () => h(SelectTrigger, { size, "data-case": `select-${size}` }, () => "S")),
            h(InputGroup, { size, "data-case": `group-${size}` }, () => h(InputGroupInput)),
          ]),
        ]),
    },
    { attachTo: document.body },
  );
  const radius = (name: string) => radiusOf(document.querySelector(`[data-case=${name}]`)!);

  expect(["xs", "sm", "default", "lg", "xl"].map((size) => radius(`button-${size}`))).toEqual([
    "9.6px",
    "12px",
    "12px",
    "12px",
    "16.8px",
  ]);
  expect(["icon-xs", "icon-sm", "icon", "icon-lg", "icon-xl"].map((size) => radius(`button-${size}`))).toEqual([
    "9.6px",
    "12px",
    "12px",
    "12px",
    "16.8px",
  ]);
  for (const control of ["input", "textarea", "select", "group"]) {
    expect(["xs", "sm", "md", "lg", "xl"].map((size) => radius(`${control}-${size}`)), control).toEqual([
      "9.6px",
      "12px",
      "12px",
      "12px",
      "16.8px",
    ]);
  }
  wrapper.unmount();
});

it("keeps a filled control square at the bottom at every size", async () => {
  const { Input } = await import("@/ui/input");
  const wrapper = mount(
    { render: () => h("div", (["xs", "xl"] as const).map((size) => h(Input, { size, variant: "filled", "data-case": size }))) },
    { attachTo: document.body },
  );
  const corners = (size: string) => {
    const element = document.querySelector(`[data-case=${size}]`)!;
    return [radiusOf(element), radiusOf(element, "borderBottomLeftRadius")];
  };
  expect(corners("xs")).toEqual(["9.6px", "0px"]);
  expect(corners("xl")).toEqual(["16.8px", "0px"]);
  wrapper.unmount();
});

it("rounds a floating-label field by its taller height", async () => {
  const { Input } = await import("@/ui/input");
  const wrapper = mount(
    {
      render: () =>
        h("div", [
          h(Input, { label: "Email", size: "md", "data-case": "outline" }),
          h(Input, { label: "Email", size: "md", variant: "soft", "data-case": "soft" }),
          h(Input, { label: "Email", size: "xs", variant: "soft", "data-case": "soft-xs" }),
        ]),
    },
    { attachTo: document.body },
  );
  const input = (name: string) => document.querySelector(`input[data-case=${name}]`)!;
  const outline = input("outline").closest("[data-slot=input-control]")!.querySelector("fieldset")!;
  expect(radiusOf(outline)).toBe("12px");
  expect(radiusOf(input("soft"))).toBe("16.8px");
  expect(radiusOf(input("soft-xs"))).toBe("12px");
  wrapper.unmount();
});

it("follows a --radius set on an ancestor, not only on the root", async () => {
  const { Input } = await import("@/ui/input");
  const { Textarea } = await import("@/ui/textarea");
  const { Select, SelectTrigger } = await import("@/ui/select");
  const { InputGroup, InputGroupInput } = await import("@/ui/input-group");
  const { Tabs, TabsList, TabsTrigger } = await import("@/ui/tabs");
  const wrapper = mount(
    {
      render: () =>
        h("div", { style: "--radius: 0px" }, [
          h(Input, { "data-case": "input" }),
          h(Input, { label: "Name", "data-case": "floating" }),
          h(Textarea, { "data-case": "textarea" }),
          h(Select, () => h(SelectTrigger, { "data-case": "select" }, () => "S")),
          h(InputGroup, { "data-case": "input-group" }, () => h(InputGroupInput)),
          h(Tabs, { defaultValue: "a" }, () => h(TabsList, { "data-case": "tabs" }, () => h(TabsTrigger, { value: "a" }, () => "A"))),
        ]),
    },
    { attachTo: document.body },
  );
  const radii = Object.fromEntries(
    [...document.querySelectorAll("[data-case]")].map((element) => [
      element.getAttribute("data-case"),
      radiusOf(element.matches("[data-case=floating]") ? element.closest("[data-slot=input-control]")!.querySelector("fieldset")! : element),
    ]),
  );

  expect(radii).toEqual({
    input: "0px",
    floating: "0px",
    textarea: "0px",
    select: "0px",
    "input-group": "0px",
    tabs: "0px",
  });
  wrapper.unmount();
});
