import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { type VNodeChild, defineComponent, h, nextTick, ref } from "vue";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/ui/navigation-menu";

import { controlSizes, overrideControlTokens, px, sentinel } from "./control-tokens";

const settle = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));
const frames = async () => {
  await nextTick();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
};

let unmount: (() => void) | undefined;

afterEach(() => {
  unmount?.();
  unmount = undefined;
  document.body.innerHTML = "";
});

type Entry =
  { value?: string; label: string; links?: string[]; panel?: () => VNodeChild } | { href: string; label: string };

const defaultEntries: Entry[] = [
  { value: "learn", label: "Learn", links: ["Introduction", "Installation", "Theming"] },
  { value: "components", label: "Components", links: ["Button", "Menu"] },
  { href: "#docs", label: "Docs" },
];

const renderMenu = (
  root: Record<string, unknown> = {},
  entries: Entry[] = defaultEntries,
  options: { indicator?: boolean; before?: () => VNodeChild } = {},
) => {
  const model = ref<string>((root.modelValue as string | undefined) ?? "");
  const updates: string[] = [];
  const controlled = "modelValue" in root;
  const wrapper = mount(
    defineComponent({
      setup: () => () => [
        options.before?.(),
        h(
          NavigationMenu,
          {
            "aria-label": "Main",
            ...root,
            ...(controlled
              ? {
                  modelValue: model.value,
                  "onUpdate:modelValue": (value: string) => {
                    updates.push(value);
                    model.value = value;
                  },
                }
              : { "onUpdate:modelValue": (value: string) => updates.push(value) }),
          },
          () =>
            h(NavigationMenuList, { class: "custom-list" }, () => [
              ...entries.map((entry) =>
                "href" in entry
                  ? h(NavigationMenuItem, () =>
                      h(
                        NavigationMenuLink,
                        { href: entry.href, onClick: (e: Event) => e.preventDefault() },
                        () => entry.label,
                      ),
                    )
                  : h(NavigationMenuItem, { value: entry.value }, () => [
                      h(NavigationMenuTrigger, () => entry.label),
                      h(NavigationMenuContent, () =>
                        entry.panel
                          ? entry.panel()
                          : h(
                              "ul",
                              { class: "grid w-64 gap-1" },
                              (entry.links ?? []).map((link) =>
                                h(
                                  "li",
                                  h(
                                    NavigationMenuLink,
                                    { href: `#${link}`, onClick: (e: Event) => e.preventDefault() },
                                    () => link,
                                  ),
                                ),
                              ),
                            ),
                      ),
                    ]),
              ),
              options.indicator ? h(NavigationMenuIndicator) : null,
            ]),
        ),
      ],
    }),
    { attachTo: document.body },
  );
  unmount = () => wrapper.unmount();
  return { wrapper, model, updates };
};

const q = <T extends HTMLElement = HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const all = (selector: string) => [...document.querySelectorAll<HTMLElement>(selector)];
const triggers = () => all("[data-slot=navigation-menu-trigger]");
const topLinks = () => all("[data-slot=navigation-menu-item] > [data-slot=navigation-menu-link]");
const openContent = () => q("[data-slot=navigation-menu-content][data-state=open]");
// A click first moves the pointer, which opens the panel on hover after the delay; Reka then ignores the click.
const clickOpen = async (element: HTMLElement) => {
  await userEvent.click(element);
  await settle(350);
};
const away = () => h("div", { class: "away", style: "position: fixed; right: 0; bottom: 0; width: 8px; height: 8px" });
const near = (a: number, b: number, tolerance = 1) => Math.abs(a - b) <= tolerance;

