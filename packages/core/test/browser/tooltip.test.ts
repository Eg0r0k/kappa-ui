import { type VueWrapper, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNodeChild, defineComponent, h, nextTick, ref } from "vue";

import {
  TooltipContent,
  type TooltipOpenChangeDetails,
  TooltipProvider,
  type TooltipReason,
  TooltipRoot,
  TooltipTrigger,
} from "../../src/tooltip";

type Change = [open: boolean, reason: TooltipReason];

type Options = {
  props?: Record<string, unknown>;
  changes?: Change[];
  trigger?: Record<string, unknown>;
  text?: () => VNodeChild;
};

const mounted: VueWrapper[] = [];

afterEach(() => {
  for (const wrapper of mounted.splice(0)) wrapper.unmount();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const flush = async () => {
  await nextTick();
  await nextTick();
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mouse = (type: string, target: Element, init: PointerEventInit = {}) =>
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: type !== "pointerleave",
      cancelable: true,
      pointerType: "mouse",
      isPrimary: true,
      pointerId: 1,
      ...init,
    }),
  );

const move = (target: Element, movement = 0) => mouse("pointermove", target, { movementX: movement });
const leave = (target: Element) => mouse("pointerleave", target);

const tooltip = (name: string, { props = {}, changes, trigger = {}, text = () => name }: Options = {}) =>
  h(
    TooltipRoot,
    {
      ...props,
      "onUpdate:open": (open: boolean, details: TooltipOpenChangeDetails) => changes?.push([open, details.reason]),
    },
    () => [
      h(TooltipTrigger, { "data-test": `${name}-trigger`, ...trigger }, text),
      h(TooltipContent, { "data-test": `${name}-content` }, () => `${name} tip`),
    ],
  );

const track = (wrapper: VueWrapper) => {
  mounted.push(wrapper);
  return wrapper;
};

const render = (children: () => VNodeChild, provider: Record<string, unknown> = {}) =>
  track(
    mount(defineComponent({ setup: () => () => h(TooltipProvider, { delay: 100, ...provider }, children) }), {
      attachTo: document.body,
    }),
  );

const renderBare = (children: () => VNodeChild) =>
  track(mount(defineComponent({ setup: () => children }), { attachTo: document.body }));

const trigger = (name = "a") => document.querySelector<HTMLElement>(`[data-test=${name}-trigger]`)!;
const content = (name = "a") => document.querySelector<HTMLElement>(`[data-test=${name}-content]`);
const element = (name: string) => document.querySelector<HTMLElement>(`[data-test=${name}]`)!;

const hoverOpen = async (name = "a") => {
  move(trigger(name));
  vi.advanceTimersByTime(100);
  await flush();
  vi.advanceTimersByTime(1);
};

