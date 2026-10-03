import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { defineComponent, h, nextTick, ref } from "vue";

import { Button } from "@/ui/button";
import { Menu, MenuItem, MenuTrigger } from "@/ui/menu";

const settle = () => new Promise((resolve) => setTimeout(resolve, 250));
const menus = () => document.querySelectorAll<HTMLElement>("[data-slot=menu]");
const menu = () => menus()[menus().length - 1] ?? null;

const clickAt = async (x: number, y: number, button: "left" | "right" = "left") => {
  await userEvent.click(document.body, { position: { x, y }, button, force: true } as never);
  await settle();
};

const centre = (element: Element) => {
  const box = element.getBoundingClientRect();
  return [box.left + box.width / 2, box.top + box.height / 2] as const;
};

afterEach(() => {
  document.body.innerHTML = "";
});

const items = (label = "Item") => [h(MenuItem, () => `${label} one`), h(MenuItem, () => `${label} two`)];

describe("Menu", () => {
  it("attaches to the element it is placed in and opens 4px below its start edge", async () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h("button", { style: "position:fixed;left:40px;top:40px;width:120px;height:32px" }, [
            "Open",
            h(Menu, () => items()),
          ]),
      }),
      { attachTo: document.body },
    );
    const button = wrapper.get("button").element;

    expect(button.getAttribute("aria-haspopup")).toBe("menu");
    expect(button.dataset.state).toBe("closed");
    await clickAt(...centre(button));
    const panel = menu();
    const buttonBox = button.getBoundingClientRect();

    expect(panel?.getAttribute("role")).toBe("menu");
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(button.dataset.state).toBe("open");
    expect(Math.round(panel!.getBoundingClientRect().top)).toBe(Math.round(buttonBox.bottom) + 4);
    expect(Math.round(panel!.getBoundingClientRect().left)).toBe(Math.round(buttonBox.left));

    await userEvent.keyboard("{Escape}");
    await expect.poll(() => menu()).toBeNull();
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.dataset.state).toBe("closed");
    wrapper.unmount();
  });

  it("opens as a context menu at the pointer and keeps the browser's menu away", async () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h("div", { style: "position:fixed;left:20px;top:20px;width:240px;height:120px" }, [
            "Area",
            h(Menu, { contextMenu: true }, () => items()),
          ]),
      }),
      { attachTo: document.body },
    );
    const area = wrapper.get("div").element;
    let prevented = false;
    area.addEventListener("contextmenu", (event) => (prevented = event.defaultPrevented));

    await clickAt(20, 20, "left");
    expect(menu()).toBeNull();

    await clickAt(100, 70, "right");
    const box = menu()!.getBoundingClientRect();
    expect(Math.round(box.left)).toBe(100);
    expect(Math.round(box.top)).toBe(70);
    expect(prevented).toBe(true);
    wrapper.unmount();
  });

  it("serves a click menu and a context menu on one element", async () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h("div", { style: "position:fixed;left:20px;top:20px;width:240px;height:120px" }, [
            h(Menu, () => items("Click")),
            h(Menu, { contextMenu: true }, () => items("Context")),
          ]),
      }),
      { attachTo: document.body },
    );

    const target = wrapper.element as HTMLElement;
    await clickAt(100, 60);
    expect(menus()).toHaveLength(1);
    expect(menu()!.textContent).toContain("Click one");
    expect(target.dataset.state).toBe("open");
    await userEvent.keyboard("{Escape}");
    await settle();
    expect(target.dataset.state).toBe("closed");

    await clickAt(100, 60, "right");
    expect(menus()).toHaveLength(1);
    expect(menu()!.textContent).toContain("Context one");
    expect(target.dataset.state).toBe("open");
    wrapper.unmount();
  });

  it("opens only the innermost menu when targets are nested", async () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h("div", { style: "position:fixed;left:20px;top:20px;width:300px;height:120px" }, [
            h(Menu, () => items("Outer")),
            h("button", { style: "margin:40px" }, ["Inner", h(Menu, () => items("Inner"))]),
          ]),
      }),
      { attachTo: document.body },
    );

    await clickAt(...centre(wrapper.get("button").element));
    expect(menus()).toHaveLength(1);
    expect(menu()!.textContent).toContain("Inner one");
    wrapper.unmount();
  });

  it("attaches to a target given by selector, or to none and opens from code", async () => {
    const menuRef = ref<InstanceType<typeof Menu>>();
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h("div", [
            h("button", { id: "elsewhere", style: "position:fixed;left:240px;top:20px" }, "Elsewhere"),
            h("span", { style: "position:fixed;left:20px;top:200px" }, [
              "Here",
              h(Menu, { target: "#elsewhere" }, () => items("Selector")),
              h(Menu, { target: false, ref: menuRef }, () => items("Code")),
            ]),
          ]),
      }),
      { attachTo: document.body },
    );

    await clickAt(...centre(document.getElementById("elsewhere")!));
    expect(menu()!.textContent).toContain("Selector one");
    await userEvent.keyboard("{Escape}");
    await settle();

    menuRef.value!.show();
    await nextTick();
    await settle();
    expect(menu()!.textContent).toContain("Code one");
    wrapper.unmount();
  });

  it("stays open when persistent and closes on any click with auto-close", async () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h("div", [
            h("button", { id: "persistent", style: "position:fixed;left:20px;top:20px" }, [
              "Persistent",
              h(Menu, { persistent: true }, () => items("Kept")),
            ]),
            h("button", { id: "auto", style: "position:fixed;left:220px;top:20px" }, [
              "Auto",
              h(Menu, { autoClose: true }, () => h("p", { id: "note" }, "Just text")),
            ]),
          ]),
      }),
      { attachTo: document.body },
    );

    await clickAt(...centre(document.getElementById("persistent")!));
    expect(menu()?.textContent).toContain("Kept one");
    await userEvent.keyboard("{Escape}");
    await settle();
    expect(menu()?.textContent).toContain("Kept one");
    await clickAt(600, 500);
    expect(menu()?.textContent).toContain("Kept one");
    await userEvent.click(menu()!.querySelector("[role=menuitem]")!);
    await expect.poll(() => menu()).toBeNull();

    await clickAt(...centre(document.getElementById("auto")!));
    await userEvent.click(document.getElementById("note")!);
    await expect.poll(() => menu()).toBeNull();
    wrapper.unmount();
  });

  it("opens another target's non-modal menu with one click", async () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h("div", [
            h("button", { "data-test": "a", style: "position:fixed;left:40px;top:40px;width:80px;height:32px" }, [
              "A",
              h(Menu, { modal: false }, () => items("A")),
            ]),
            h("button", { "data-test": "b", style: "position:fixed;left:240px;top:40px;width:80px;height:32px" }, [
              "B",
              h(Menu, { modal: false }, () => items("B")),
            ]),
          ]),
      }),
      { attachTo: document.body },
    );
    const a = wrapper.get("[data-test=a]").element;
    const b = wrapper.get("[data-test=b]").element;

    await clickAt(...centre(a));
    expect(a.getAttribute("aria-expanded")).toBe("true");

    await clickAt(...centre(b));
    await settle();
    expect(a.getAttribute("aria-expanded")).toBe("false");
    expect(b.getAttribute("aria-expanded")).toBe("true");
    expect(menu()?.textContent).toContain("B one");
    wrapper.unmount();
  });

  it("fits and covers its target", async () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h("div", [
            h("button", { id: "fit", style: "position:fixed;left:20px;top:20px;width:320px;height:40px" }, [
              "Fit",
              h(Menu, { fit: true }, () => items()),
            ]),
            h("button", { id: "cover", style: "position:fixed;left:20px;top:300px;width:60px;height:40px" }, [
              "Cover",
              h(Menu, { cover: true }, () => items()),
            ]),
          ]),
      }),
      { attachTo: document.body },
    );

    await clickAt(...centre(document.getElementById("fit")!));
    expect(Math.round(menu()!.getBoundingClientRect().width)).toBe(320);
    await userEvent.keyboard("{Escape}");
    await settle();

    const cover = document.getElementById("cover")!;
    await clickAt(...centre(cover));
    const [menuX, menuY] = centre(menu()!);
    const [coverX, coverY] = centre(cover);
    expect(Math.abs(menuX - coverX)).toBeLessThan(1);
    expect(Math.abs(menuY - coverY)).toBeLessThan(1);
    wrapper.unmount();
  });

  it("keeps a tooltip's long press off a context menu's target while it is attached", async () => {
    const contextMenu = ref(true);
    const shown = ref(true);
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h("div", [
            "Area",
            shown.value ? h(Menu, { contextMenu: contextMenu.value }, () => h(MenuItem, () => "Copy")) : null,
          ]),
      }),
      { attachTo: document.body },
    );
    const area = wrapper.get("div").element;
    await nextTick();
    expect(area.hasAttribute("data-kappa-longpress")).toBe(true);

    contextMenu.value = false;
    await nextTick();
    expect(area.hasAttribute("data-kappa-longpress")).toBe(false);

    contextMenu.value = true;
    await nextTick();
    shown.value = false;
    await nextTick();
    expect(area.hasAttribute("data-kappa-longpress")).toBe(false);
    wrapper.unmount();
  });

  it("leaves an author's data-kappa-longpress in place", async () => {
    const shown = ref(true);
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h("div", { "data-kappa-longpress": "" }, [
            "Area",
            shown.value ? h(Menu, { contextMenu: true }, () => h(MenuItem, () => "Copy")) : null,
          ]),
      }),
      { attachTo: document.body },
    );
    shown.value = false;
    await nextTick();
    expect(wrapper.get("div").element.hasAttribute("data-kappa-longpress")).toBe(true);
    wrapper.unmount();
  });
});