describe("structure", () => {
  it("renders a labelled nav with a slot on every part", async () => {
    renderMenu({}, defaultEntries, { indicator: true });
    const nav = q("[data-slot=navigation-menu]");
    expect(nav.tagName).toBe("NAV");
    expect(nav.getAttribute("aria-label")).toBe("Main");
    expect(nav.dataset.size).toBe("md");
    expect(nav.dataset.variant).toBe("ghost");
    expect(nav.dataset.viewport).toBe("true");
    expect(nav.dataset.orientation).toBe("horizontal");

    const list = q("[data-slot=navigation-menu-list]");
    expect(list.tagName).toBe("UL");
    expect(list.classList.contains("custom-list")).toBe(true);
    expect(all("[data-slot=navigation-menu-item]").every((item) => item.tagName === "LI")).toBe(true);
    expect(triggers()).toHaveLength(2);
    expect(triggers()[0]!.tagName).toBe("BUTTON");
    expect(triggers()[0]!.querySelector("svg")!.getAttribute("aria-hidden")).toBe("true");

    await clickOpen(triggers()[0]!);
    expect(q("[data-slot=navigation-menu-viewport]")).not.toBeNull();
    expect(q("[data-slot=navigation-menu-content]")).not.toBeNull();
    expect(q("[data-slot=navigation-menu-indicator]")).not.toBeNull();
  });

  it("keeps items static so the indicator can measure from the list", () => {
    renderMenu();
    expect(getComputedStyle(all("[data-slot=navigation-menu-item]")[0]!).position).toBe("static");
    unmount?.();
    renderMenu({ viewport: false });
    expect(getComputedStyle(all("[data-slot=navigation-menu-item]")[0]!).position).toBe("relative");
  });
});