describe("hover", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("opens once the pointer rests for the delay, as delayed-open", async () => {
    const changes: Change[] = [];
    render(() => tooltip("a", { changes }));
    move(trigger());
    vi.advanceTimersByTime(99);
    await flush();
    expect(content()).toBeNull();
    vi.advanceTimersByTime(1);
    await flush();
    expect(content()?.dataset.state).toBe("delayed-open");
    expect(trigger().dataset.state).toBe("delayed-open");
    expect(changes).toEqual([[true, "trigger-hover"]]);
  });

  it("restarts the delay while the pointer moves and ignores jitter under the threshold", async () => {
    render(() => tooltip("a"));
    move(trigger());
    for (let step = 0; step < 5; step += 1) {
      vi.advanceTimersByTime(60);
      move(trigger(), 5);
    }
    await flush();
    expect(content()).toBeNull();
    for (let step = 0; step < 3; step += 1) {
      vi.advanceTimersByTime(30);
      move(trigger(), 1);
    }
    vi.advanceTimersByTime(10);
    await flush();
    expect(content()).not.toBeNull();
  });

  it("stays closed when the pointer passes through", async () => {
    const changes: Change[] = [];
    render(() => tooltip("a", { changes }));
    move(trigger());
    vi.advanceTimersByTime(60);
    leave(trigger());
    vi.advanceTimersByTime(200);
    await flush();
    expect(content()).toBeNull();
    expect(changes).toEqual([]);
  });

  it("opens the next tooltip at once while the group is warm, and with the delay once it cools", async () => {
    const changes: Change[] = [];
    render(() => [tooltip("a", { changes }), tooltip("b")]);
    await hoverOpen("a");
    leave(trigger("a"));
    move(trigger("b"));
    await flush();
    expect(content("b")?.dataset.state).toBe("instant-open");
    expect(changes).toEqual([
      [true, "trigger-hover"],
      [false, "trigger-hover"],
    ]);
    leave(trigger("b"));
    await flush();
    vi.advanceTimersByTime(301);
    move(trigger("a"));
    await flush();
    expect(content("a")).toBeNull();
    vi.advanceTimersByTime(100);
    await flush();
    expect(content("a")?.dataset.state).toBe("delayed-open");
  });

  it("keeps a nested provider's warm-up separate", async () => {
    render(() => [tooltip("a"), h(TooltipProvider, { delay: 100 }, () => tooltip("b"))]);
    await hoverOpen("a");
    leave(trigger("a"));
    move(trigger("b"));
    await flush();
    expect(content("b")).toBeNull();
    vi.advanceTimersByTime(100);
    await flush();
    expect(content("b")?.dataset.state).toBe("delayed-open");
  });

  it("opens on the first move with a zero delay", async () => {
    render(() => tooltip("a"), { delay: 0 });
    move(trigger());
    vi.advanceTimersByTime(0);
    await flush();
    expect(content()).not.toBeNull();
  });

  it("closes on press and stays closed until the pointer leaves and returns", async () => {
    const changes: Change[] = [];
    render(() => tooltip("a", { changes }));
    await hoverOpen();
    mouse("pointerdown", trigger(), { button: 0, buttons: 1 });
    mouse("pointerup", trigger());
    await flush();
    expect(content()).toBeNull();
    expect(changes.at(-1)).toEqual([false, "trigger-press"]);
    move(trigger(), 5);
    vi.advanceTimersByTime(200);
    await flush();
    expect(content()).toBeNull();
    leave(trigger());
    await hoverOpen();
    expect(content()).not.toBeNull();
  });

  it("stays open on press when closeOnClick is off", async () => {
    render(() => tooltip("a"), { closeOnClick: false });
    await hoverOpen();
    mouse("pointerdown", trigger(), { button: 0, buttons: 1 });
    mouse("pointerup", trigger());
    trigger().click();
    await flush();
    expect(content()).not.toBeNull();
  });

  it("ignores moves over a nested trigger", async () => {
    render(() =>
      h(TooltipRoot, null, () => [
        h(TooltipTrigger, { as: "div", "data-test": "card-trigger" }, () => tooltip("button")),
        h(TooltipContent, { "data-test": "card-content" }, () => "Card"),
      ]),
    );
    await hoverOpen("button");
    expect(content("button")).not.toBeNull();
    expect(content("card")).toBeNull();
    leave(trigger("button"));
    move(trigger("card"), 5);
    await flush();
    expect(content("card")?.dataset.state).toBe("instant-open");
    expect(content("button")).toBeNull();
  });

  it("treats a hovering pen as a mouse", async () => {
    render(() => tooltip("a"));
    mouse("pointermove", trigger(), { pointerType: "pen", buttons: 0 });
    vi.advanceTimersByTime(100);
    await flush();
    expect(content()).not.toBeNull();
  });

  it("opens on an SVG trigger", async () => {
    render(() =>
      h(TooltipRoot, null, () => [
        h(TooltipTrigger, { asChild: true }, () => h("svg", { "data-test": "a-trigger", width: 20, height: 20 })),
        h(TooltipContent, { "data-test": "a-content" }, () => "Chart"),
      ]),
    );
    await hoverOpen();
    expect(content()).not.toBeNull();
  });

  it("works without a TooltipProvider, on the default delay", async () => {
    renderBare(() => tooltip("a"));
    move(trigger());
    vi.advanceTimersByTime(599);
    await flush();
    expect(content()).toBeNull();
    vi.advanceTimersByTime(1);
    await flush();
    expect(content()).not.toBeNull();
  });

  it("stops its timers when unmounted", async () => {
    const changes: Change[] = [];
    render(() => tooltip("a", { changes }));
    move(trigger());
    mounted.pop()!.unmount();
    vi.advanceTimersByTime(200);
    await flush();
    expect(changes).toEqual([]);
  });
});

