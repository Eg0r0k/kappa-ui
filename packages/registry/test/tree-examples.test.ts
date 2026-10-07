import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import TreeContextMenu from "@/examples/tree/TreeContextMenu.vue";
import TreeField from "@/examples/tree/TreeField.vue";
import TreeFilter from "@/examples/tree/TreeFilter.vue";
import TreeLazy from "@/examples/tree/TreeLazy.vue";

const settle = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
const labels = (root: Element) =>
  [...root.querySelectorAll("[role=treeitem] [data-slot=tree-item-label]")].map((label) => label.textContent?.trim());
const row = (root: Element, label: string) =>
  [...root.querySelectorAll<HTMLElement>("[role=treeitem]")].find(
    (item) => item.querySelector("[data-slot=tree-item-label]")?.textContent?.trim() === label,
  )!;

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Tree examples", () => {
  it("validates the field on submit and stores the checked leaves as keys", async () => {
    const wrapper = mount(TreeField, { attachTo: document.body });
    const tree = wrapper.get("[role=tree]");

    await wrapper.get("form").trigger("submit");
    await settle();
    expect(tree.attributes("aria-invalid")).toBe("true");
    expect(tree.attributes("aria-required")).toBe("true");
    expect(wrapper.get("[data-slot=field-error]").text()).toBe("Grant at least one permission.");

    await userEvent.click(row(wrapper.element, "Content").querySelector("[data-slot=tree-item-checkbox]")!);
    await wrapper.get("form").trigger("submit");
    await settle();
    expect(tree.attributes("aria-invalid")).toBeUndefined();
    expect(wrapper.text()).toContain("Saved: content.read, content.publish");
    wrapper.unmount();
  });

  it("finds the row a context menu opened on and deletes it", async () => {
    const wrapper = mount(TreeContextMenu, { attachTo: document.body });
    const roadmap = row(wrapper.element, "Roadmap");

    await userEvent.click(roadmap, { button: "right" });
    await settle();
    const menu = document.querySelector("[data-slot=menu]")!;
    expect(menu.querySelector("[data-slot=menu-label]")?.textContent).toBe("Roadmap");

    await userEvent.click(
      [...menu.querySelectorAll("[role=menuitem]")].find((item) => item.textContent?.includes("Delete"))!,
    );
    await settle();
    expect(labels(wrapper.element)).not.toContain("Roadmap");
    wrapper.unmount();
  });

  it("renames a row in place from the context menu", async () => {
    const wrapper = mount(TreeContextMenu, { attachTo: document.body });

    await userEvent.click(row(wrapper.element, "Inbox"), { button: "right" });
    await settle();
    const menu = document.querySelector("[data-slot=menu]")!;
    await userEvent.click(
      [...menu.querySelectorAll("[role=menuitem]")].find((item) => item.textContent?.includes("Rename"))!,
    );
    await settle();

    const input = (wrapper.element as HTMLElement).querySelector<HTMLInputElement>("input[aria-label=Name]")!;
    expect(document.activeElement).toBe(input);
    await userEvent.keyboard("Later{Enter}");
    await settle(50);
    expect(labels(wrapper.element)).toContain("Later");
    expect(document.activeElement).toBe(row(wrapper.element, "Later"));
    wrapper.unmount();
  });

  it("filters, keeping the ancestors of matches and opening them", async () => {
    const wrapper = mount(TreeFilter, { attachTo: document.body });

    await wrapper.get("input").setValue("os");
    expect(labels(wrapper.element)).toEqual(["Asia", "Japan", "Osaka"]);
    await wrapper.get("input").setValue("");
    expect(labels(wrapper.element)).toEqual(["Europe", "Portugal", "Germany", "Asia"]);
    wrapper.unmount();
  });

  it("loads a folder's children when it opens, busy meanwhile", async () => {
    const wrapper = mount(TreeLazy, { attachTo: document.body });
    const site = row(wrapper.element, "site");

    site.focus();
    await userEvent.keyboard("{ArrowRight}");
    await settle(50);
    expect(row(wrapper.element, "site").getAttribute("aria-busy")).toBe("true");
    await expect.poll(() => labels(wrapper.element), { timeout: 3000 }).toContain("index.html");
    expect(row(wrapper.element, "site").getAttribute("aria-busy")).toBeNull();
    expect(row(wrapper.element, "assets").getAttribute("aria-expanded")).toBe("false");
    wrapper.unmount();
  });
});