describe("open and close", () => {
  it("toggles a panel from the keyboard and returns focus on Escape", async () => {
    const { updates } = renderMenu();
    triggers()[0]!.focus();
    await userEvent.keyboard("{Enter}");
    await frames();
    const trigger = triggers()[0]!;
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const content = openContent();
    expect(trigger.getAttribute("aria-controls")).toBe(content.id);
    expect(content.getAttribute("aria-labelledby")).toBe(trigger.id);
    expect(updates.at(-1)).toBe("learn");

    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement?.textContent).toBe("Introduction");

    await userEvent.keyboard("{Escape}");
    await frames();
    expect(updates.at(-1)).toBe("");
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    await userEvent.keyboard(" ");
    await frames();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    await userEvent.keyboard(" ");
    await frames();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("tabs from an open trigger into its panel and on to the next trigger", async () => {
    renderMenu();
    triggers()[0]!.focus();
    await userEvent.keyboard("{Enter}");
    await frames();
    await userEvent.tab();
    expect(document.activeElement?.textContent).toBe("Introduction");
    await userEvent.tab();
    await userEvent.tab();
    expect(document.activeElement?.textContent).toBe("Theming");
    await userEvent.tab();
    expect(document.activeElement).toBe(triggers()[1]);
  });

  it("opens the default value on mount and emits raw values", async () => {
    renderMenu({ defaultValue: "components" });
    await frames();
    expect(triggers()[1]!.getAttribute("aria-expanded")).toBe("true");
    expect(openContent().textContent).toContain("Button");
  });

  it("follows v-model both ways", async () => {
    const { model } = renderMenu({ modelValue: "" });
    model.value = "components";
    await frames();
    expect(triggers()[1]!.getAttribute("aria-expanded")).toBe("true");
    await userEvent.click(triggers()[0]!);
    expect(model.value).toBe("learn");
    model.value = "";
    await frames();
    expect(triggers()[0]!.getAttribute("aria-expanded")).toBe("false");
  });

  it("closes the open panel when a top-level link is clicked (reka-ui#2383)", async () => {
    const { updates } = renderMenu();
    await clickOpen(triggers()[0]!);
    expect(updates.at(-1)).toBe("learn");
    await userEvent.click(topLinks()[0]!);
    expect(updates.at(-1)).toBe("");
  });

  it("closes on a panel link click unless select is prevented", async () => {
    const prevented = ref(false);
    const { updates } = renderMenu({}, [
      {
        value: "learn",
        label: "Learn",
        panel: () => [
          h(
            NavigationMenuLink,
            { href: "#a", class: "closes", onClick: (e: Event) => e.preventDefault() },
            () => "Closes",
          ),
          h(
            NavigationMenuLink,
            {
              href: "#b",
              class: "stays",
              onClick: (e: Event) => e.preventDefault(),
              onSelect: (e: Event) => {
                prevented.value = true;
                e.preventDefault();
              },
            },
            () => "Stays",
          ),
        ],
      },
    ]);
    await clickOpen(triggers()[0]!);
    await userEvent.click(q(".stays"));
    expect(prevented.value).toBe(true);
    expect(updates.at(-1)).toBe("learn");
    await userEvent.click(q(".closes"));
    expect(updates.at(-1)).toBe("");
  });

  it("marks the current page and blocks a disabled link", async () => {
    let clicks = 0;
    const { updates } = renderMenu({}, [
      {
        value: "learn",
        label: "Learn",
        panel: () => [
          h(NavigationMenuLink, { href: "#a", active: true, class: "current" }, () => "Current"),
          h(NavigationMenuLink, { href: "#b", disabled: true, class: "off", onClick: () => clicks++ }, () => "Off"),
        ],
      },
    ]);
    await clickOpen(triggers()[0]!);
    const current = q(".current");
    expect(current.getAttribute("aria-current")).toBe("page");
    expect(current.hasAttribute("data-active")).toBe(true);
    const off = q(".off");
    expect(off.getAttribute("aria-disabled")).toBe("true");
    await userEvent.click(off, { force: true });
    off.focus();
    await userEvent.keyboard("{Enter}");
    expect(clicks).toBe(0);
    expect(location.hash).not.toBe("#b");
    expect(updates.at(-1)).toBe("learn");
  });

  it("keeps closed panels in the DOM, and a click inside the open one keeps it open (reka-ui#2608)", async () => {
    const { updates } = renderMenu({ unmountOnHide: false }, [
      { value: "learn", label: "Learn", panel: () => h("p", { class: "inside" }, "Inside learn") },
      { value: "components", label: "Components", panel: () => h("p", "Inside components") },
    ]);
    await clickOpen(triggers()[0]!);
    const contents = all("[data-slot=navigation-menu-content]");
    expect(contents).toHaveLength(2);
    expect(contents.find((c) => c.textContent === "Inside components")!.hidden).toBe(true);
    await userEvent.click(q(".inside"));
    expect(updates.at(-1)).toBe("learn");
    expect(openContent().textContent).toBe("Inside learn");
  });
});

describe("value encoding (Reka matches values by substring)", () => {
  it("opens the right trigger for values that contain each other", async () => {
    await page.viewport(1200, 800);
    const entries: Entry[] = ["docs-api", "docs", "menu", "a"].map((value) => ({
      value,
      label: value.toUpperCase(),
      panel: () => h("p", { class: "w-40" }, `Panel ${value}`),
    }));
    const { model, updates } = renderMenu({ modelValue: "" }, entries, { indicator: true, before: away });
    // Keep the pointer off the menu, so a panel opening under it doesn't count as a hover.
    await userEvent.hover(q(".away"));
    for (const [index, value] of ["docs-api", "docs", "menu", "a"].entries()) {
      model.value = value;
      await settle(300);
      expect(openContent().textContent).toBe(`Panel ${value}`);
      const indicator = q("[data-slot=navigation-menu-indicator]");
      expect(indicator.style.getPropertyValue("--reka-navigation-menu-indicator-position")).toBe(
        `${triggers()[index]!.offsetLeft}px`,
      );
    }
    // Hovering another trigger while a panel is open switches to it at once.
    await userEvent.hover(triggers()[1]!);
    expect(updates.at(-1)).toBe("docs");
  });

  it("gives items without a value their own id", async () => {
    const { updates } = renderMenu({}, [
      { label: "One", panel: () => h("p", "Panel one") },
      { label: "Two", panel: () => h("p", "Panel two") },
    ]);
    await clickOpen(triggers()[1]!);
    expect(openContent().textContent).toBe("Panel two");
    expect(updates.at(-1)).not.toBe("");
    expect(triggers()[1]!.id).not.toMatch(/\s/);
  });
});

describe("keyboard between top-level items", () => {
  it("moves with arrows without wrapping, and with Home and End", async () => {
    renderMenu();
    const items = [...triggers(), ...topLinks()];
    items[0]!.focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(items[0]);
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(items[1]);
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(items[2]);
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(items[2]);
    await userEvent.keyboard("{Home}");
    expect(document.activeElement).toBe(items[0]);
  });

  it("mirrors ArrowLeft and ArrowRight in right-to-left text", async () => {
    renderMenu({ dir: "rtl" });
    const items = [...triggers(), ...topLinks()];
    expect(items[1]!.getBoundingClientRect().left).toBeLessThan(items[0]!.getBoundingClientRect().left);
    items[0]!.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(items[0]);
    await userEvent.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(items[1]);
    await userEvent.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(items[2]);
    await userEvent.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(items[2]);
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(items[1]);
  });

  it("moves with up and down in a vertical list and enters the panel with ArrowRight", async () => {
    renderMenu({ orientation: "vertical" });
    triggers()[0]!.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(triggers()[1]);
    await userEvent.keyboard("{Enter}");
    await frames();
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement?.textContent).toBe("Button");
  });
});