describe("state", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("opens instantly and emits nothing when v-model opens it", async () => {
    const open = ref(false);
    const changes: Change[] = [];
    render(() =>
      h(
        TooltipRoot,
        {
          open: open.value,
          "onUpdate:open": (value: boolean, details: TooltipOpenChangeDetails) => {
            open.value = value;
            changes.push([value, details.reason]);
          },
        },
        () => [
          h(TooltipTrigger, { "data-test": "a-trigger" }, () => "a"),
          h(TooltipContent, { "data-test": "a-content" }, () => "a tip"),
        ],
      ),
    );
    await hoverOpen();
    expect(content()?.dataset.state).toBe("delayed-open");
    leave(trigger());
    await flush();
    expect(content()).toBeNull();
    open.value = true;
    await flush();
    expect(content()?.dataset.state).toBe("instant-open");
    expect(changes).toEqual([
      [true, "trigger-hover"],
      [false, "trigger-hover"],
    ]);
  });

  it("closes as disabled and stays closed while disabled", async () => {
    const disabled = ref(false);
    const changes: Change[] = [];
    render(() => tooltip("a", { changes, props: { disabled: disabled.value } }));
    await hoverOpen();
    disabled.value = true;
    await flush();
    expect(content()).toBeNull();
    expect(changes.at(-1)).toEqual([false, "disabled"]);
    leave(trigger());
    await hoverOpen();
    expect(content()).toBeNull();
  });

  it("does not show a v-model open tooltip while disabled", async () => {
    render(() => tooltip("a", { props: { open: true, disabled: true } }));
    await flush();
    expect(content()).toBeNull();
  });

  it("closes as disabled when the trigger element is replaced", async () => {
    const swapped = ref(false);
    const changes: Change[] = [];
    render(() =>
      tooltip("a", {
        changes,
        trigger: { asChild: true, "data-test": undefined },
        text: () =>
          swapped.value
            ? h("a", { href: "#", "data-test": "a-trigger" }, "Link")
            : h("button", { "data-test": "a-trigger" }, "Button"),
      }),
    );
    await hoverOpen();
    swapped.value = true;
    await expect.poll(() => content()).toBeNull();
    expect(changes.at(-1)).toEqual([false, "disabled"]);
  });
});

describe("dismiss", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("closes on Escape and stays closed until the pointer leaves", async () => {
    const changes: Change[] = [];
    render(() => tooltip("a", { changes }));
    await hoverOpen();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await flush();
    expect(content()).toBeNull();
    expect(changes.at(-1)).toEqual([false, "escape-key"]);
    move(trigger(), 5);
    vi.advanceTimersByTime(200);
    await flush();
    expect(content()).toBeNull();
    leave(trigger());
    await hoverOpen();
    expect(content()).not.toBeNull();
  });

  it("keeps open on Escape during composition", async () => {
    render(() => tooltip("a"));
    await hoverOpen();
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true, isComposing: true }),
    );
    await flush();
    expect(content()).not.toBeNull();
  });

  it("closes on a press outside", async () => {
    const changes: Change[] = [];
    render(() => [h("p", { "data-test": "outside" }, "Outside"), tooltip("a", { changes })]);
    await hoverOpen();
    mouse("pointerdown", element("outside"), { button: 0, buttons: 1 });
    await flush();
    expect(content()).toBeNull();
    expect(changes.at(-1)).toEqual([false, "outside-press"]);
  });

  it("closes when an element holding the trigger scrolls, not another one", async () => {
    const changes: Change[] = [];
    render(() => [
      h("div", { "data-test": "scroller" }, [tooltip("a", { changes })]),
      h("div", { "data-test": "other" }, "Other"),
    ]);
    await hoverOpen();
    element("other").dispatchEvent(new Event("scroll"));
    await flush();
    expect(content()).not.toBeNull();
    element("scroller").dispatchEvent(new Event("scroll"));
    await flush();
    expect(content()).toBeNull();
    expect(changes.at(-1)).toEqual([false, "scroll"]);
  });

  it("closes as sibling-open, marked instant, when another tooltip opens", async () => {
    const changes: Change[] = [];
    const openB = ref(false);
    render(() => [tooltip("a", { changes }), tooltip("b", { props: { open: openB.value } })]);
    await hoverOpen("a");
    openB.value = true;
    await nextTick();
    expect(changes.at(-1)).toEqual([false, "sibling-open"]);
    expect(content("a")?.dataset.instant).toBe("sibling");
    await flush();
    expect(content("b")?.dataset.state).toBe("instant-open");
  });

  it("removes its window listeners once it has closed", async () => {
    const added = vi.spyOn(window, "addEventListener");
    const removed = vi.spyOn(window, "removeEventListener");
    render(() => tooltip("a"));
    await hoverOpen();
    leave(trigger());
    await expect.poll(() => content()).toBeNull();
    await flush();
    const ours = (spy: typeof added) =>
      spy.mock.calls
        .filter(([type]) => type === "tooltip.open" || type === "scroll")
        .map(([type, listener]) => [type, listener]);
    expect(ours(added).length).toBeGreaterThanOrEqual(2);
    for (const call of ours(added)) expect(ours(removed)).toContainEqual(call);
  });
});

