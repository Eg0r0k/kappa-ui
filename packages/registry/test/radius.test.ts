import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import { h } from "vue";

import { cn } from "@/lib/utils";
import { Card } from "@/ui/card";
import { Checkbox } from "@/ui/checkbox";

const tokens = [
  "rounded-xs",
  "rounded-sm",
  "rounded-md",
  "rounded-lg",
  "rounded-xl",
  "rounded-2xl",
  "rounded-3xl",
  "rounded-4xl",
];

const radiiUnder = (radius?: string) => {
  const host = document.createElement("div");
  if (radius) host.style.setProperty("--radius", radius);
  host.innerHTML = tokens.map((token) => `<div class="${token}"></div>`).join("");
  document.body.append(host);
  return [...host.children].map((child) => getComputedStyle(child).borderRadius);
};

it("scales every radius token with --radius", () => {
  expect(radiiUnder()).toEqual(["1.6px", "4.8px", "6.4px", "8px", "11.2px", "14.4px", "17.6px", "20.8px"]);
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
          ...(["xs", "sm", "md", "lg", "xl", "icon-xs", "icon-sm", "icon-md", "icon-lg", "icon-xl"] as const).map(
            (size) => h(Button, { size, "data-case": `button-${size}` }, () => "B"),
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

  expect(["xs", "sm", "md", "lg", "xl"].map((size) => radius(`button-${size}`))).toEqual([
    "6.4px",
    "8px",
    "8px",
    "8px",
    "11.2px",
  ]);
  expect(["icon-xs", "icon-sm", "icon-md", "icon-lg", "icon-xl"].map((size) => radius(`button-${size}`))).toEqual([
    "6.4px",
    "8px",
    "8px",
    "8px",
    "11.2px",
  ]);
  for (const control of ["input", "textarea", "select", "group"]) {
    expect(
      ["xs", "sm", "md", "lg", "xl"].map((size) => radius(`${control}-${size}`)),
      control,
    ).toEqual(["6.4px", "8px", "8px", "8px", "11.2px"]);
  }
  wrapper.unmount();
});

it("keeps a filled control square at the bottom at every size", async () => {
  const { Input } = await import("@/ui/input");
  const wrapper = mount(
    {
      render: () =>
        h(
          "div",
          (["xs", "xl"] as const).map((size) => h(Input, { size, variant: "filled", "data-case": size })),
        ),
    },
    { attachTo: document.body },
  );
  const corners = (size: string) => {
    const element = document.querySelector(`[data-case=${size}]`)!;
    return [radiusOf(element), radiusOf(element, "borderBottomLeftRadius")];
  };
  expect(corners("xs")).toEqual(["6.4px", "0px"]);
  expect(corners("xl")).toEqual(["11.2px", "0px"]);
  wrapper.unmount();
});

it("rounds a floating-label field by its taller height", async () => {
  const { InputFloating } = await import("@/ui/input-floating");
  const wrapper = mount(
    {
      render: () =>
        h("div", [
          h(InputFloating, { label: "Email", size: "md", "data-case": "outline" }),
          h(InputFloating, { label: "Email", size: "md", variant: "soft", "data-case": "soft" }),
          h(InputFloating, { label: "Email", size: "xs", variant: "soft", "data-case": "soft-xs" }),
        ]),
    },
    { attachTo: document.body },
  );
  const input = (name: string) => document.querySelector(`input[data-case=${name}]`)!;
  const outline = input("outline").closest("[data-slot=input-floating]")!.querySelector("fieldset")!;
  expect(radiusOf(outline)).toBe("8px");
  expect(radiusOf(input("soft"))).toBe("11.2px");
  expect(radiusOf(input("soft-xs"))).toBe("8px");
  wrapper.unmount();
});

it("follows a --radius set on an ancestor, not only on the root", async () => {
  const { Input } = await import("@/ui/input");
  const { InputFloating } = await import("@/ui/input-floating");
  const { Textarea } = await import("@/ui/textarea");
  const { Select, SelectTrigger } = await import("@/ui/select");
  const { InputGroup, InputGroupInput } = await import("@/ui/input-group");
  const { Tabs, TabsList, TabsTrigger } = await import("@/ui/tabs");
  const wrapper = mount(
    {
      render: () =>
        h("div", { style: "--radius: 0px" }, [
          h(Input, { "data-case": "input" }),
          h(InputFloating, { label: "Name", "data-case": "floating" }),
          h(Textarea, { "data-case": "textarea" }),
          h(Select, () => h(SelectTrigger, { "data-case": "select" }, () => "S")),
          h(InputGroup, { "data-case": "input-group" }, () => h(InputGroupInput)),
          h(Tabs, { defaultValue: "a" }, () =>
            h(TabsList, { "data-case": "tabs" }, () => h(TabsTrigger, { value: "a" }, () => "A")),
          ),
        ]),
    },
    { attachTo: document.body },
  );
  const radii = Object.fromEntries(
    [...document.querySelectorAll("[data-case]")].map((element) => [
      element.getAttribute("data-case"),
      radiusOf(
        element.matches("[data-case=floating]")
          ? element.closest("[data-slot=input-floating]")!.querySelector("fieldset")!
          : element,
      ),
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

const roleSteps = [
  "rounded-control-3xs",
  "rounded-control-2xs",
  "rounded-control-xs",
  "rounded-control-sm",
  "rounded-control-md",
  "rounded-control-lg",
  "rounded-control-xl",
  "rounded-surface-xs",
  "rounded-surface-sm",
  "rounded-surface-md",
  "rounded-surface-lg",
  "rounded-surface-xl",
  "rounded-item-xs",
  "rounded-item-sm",
  "rounded-item-md",
  "rounded-item-lg",
  "rounded-item-xl",
];

const computedRadii = (classes: string[], style = "") => {
  const host = document.createElement("div");
  host.setAttribute("style", style);
  host.innerHTML = classes.map((name) => `<div class="${name}"></div>`).join("");
  document.body.append(host);
  const radii = [...host.children].map((child) => getComputedStyle(child).borderRadius);
  host.remove();
  return radii;
};

it("derives every role step from the base when no knob is set", () => {
  expect(computedRadii(roleSteps)).toEqual([
    "1.6px",
    "4.8px",
    "6.4px",
    "8px",
    "8px",
    "8px",
    "11.2px",
    "6.4px",
    "8px",
    "11.2px",
    "14.4px",
    "17.6px",
    "6.4px",
    "8px",
    "8px",
    "8px",
    "11.2px",
  ]);
});

it("scales a role from its own knob, set on any ancestor", () => {
  const style = "--control-radius: 10px; --surface-radius: 0px; --item-radius: 20px";
  expect(
    computedRadii(
      [
        "rounded-control-xs",
        "rounded-control-md",
        "rounded-control-xl",
        "rounded-surface-lg",
        "rounded-item-md",
        "rounded-item-xl",
        "rounded-lg",
      ],
      style,
    ),
  ).toEqual(["8px", "10px", "14px", "0px", "20px", "28px", "8px"]);
});

it("follows a base set on an ancestor through every role", () => {
  expect(computedRadii(["rounded-control-md", "rounded-surface-md", "rounded-item-xs"], "--radius: 10px")).toEqual([
    "10px",
    "14px",
    "8px",
  ]);
});

it("squares every role when the base is zero", () => {
  expect(computedRadii(roleSteps, "--radius: 0px")).toEqual(roleSteps.map(() => "0px"));
});

it("lets a later radius class win over a role or nesting class in cn()", () => {
  expect(cn("rounded-control-md", "rounded-none")).toBe("rounded-none");
  expect(cn("rounded-none", "rounded-surface-lg")).toBe("rounded-surface-lg");
  expect(cn("rounded-s-item-xs", "rounded-s-lg")).toBe("rounded-s-lg");
  expect(cn("rounded-outset-(--menu-item-radius)/(--menu-pad)", "rounded-full")).toBe("rounded-full");
  expect(cn("rounded-lg", "rounded-inset-control-md/1.5")).toBe("rounded-inset-control-md/1.5");
  expect(cn("rounded-inset-control-md/1.5", "rounded-outset-item-md/1")).toBe("rounded-outset-item-md/1");
  expect(cn("rounded-control-md", "rounded-t-none")).toBe("rounded-control-md rounded-t-none");
});

it("keeps an inset corner concentric and never below half the outer radius", () => {
  expect(
    computedRadii([
      "rounded-inset-[16px]/1",
      "rounded-inset-[4px]/1.5",
      "rounded-inset-[8px]/[6px]",
      "rounded-inset-[0px]/2",
      "rounded-inset-control-md/1.5",
    ]),
  ).toEqual(["12px", "2px", "4px", "0px", "4px"]);
});

it("grows an outset corner by the inset and keeps a square inside square", () => {
  expect(
    computedRadii([
      "rounded-outset-[8px]/1",
      "rounded-outset-[1px]/1",
      "rounded-outset-[0px]/1",
      "rounded-outset-item-md/[5px]",
    ]),
  ).toEqual(["12px", "4px", "0px", "13px"]);
});

it("keeps the steppers and the tag chips round at a small base radius", async () => {
  const { InputNumber, InputNumberDecrement, InputNumberIncrement, InputNumberInput } =
    await import("@/ui/input-number");
  const { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemText } = await import("@/ui/tags-input");
  const wrapper = mount(
    {
      render: () =>
        h("div", { style: "--radius: 4px" }, [
          h(InputNumber, { modelValue: 1 }, () => [
            h(InputNumberDecrement, { "data-case": "stepper" }),
            h(InputNumberInput, { "aria-label": "Quantity" }),
            h(InputNumberIncrement),
          ]),
          h(TagsInput, { modelValue: ["a"] }, () => [
            h(TagsInputItem, { value: "a", "data-case": "chip" }, () => h(TagsInputItemText)),
            h(TagsInputInput, { "aria-label": "Tags" }),
          ]),
        ]),
    },
    { attachTo: document.body },
  );
  expect(radiusOf(document.querySelector("[data-case=stepper]")!)).toBe("2px");
  expect(radiusOf(document.querySelector("[data-case=chip]")!)).not.toBe("0px");
  wrapper.unmount();
});

it("rounds the date trigger from the frame, or from the md control step outside one", () => {
  const trigger = "rounded-inset-[var(--frame-radius,--theme(--radius-control-md))]/1";
  expect(computedRadii([trigger])).toEqual(["4px"]);
  expect(computedRadii([trigger], "--radius: 4px")).toEqual(["2px"]);
  expect(computedRadii([trigger], "--frame-radius: 12px")).toEqual(["8px"]);
});