describe("without a viewport", () => {
  it("keeps Space for inputs and buttons inside the panel", async () => {
    let clicks = 0;
    renderMenu({ viewport: false }, [
      {
        value: "search",
        label: "Search",
        panel: () =>
          h("div", { class: "flex gap-2" }, [
            h("input", { class: "query", "aria-label": "Query" }),
            h("button", { type: "button", class: "go", onClick: () => clicks++ }, "Go"),
          ]),
      },
    ]);
    const trigger = triggers()[0]!;
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await frames();
    const content = openContent();
    expect(content.closest("[data-slot=navigation-menu-item]")).not.toBeNull();

    await userEvent.click(q(".query"));
    await userEvent.keyboard("x y");
    expect(q<HTMLInputElement>(".query").value).toBe("x y");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    q(".go").focus();
    await userEvent.keyboard(" ");
    expect(clicks).toBe(1);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    trigger.focus();
    await userEvent.keyboard(" ");
    await frames();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("submits a form in a panel natively and closes through v-model", async () => {
    const submitted: string[] = [];
    const { model } = renderMenu({ modelValue: "", viewport: false }, [
      {
        value: "search",
        label: "Search",
        panel: () =>
          h(
            "form",
            {
              onSubmit: (event: SubmitEvent) => {
                event.preventDefault();
                submitted.push(String(new FormData(event.target as HTMLFormElement).get("q")));
                model.value = "";
              },
            },
            [
              h("input", { name: "q", class: "query", "aria-label": "Query" }),
              h("button", { type: "submit" }, "Search"),
            ],
          ),
      },
    ]);
    await clickOpen(triggers()[0]!);
    await userEvent.click(q(".query"));
    await userEvent.keyboard("dark mode{Enter}");
    expect(submitted).toEqual(["dark mode"]);
    await frames();
    expect(triggers()[0]!.getAttribute("aria-expanded")).toBe("false");
  });
});

describe("geometry", () => {
  beforeEach(async () => {
    await page.viewport(1200, 800);
  });

  const wideEntries: Entry[] = [
    { value: "one", label: "First item", panel: () => h("p", { style: "width: 300px; height: 120px" }, "One") },
    { value: "two", label: "Second item", panel: () => h("p", { style: "width: 200px; height: 80px" }, "Two") },
  ];

  const mountCentered = (root: Record<string, unknown>) =>
    renderMenu(root, wideEntries, {
      before: () => h("div", { style: "height: 1px" }),
    });

  it("sizes the viewport to the open panel", async () => {
    renderMenu({ class: "mx-auto" }, wideEntries);
    await clickOpen(triggers()[0]!);
    const viewport = q("[data-slot=navigation-menu-viewport]");
    const content = openContent();
    expect(viewport.clientHeight).toBeGreaterThan(0);
    expect(viewport.clientHeight).toBe(content.offsetHeight);
    expect(viewport.clientWidth).toBe(content.offsetWidth);

    await clickOpen(triggers()[1]!);
    expect(q("[data-slot=navigation-menu-viewport]").clientWidth).toBe(openContent().offsetWidth);
  });

  it.each([
    ["ltr", "start", "left"],
    ["ltr", "end", "right"],
    ["rtl", "start", "right"],
    ["rtl", "end", "left"],
  ] as const)("in %s, align=%s lines up the %s edges", async (dir, align, edge) => {
    mountCentered({ dir, align, class: "mx-auto" });
    document.querySelector<HTMLElement>("[data-slot=navigation-menu]")!.style.marginInline = "400px";
    const trigger = triggers()[1]!;
    await userEvent.click(trigger);
    await settle();
    const panel = q("[data-slot=navigation-menu-viewport]").getBoundingClientRect();
    const rect = trigger.getBoundingClientRect();
    expect(near(panel[edge], rect[edge], 2), `${panel[edge]} vs ${rect[edge]}`).toBe(true);
  });

  it("centres the panel under its trigger by default", async () => {
    mountCentered({});
    document.querySelector<HTMLElement>("[data-slot=navigation-menu]")!.style.marginInline = "400px";
    const trigger = triggers()[1]!;
    await userEvent.click(trigger);
    await settle();
    const panel = q("[data-slot=navigation-menu-viewport]").getBoundingClientRect();
    const rect = trigger.getBoundingClientRect();
    expect(near(panel.left + panel.width / 2, rect.left + rect.width / 2, 2)).toBe(true);
    expect(panel.top).toBeGreaterThanOrEqual(rect.bottom);
  });

  it("opens the vertical panel beside the list", async () => {
    renderMenu({ orientation: "vertical", align: "start" }, wideEntries);
    const trigger = triggers()[1]!;
    await userEvent.click(trigger);
    await settle();
    const panel = q("[data-slot=navigation-menu-viewport]").getBoundingClientRect();
    const list = q("[data-slot=navigation-menu-list]").getBoundingClientRect();
    expect(panel.left).toBeGreaterThanOrEqual(list.right);
    expect(near(panel.top, trigger.getBoundingClientRect().top, 2)).toBe(true);
    expect(openContent().dataset.orientation).toBe("vertical");
  });

  it("moves the indicator under the open trigger (nuxt/ui#3907)", async () => {
    renderMenu({}, wideEntries, { indicator: true });
    await clickOpen(triggers()[1]!);
    const indicator = q("[data-slot=navigation-menu-indicator]");
    const rect = indicator.getBoundingClientRect();
    const trigger = triggers()[1]!.getBoundingClientRect();
    expect(triggers()[1]!.offsetLeft).toBeGreaterThan(0);
    expect(near(rect.left, trigger.left)).toBe(true);
    expect(near(rect.width, trigger.width)).toBe(true);
    expect(indicator.dataset.state).toBe("visible");
  });
});

describe("hover", () => {
  it("opens on hover after the delay and switches between triggers", async () => {
    const { updates } = renderMenu({ delayDuration: 0 });
    await userEvent.hover(triggers()[0]!);
    await settle(250);
    expect(updates.at(-1)).toBe("learn");
    await userEvent.hover(triggers()[1]!);
    await settle(250);
    expect(updates.at(-1)).toBe("components");
  });

  it("slides the next panel in from the side of the trigger it belongs to", async () => {
    renderMenu({ delayDuration: 0 });
    await userEvent.hover(triggers()[0]!);
    await settle(250);
    await userEvent.hover(triggers()[1]!);
    await frames();
    const incoming = openContent();
    expect(incoming.dataset.motion).toBe("from-end");
    expect(getComputedStyle(incoming).animationName).toBe("kappa-navigation-menu-enter");
    expect(getComputedStyle(incoming).getPropertyValue("--navigation-menu-motion-x").trim()).toMatch(/^calc\(25%|^25%/);
  });

  it("stays shut on hover with disable-hover-trigger", async () => {
    const { updates } = renderMenu({ disableHoverTrigger: true, delayDuration: 0 });
    await userEvent.hover(triggers()[0]!);
    await settle(250);
    expect(updates).toEqual([]);
    await userEvent.click(triggers()[0]!);
    expect(updates.at(-1)).toBe("learn");
  });
});

describe("orientation switch", () => {
  it("remounts with the new orientation", async () => {
    const orientation = ref<"horizontal" | "vertical">("horizontal");
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(NavigationMenu, { orientation: orientation.value, defaultValue: "a" }, () =>
            h(NavigationMenuList, () =>
              h(NavigationMenuItem, { value: "a" }, () => [
                h(NavigationMenuTrigger, () => "A"),
                h(NavigationMenuContent, () => h("p", "Panel")),
              ]),
            ),
          ),
      }),
      { attachTo: document.body },
    );
    unmount = () => wrapper.unmount();
    await frames();
    expect(openContent().dataset.orientation).toBe("horizontal");
    orientation.value = "vertical";
    await frames();
    expect(q("[data-slot=navigation-menu-list]").dataset.orientation).toBe("vertical");
    await clickOpen(triggers()[0]!);
    expect(openContent().dataset.orientation).toBe("vertical");
  });
});

