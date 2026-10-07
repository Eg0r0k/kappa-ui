import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { nextTick } from "vue";

import TreeContextMenu from "@/examples/tree/TreeContextMenu.vue";
import TreeField from "@/examples/tree/TreeField.vue";
import TreeFilter from "@/examples/tree/TreeFilter.vue";
import TreeLazy from "@/examples/tree/TreeLazy.vue";

const labels = (root: Element) =>
  [...root.querySelectorAll("[role=treeitem] [data-slot=tree-item-label]")].map((label) => label.textContent?.trim());
const row = (root: Element, label: string) =>
  [...root.querySelectorAll<HTMLElement>("[role=treeitem]")].find(
    (item) => item.querySelector("[data-slot=tree-item-label]")?.textContent?.trim() === label,
  )!;
const menuItem = (text: string) =>
  [...document.querySelectorAll<HTMLElement>("[data-slot=menu] [role=menuitem]")].find((item) =>
    item.textContent?.includes(text),
  );

afterEach(() => {
  vi.useRealTimers();
});

describe("Tree examples", () => {
  it("validates the field on submit and stores the checked leaves as keys", async () => {
    const wrapper = mount(TreeField, { attachTo: document.body });
    const tree = wrapper.get("[role=tree]");

    await wrapper.get("form").trigger("submit");
    await expect.poll(() => tree.attributes("aria-invalid")).toBe("true");
    expect(tree.attributes("aria-required")).toBe("true");
    expect(wrapper.get("[data-slot=field-error]").text()).toBe("Grant at least one permission.");

    await userEvent.click(row(wrapper.element, "Content").querySelector("[data-slot=tree-item-checkbox]")!);
    await wrapper.get("form").trigger("submit");
    await expect.poll(() => wrapper.text()).toContain("Saved: content.read, content.publish");
    expect(tree.attributes("aria-invalid")).toBeUndefined();
  });

  it("finds the row a context menu opened on and deletes it", async () => {
    const wrapper = mount(TreeContextMenu, { attachTo: document.body });

    await userEvent.click(row(wrapper.element, "Roadmap"), { button: "right" });
    await expect
      .poll(() => document.querySelector("[data-slot=menu] [data-slot=menu-label]")?.textContent)
      .toBe("Roadmap");

    await userEvent.click(menuItem("Delete")!);
    await expect.poll(() => labels(wrapper.element)).not.toContain("Roadmap");
    expect(labels(wrapper.element)).toContain("Inbox");
  });

  it("renames a row in place from the context menu", async () => {
    const wrapper = mount(TreeContextMenu, { attachTo: document.body });

    await userEvent.click(row(wrapper.element, "Inbox"), { button: "right" });
    await expect.poll(() => menuItem("Rename")).toBeDefined();
    await userEvent.click(menuItem("Rename")!);
    await expect
      .poll(
        () =>
          wrapper.element.contains(document.activeElement) && document.activeElement?.matches("input[aria-label=Name]"),
      )
      .toBe(true);

    await userEvent.keyboard("Later{Enter}");
    await expect.poll(() => labels(wrapper.element)).toContain("Later");
    await expect.poll(() => document.activeElement).toBe(row(wrapper.element, "Later"));
  });

  it("filters, keeping the ancestors of matches and opening them", async () => {
    const wrapper = mount(TreeFilter, { attachTo: document.body });

    await wrapper.get("input").setValue("os");
    expect(labels(wrapper.element)).toEqual(["Asia", "Japan", "Osaka"]);
    await wrapper.get("input").setValue("");
    expect(labels(wrapper.element)).toEqual(["Europe", "Portugal", "Germany", "Asia"]);
  });

  it("loads a folder's children when it opens, busy meanwhile", async () => {
    const wrapper = mount(TreeLazy, { attachTo: document.body });
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });

    row(wrapper.element, "site").focus();
    await userEvent.keyboard("{ArrowRight}");
    await vi.advanceTimersByTimeAsync(799);
    expect(row(wrapper.element, "site").getAttribute("aria-busy")).toBe("true");
    expect(labels(wrapper.element)).not.toContain("index.html");

    await vi.advanceTimersByTimeAsync(1);
    await nextTick();
    expect(labels(wrapper.element)).toContain("index.html");
    expect(row(wrapper.element, "site").getAttribute("aria-busy")).toBeNull();
    expect(row(wrapper.element, "assets").getAttribute("aria-expanded")).toBe("false");
  });
});