describe("focus", () => {
  it("opens instantly on keyboard focus and closes when focus leaves", async () => {
    const changes: Change[] = [];
    render(() => [h("button", "Before"), tooltip("a", { changes })]);
    await userEvent.tab();
    await userEvent.tab();
    await expect.poll(() => content()?.dataset.state).toBe("instant-open");
    expect(changes).toEqual([[true, "trigger-focus"]]);
    await userEvent.tab({ shift: true });
    await expect.poll(() => content()).toBeNull();
    expect(changes.at(-1)).toEqual([false, "trigger-focus"]);
  });

  it("does not open on focus from a press or from script after a press", async () => {
    render(() => [h("p", { "data-test": "text" }, "Text"), tooltip("a")], { delay: 50 });
    await userEvent.click(trigger());
    await wait(150);
    expect(content()).toBeNull();
    await userEvent.click(element("text"));
    trigger().focus();
    await wait(150);
    expect(content()).toBeNull();
  });

  it("does not reopen when the window gives focus back", async () => {
    render(() => [h("button", "Before"), tooltip("a")]);
    await userEvent.tab();
    await userEvent.tab();
    await expect.poll(() => content()).not.toBeNull();
    trigger().dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: null }));
    await expect.poll(() => content()).toBeNull();
    trigger().dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    await wait(50);
    expect(content()).toBeNull();
    await userEvent.tab({ shift: true });
    await userEvent.tab();
    await expect.poll(() => content()).not.toBeNull();
  });

  it("stays open while focus moves inside the trigger", async () => {
    render(() =>
      h(TooltipRoot, null, () => [
        h(TooltipTrigger, { as: "div", tabindex: 0, "data-test": "a-trigger" }, () => h("button", "Inner")),
        h(TooltipContent, { "data-test": "a-content" }, () => "Group"),
      ]),
    );
    await userEvent.tab();
    await expect.poll(() => content()).not.toBeNull();
    await userEvent.tab();
    await wait(50);
    expect(content()).not.toBeNull();
  });

  it("closes when the focused trigger becomes disabled", async () => {
    const changes: Change[] = [];
    render(() => [h("button", "Before"), tooltip("a", { changes })]);
    await userEvent.tab();
    await userEvent.tab();
    await expect.poll(() => content()).not.toBeNull();
    (trigger() as HTMLButtonElement).disabled = true;
    await expect.poll(() => content()).toBeNull();
    expect(["disabled", "trigger-focus"]).toContain(changes.at(-1)?.[1]);
  });
});

describe("accessibility and layout", () => {
  it("describes the trigger by default and drops the description in label mode", async () => {
    render(() => [tooltip("a"), tooltip("b", { props: { role: "label" }, trigger: { "aria-label": "b" } })], {
      delay: 0,
    });
    move(trigger("a"));
    await expect.poll(() => trigger("a").getAttribute("aria-describedby")).toBeTruthy();
    const described = document.getElementById(trigger("a").getAttribute("aria-describedby")!);
    expect(described?.getAttribute("role")).toBe("tooltip");
    await expect.poll(() => described?.textContent).toBe("a tip");
    leave(trigger("a"));
    move(trigger("b"));
    await expect.poll(() => content("b")).not.toBeNull();
    await flush();
    expect(trigger("b").hasAttribute("aria-describedby")).toBe(false);
    expect(content("b")!.querySelector("[role=tooltip]")!.textContent!.trim()).toBe("");
  });

  it.each([
    [false, false],
    [true, true],
  ])("with hoverable %s, a point on the tooltip hits the tooltip: %s", async (hoverable, hits) => {
    render(() => tooltip("a", { props: { defaultOpen: true, hoverable } }));
    await expect.poll(() => content()?.parentElement?.style.transform ?? "").not.toContain("-200%");
    const box = content()!.getBoundingClientRect();
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    expect(content()!.parentElement!.contains(hit)).toBe(hits);
  });

  it("warns about a natively disabled trigger, a title and a label trigger without a name", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(() => [
      tooltip("a", { trigger: { disabled: true } }),
      tooltip("b", { trigger: { title: "B" } }),
      tooltip("c", { props: { role: "label" }, text: () => "" }),
    ]);
    await flush();
    expect(warn.mock.calls.map(([message]) => String(message))).toEqual([
      expect.stringContaining("natively disabled"),
      expect.stringContaining("title attribute"),
      expect.stringContaining("no accessible name"),
    ]);
  });
});