describe("sizes and variants", () => {
  overrideControlTokens();

  it.each(controlSizes)("%s triggers and top-level links take the control tokens", (size) => {
    renderMenu({ size });
    expect(q("[data-slot=navigation-menu]").dataset.size).toBe(size);
    for (const item of [triggers()[0]!, topLinks()[0]!]) {
      expect(item.offsetHeight).toBe(sentinel.height[size]);
      expect(px(getComputedStyle(item).paddingInlineStart)).toBe(sentinel.padding[size]);
      expect(item.querySelector("svg")?.getBoundingClientRect().width ?? sentinel.icon[size]).toBe(sentinel.icon[size]);
    }
  });

  it("styles panel links apart from top-level links", async () => {
    renderMenu();
    await clickOpen(triggers()[0]!);
    const panelLink = openContent().querySelector<HTMLElement>("[data-slot=navigation-menu-link]")!;
    expect(getComputedStyle(panelLink).flexDirection).toBe("column");
    expect(px(getComputedStyle(panelLink).minHeight)).toBe(sentinel.height.md);
    expect(getComputedStyle(topLinks()[0]!).flexDirection).toBe("row");
  });

  it("underlines the current page in the link variant", () => {
    renderMenu({ variant: "link" }, [{ href: "#docs", label: "Docs" }]);
    unmount?.();
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(NavigationMenu, { variant: "link" }, () =>
            h(NavigationMenuList, () =>
              h(NavigationMenuItem, () => h(NavigationMenuLink, { href: "#docs", active: true }, () => "Docs")),
            ),
          ),
      }),
      { attachTo: document.body },
    );
    unmount = () => wrapper.unmount();
    const link = q("[data-slot=navigation-menu-link]");
    expect(q("[data-slot=navigation-menu]").dataset.variant).toBe("link");
    expect(getComputedStyle(link).textDecorationLine).toBe("underline");
    expect(getComputedStyle(link, "::before").content).toBe("none");
  });
});