describe("MenuTrigger", () => {
  it("opens from a sibling trigger and leaves the parent alone", async () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h("div", { style: "position:fixed;left:40px;top:40px;padding:20px" }, [
            h(MenuTrigger, () => "Open"),
            h(Menu, () => items()),
          ]),
      }),
      { attachTo: document.body },
    );
    const parent = wrapper.get("div").element;
    const trigger = wrapper.get("button").element;
    expect(trigger.dataset.slot).toBe("menu-trigger");
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.dataset.state).toBe("closed");
    expect(parent.hasAttribute("data-state")).toBe(false);
    await clickAt(...centre(trigger));
    expect(menu()?.getAttribute("role")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.dataset.state).toBe("open");
    expect(Math.abs(menu()!.getBoundingClientRect().left - trigger.getBoundingClientRect().left)).toBeLessThan(2);
    wrapper.unmount();
  });

  it("merges into its child with as-child", async () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h("div", { style: "position:fixed;left:40px;top:40px" }, [
            h(MenuTrigger, { asChild: true }, () => h(Button, () => "Open")),
            h(Menu, () => items()),
          ]),
      }),
      { attachTo: document.body },
    );
    const button = wrapper.get("button").element;
    expect(button.dataset.slot).toBe("menu-trigger");
    expect(button.textContent?.trim()).toBe("Open");
    expect(document.querySelectorAll("button")).toHaveLength(1);
    await clickAt(...centre(button));
    expect(menu()).not.toBeNull();
    expect(button.getAttribute("aria-expanded")).toBe("true");
    await nextTick();
    wrapper.unmount();
  });
});
