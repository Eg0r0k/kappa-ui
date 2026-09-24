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