describe("follow cursor", () => {
  const wide = (props: Record<string, unknown>) =>
    tooltip("a", { props, trigger: { style: "display: block; width: 400px; height: 40px; margin: 120px auto 0" } });

  const at = (fraction: number) => {
    const box = trigger().getBoundingClientRect();
    mouse("pointermove", trigger(), { clientX: box.left + box.width * fraction, clientY: box.top + 20, movementX: 10 });
    return box.left + box.width * fraction;
  };

  const centre = () => {
    const box = content()!.getBoundingClientRect();
    return box.left + box.width / 2;
  };

  it("keeps the tooltip over the pointer along x and above the trigger", async () => {
    render(() => wide({ followCursor: "x" }), { delay: 0 });
    const first = at(0.1);
    await expect.poll(() => Math.abs(centre() - first)).toBeLessThan(1);
    const second = at(0.8);
    await expect.poll(() => Math.abs(centre() - second)).toBeLessThan(1);
    expect(content()!.getBoundingClientRect().bottom).toBeLessThanOrEqual(trigger().getBoundingClientRect().top);
  });

  it("stays on the trigger without following", async () => {
    render(() => wide({}), { delay: 0 });
    at(0.1);
    await expect.poll(() => content()?.parentElement?.style.transform ?? "").not.toContain("-200%");
    const box = trigger().getBoundingClientRect();
    await expect.poll(() => Math.abs(centre() - (box.left + box.width / 2))).toBeLessThan(1);
  });

  it("is never hoverable while it follows both axes", async () => {
    render(() => wide({ followCursor: "both", hoverable: true }), { delay: 0 });
    at(0.5);
    await expect.poll(() => content()?.parentElement?.style.pointerEvents).toBe("none");
  });

  it("stays where the pointer was while it closes", async () => {
    const style = document.createElement("style");
    style.textContent =
      "@keyframes leave { to { opacity: 0 } } [data-test=a-content][data-state=closed] { animation: leave 300ms }";
    document.head.append(style);
    render(() => wide({ followCursor: "both" }), { delay: 0 });
    const x = at(0.1);
    await expect.poll(() => Math.abs(centre() - x)).toBeLessThan(1);
    leave(trigger());
    await expect.poll(() => content()?.dataset.state).toBe("closed");
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    expect(content()).not.toBeNull();
    expect(Math.abs(centre() - x)).toBeLessThan(1);
    style.remove();
  });

  it("opens on the trigger, not at the last pointer position, when focused after a hover", async () => {
    render(() => wide({ followCursor: "both" }), { delay: 0 });
    at(0.1);
    await expect.poll(() => content()).not.toBeNull();
    leave(trigger());
    await expect.poll(() => content()).toBeNull();
    await userEvent.keyboard("{Tab}");
    await expect.poll(() => content()).not.toBeNull();
    const box = trigger().getBoundingClientRect();
    await expect.poll(() => Math.abs(centre() - (box.left + box.width / 2))).toBeLessThan(1);
  });
});

it("keeps a trigger's own aria-describedby in label mode", async () => {
  render(
    () => [
      h("p", { id: "note" }, "Note"),
      tooltip("a", {
        props: { role: "label" },
        trigger: { asChild: true, "data-test": undefined },
        text: () => h("button", { "data-test": "a-trigger", "aria-describedby": "note", "aria-label": "a" }),
      }),
    ],
    { delay: 0 },
  );
  move(trigger());
  await expect.poll(() => content()).not.toBeNull();
  await flush();
  expect(trigger().getAttribute("aria-describedby")).toBe("note");
});
