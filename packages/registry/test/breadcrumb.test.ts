import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { h } from "vue";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/ui/breadcrumb";

const render = () =>
  mount(
    {
      render: () =>
        h(Breadcrumb, () =>
          h(BreadcrumbList, () => [
            h(BreadcrumbItem, () => h(BreadcrumbLink, { href: "/" }, () => "Home")),
            h(BreadcrumbSeparator),
            h(BreadcrumbItem, () => h(BreadcrumbEllipsis)),
            h(BreadcrumbSeparator),
            h(BreadcrumbItem, () => h(BreadcrumbLink, { asChild: true }, () => h("a", { href: "/docs" }, "Docs"))),
            h(BreadcrumbSeparator),
            h(BreadcrumbItem, () => h(BreadcrumbPage, () => "Breadcrumb")),
          ]),
        ),
    },
    { attachTo: document.body },
  );

describe("Breadcrumb", () => {
  it("is a labelled nav around an ordered list", () => {
    const wrapper = render();
    const nav = wrapper.get("[data-slot=breadcrumb]").element;
    expect(nav.tagName).toBe("NAV");
    expect(nav.getAttribute("aria-label")).toBe("breadcrumb");
    expect(wrapper.get("[data-slot=breadcrumb-list]").element.tagName).toBe("OL");
    expect(wrapper.findAll("[data-slot=breadcrumb-item]").map((item) => item.element.tagName)).toEqual([
      "LI",
      "LI",
      "LI",
      "LI",
    ]);
  });

  it("renders links as anchors, also through as-child", () => {
    const links = render().findAll("[data-slot=breadcrumb-link]");
    expect(links.map((link) => [link.element.tagName, link.attributes("href")])).toEqual([
      ["A", "/"],
      ["A", "/docs"],
    ]);
  });

  it("marks the current page and draws it in the foreground colour", () => {
    const wrapper = render();
    const page = wrapper.get("[data-slot=breadcrumb-page]");
    expect(page.attributes()).toMatchObject({ role: "link", "aria-disabled": "true", "aria-current": "page" });
    const list = getComputedStyle(wrapper.get("[data-slot=breadcrumb-list]").element);
    expect(getComputedStyle(page.element).color).not.toBe(list.color);
    expect(list.fontSize).toBe("14px");
  });

  it("hides separators and the ellipsis from assistive tech", () => {
    const wrapper = render();
    const separators = wrapper
      .findAll("[data-slot=breadcrumb-separator]")
      .map((separator) => [
        separator.element.tagName,
        separator.attributes("role"),
        separator.attributes("aria-hidden"),
        separator.get("svg").element.getBoundingClientRect().width,
      ]);
    expect(separators).toEqual(Array(3).fill(["LI", "presentation", "true", 14]));
    const ellipsis = wrapper.get("[data-slot=breadcrumb-ellipsis]");
    expect(ellipsis.attributes()).toMatchObject({ role: "presentation", "aria-hidden": "true" });
    expect(ellipsis.text()).toBe("More");
    expect(ellipsis.element.getBoundingClientRect().width).toBe(36);
  });
});
