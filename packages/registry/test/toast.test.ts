import { mount } from "@vue/test-utils";
import { Star } from "@lucide/vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { defineComponent, h, nextTick } from "vue";

import { ToastDescription, ToastTitle, Toaster, createToaster } from "@/ui/toast";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let wrappers: ReturnType<typeof mount>[] = [];

// The page keeps the pointer where the previous test file left it, and over the toaster it expands the stack
beforeEach(async () => {
  const corner = document.createElement("div");
  corner.style.cssText = "position: fixed; top: 0; left: 0; width: 4px; height: 4px";
  document.body.append(corner);
  await userEvent.hover(corner);
  corner.remove();
});

afterEach(() => {
  wrappers.forEach((wrapper) => wrapper.unmount());
  wrappers = [];
  document.body.innerHTML = "";
});

const render = (props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) => {
  const toaster = createToaster();
  const wrapper = mount(
    defineComponent(() => () => h(Toaster, props, slots)),
    { attachTo: document.body, global: { plugins: [toaster] } },
  );
  wrappers.push(wrapper);
  return toaster;
};

const toasts = () => [...document.querySelectorAll<HTMLElement>("li[data-slot=toast]")];
const viewport = () => document.querySelector<HTMLElement>("[data-slot=toaster]")!;

describe("Toaster", () => {
  it("shows the toasts of its own group in the viewport", async () => {
    const toaster = createToaster();
    const wrapper = mount(
      defineComponent(() => () => [h(Toaster), h(Toaster, { group: "uploads", position: "top-center" })]),
      { attachTo: document.body, global: { plugins: [toaster] } },
    );
    wrappers.push(wrapper);
    toaster.add({ title: "Saved" });
    toaster.add({ title: "Uploading", group: "uploads" });
    await wait(50);
    const [bottom, top] = [...document.querySelectorAll<HTMLElement>("[data-slot=toaster]")];
    expect(bottom!.querySelector("[data-slot=toast-title]")?.textContent).toBe("Saved");
    expect(top!.querySelector("[data-slot=toast-title]")?.textContent).toBe("Uploading");
    expect(getComputedStyle(bottom!).position).toBe("fixed");
    expect(bottom!.getBoundingClientRect().bottom).toBeGreaterThan(window.innerHeight - 40);
    expect(top!.getBoundingClientRect().top).toBeLessThan(40);
  });

  it("shows a title, a description and a close button", async () => {
    const toaster = render();
    toaster.add({ title: "Saved", description: "report.pdf" });
    await wait(50);
    const [toast] = toasts();
    expect(toast!.querySelector("[data-slot=toast-description]")?.textContent).toBe("report.pdf");
    const close = toast!.querySelector<HTMLButtonElement>("[data-slot=toast-close]")!;
    expect(close.getAttribute("aria-label")).toBe("Close");
    close.click();
    await nextTick();
    expect(toaster.toasts.value[0]?.open).toBe(false);
  });

  it("gives each colour but neutral a default icon", async () => {
    const toaster = render({ max: 10 });
    for (const color of ["success", "destructive", "warning", "primary", "neutral"] as const) {
      toaster.add({ id: color, title: color, color });
    }
    toaster.add({ id: "custom", title: "Custom", icon: Star });
    toaster.add({ id: "none", title: "None", color: "success", icon: false });
    await wait(50);
    const icon = (id: string) =>
      toasts()
        .find((toast) => toast.textContent?.startsWith(id === "custom" ? "Custom" : id === "none" ? "None" : id))
        ?.querySelector("[data-slot=toast-icon]");
    expect(["success", "destructive", "warning", "primary"].map((id) => icon(id)?.tagName)).toEqual([
      "svg",
      "svg",
      "svg",
      "svg",
    ]);
    expect(icon("neutral")).toBeNull();
    expect(icon("custom")?.classList.contains("lucide-star")).toBe(true);
    expect(icon("none")).toBeNull();
  });

  it("shows a spinner while loading", async () => {
    const toaster = render();
    const id = toaster.add({ title: "Uploading", color: "success", loading: true });
    await wait(50);
    expect(toasts()[0]!.querySelector("[data-slot=spinner]")).not.toBeNull();
    expect(toasts()[0]!.querySelector("[data-slot=toast-icon]")).toBeNull();
    toaster.update(id, { title: "Uploaded", loading: false });
    await nextTick();
    expect(toasts()[0]!.querySelector("[data-slot=spinner]")).toBeNull();
    expect(toasts()[0]!.querySelector("[data-slot=toast-icon]")).not.toBeNull();
  });

  it("runs an action and closes the toast", async () => {
    const toaster = render();
    const onClick = vi.fn();
    toaster.add({ title: "Deleted", actions: [{ label: "Undo", onClick }] });
    await wait(50);
    const action = toasts()[0]!.querySelector<HTMLButtonElement>("[data-slot=toast-action]")!;
    expect(action.textContent).toBe("Undo");
    action.click();
    await nextTick();
    expect(onClick).toHaveBeenCalledOnce();
    expect(toaster.toasts.value[0]?.open).toBe(false);
  });

  it("renders the toast slot inside the toast", async () => {
    const toaster = render(
      {},
      {
        toast: ({ toast }: { toast: { title?: string; data?: { name?: string } } }) => [
          h(ToastTitle, () => toast.title),
          h(ToastDescription, () => `Invited by ${toast.data?.name}`),
        ],
      },
    );
    toaster.add({ title: "Invite", data: { name: "Ada" } });
    await wait(50);
    const [toast] = toasts();
    expect(toast!.querySelector("[data-slot=toast-description]")?.textContent).toBe("Invited by Ada");
    expect(toast!.querySelector("[data-slot=toast-close]")).toBeNull();
  });

  it("stacks older toasts smaller behind the newest", async () => {
    const toaster = render();
    toaster.add({ title: "First", description: "A longer toast\nwith a second line" });
    toaster.add({ title: "Second" });
    await wait(700);
    const [back, front] = toasts();
    expect(getComputedStyle(front!).scale).toBe("1");
    expect(Number(getComputedStyle(back!).scale)).toBeCloseTo(0.95);
    expect(back!.offsetHeight).toBe(front!.offsetHeight);
    expect(back!.getBoundingClientRect().top).toBeLessThan(front!.getBoundingClientRect().top);
  });

  it("eases an older toast down to the newest one's height", async () => {
    const toaster = render();
    toaster.add({ title: "First", description: "A longer toast\nwith a second line" });
    await wait(700);
    const [back] = toasts();
    const start = back!.offsetHeight;
    // a slow transition, so the check doesn't depend on frame timing
    viewport().style.setProperty("--transition-duration-medium-4", "100s");
    toaster.add({ title: "Second" });
    await wait(300);
    const end = parseFloat(viewport().style.getPropertyValue("--toast-front-height"));
    expect(end).toBeLessThan(start - 10);
    expect(back!.offsetHeight).toBeGreaterThan(end + 2);
  });

  it("lays the stack out in full with expand", async () => {
    const toaster = render({ expand: true });
    toaster.add({ title: "First" });
    toaster.add({ title: "Second" });
    await wait(700);
    const [back, front] = toasts();
    expect(getComputedStyle(back!).scale).toBe("1");
    expect(back!.getBoundingClientRect().bottom).toBeLessThanOrEqual(front!.getBoundingClientRect().top);
  });

  it("runs a progress bar for the toast's duration, paused with the timer", async () => {
    const toaster = render({ progress: true, duration: 4000 });
    toaster.add({ title: "Saved" });
    toaster.add({ title: "Loading", loading: true });
    await wait(50);
    const [timed, loading] = toasts();
    const bar = timed!.querySelector<HTMLElement>("[data-slot=toast-progress]")!;
    expect(getComputedStyle(bar).animationName).toBe("kappa-toast-progress");
    expect(getComputedStyle(bar).animationDuration).toBe("4s");
    expect(loading!.querySelector("[data-slot=toast-progress]")).toBeNull();
    viewport().dispatchEvent(new PointerEvent("pointermove", { bubbles: true }));
    await nextTick();
    expect(getComputedStyle(bar).animationPlayState).toBe("paused");
  });
});
