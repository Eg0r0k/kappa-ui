import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type Component, type VNode, h, nextTick } from "vue";

import { Marquee } from "@/ui/marquee";
import { ScrollArea } from "@/ui/scroll-area";

let unmount: (() => void) | undefined;

const reset = () => {
  unmount?.();
  unmount = undefined;
  document.body.innerHTML = "";
};

afterEach(reset);

const render = (props: Record<string, unknown> = {}, wrap: (node: VNode) => VNode = (node) => node) => {
  const wrapper = mount(
    {
      render: () =>
        wrap(
          h(Marquee, { class: "w-[400px]", ...props }, () => [
            h("a", { href: "#", class: "w-40 shrink-0" }, "One"),
            h("span", { class: "w-40 shrink-0" }, "Two"),
          ]),
        ),
    },
    { attachTo: document.body },
  );
  unmount = () => wrapper.unmount();
};

const root = () => document.querySelector<HTMLElement>("[data-slot=marquee]")!;
const copies = () => [...document.querySelectorAll<HTMLElement>("[data-slot=marquee-content]")];
const first = () => getComputedStyle(copies()[0]!);

it("repeats the content, hides the copies from assistive technology and the Tab order, and keeps them clickable", async () => {
  render();
  expect(copies()).toHaveLength(2);
  expect(copies().some((copy) => copy.inert)).toBe(false);
  expect(copies().map((copy) => copy.getAttribute("aria-hidden"))).toEqual([null, "true"]);
  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(copies()[0]!.querySelector("a")!.tabIndex).toBe(0);
  expect(copies()[1]!.querySelector("a")!.tabIndex).toBe(-1);
  expect(getComputedStyle(copies()[1]!).pointerEvents).not.toBe("none");
  expect(root().dataset.orientation).toBe("horizontal");
  expect(getComputedStyle(root()).overflowX).toBe("clip");
  expect(getComputedStyle(root()).overflowY).toBe("visible");
  reset();

  render({ repeat: 3 });
  expect(copies()).toHaveLength(3);
});

it("slides the copies with the marquee animation, the other way in RTL and when reversed", () => {
  render();
  expect(first().animationName).toBe("kappa-marquee");
  expect(first().animationDuration).toBe("20s");
  expect(first().animationIterationCount).toBe("infinite");
  expect(first().animationDirection).toBe("normal");
  reset();

  render({ reverse: true });
  expect(first().animationDirection).toBe("reverse");
  reset();

  render({ class: "[--marquee-duration:40s]" });
  expect(first().animationDuration).toBe("40s");
  reset();

  render({}, (node) => h("div", { dir: "rtl" }, [node]));
  expect(first().animationName).toBe("kappa-marquee-rtl");
});

it("runs vertically in a column", () => {
  render({ orientation: "vertical", class: "h-40" });
  expect(root().dataset.orientation).toBe("vertical");
  expect(getComputedStyle(root()).flexDirection).toBe("column");
  expect(first().animationName).toBe("kappa-marquee-vertical");
  expect(getComputedStyle(root()).overflowY).toBe("clip");
});

it("keeps its content width as a vertical column in a flex row", () => {
  render({ orientation: "vertical", class: "h-40" }, (node) => h("div", { style: "display:flex;width:600px" }, [node]));
  expect(root().getBoundingClientRect().width).toBe(160);
});

it("pauses when told to", () => {
  render({ paused: true });
  expect(first().animationPlayState).toBe("paused");
});

it("stops under keyboard focus and keeps running under mouse focus", async () => {
  render({ pauseOnHover: false });
  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 0));
  const link = copies()[0]!.querySelector("a")!;
  for (let attempt = 0; attempt < 3 && document.activeElement !== link; attempt++) await userEvent.tab();
  expect(document.activeElement).toBe(link);
  expect(first().animationName).toBe("none");
  (document.activeElement as HTMLElement).blur();
  expect(first().animationName).toBe("kappa-marquee");
  await userEvent.click(link, { force: true });
  expect(document.activeElement).toBe(link);
  expect(first().animationName).toBe("kappa-marquee");
});

it("pauses on hover when asked", async () => {
  render({ pauseOnHover: true });
  expect(first().animationPlayState).toBe("running");
  await userEvent.hover(root());
  expect(first().animationPlayState).toBe("paused");
  await userEvent.unhover(root());
  expect(first().animationPlayState).toBe("running");
  reset();

  render();
  await userEvent.hover(root());
  expect(first().animationPlayState).toBe("running");
});

it("fades the edges with a mask unless told not to", () => {
  render();
  expect(getComputedStyle(root()).maskImage).toContain("linear-gradient");
  reset();

  render({ fade: false });
  expect(getComputedStyle(root()).maskImage).toBe("none");
});

it("renders the element it is asked for and merges class", () => {
  render({ as: "section", class: "marquee-x" });
  expect(root().tagName).toBe("SECTION");
  expect(root().classList.contains("marquee-x")).toBe(true);
  expect(copies()[0]!.parentElement).toBe(root());
});

it("takes its size from a flex parent instead of its copies", () => {
  render({ class: "flex-1" }, (node) => h("div", { style: "display:flex;width:400px" }, [node]));
  expect(root().getBoundingClientRect().width).toBe(400);
  expect(copies()[0]!.getBoundingClientRect().width).toBe(400);
  reset();

  render({ orientation: "vertical", class: "flex-1" }, (node) =>
    h("div", { style: "display:flex;flex-direction:column;height:160px" }, [node]),
  );
  expect(root().getBoundingClientRect().height).toBe(160);
});

it("takes no width of its own inside a box sized by its content", async () => {
  render({ class: "w-full" }, (node) =>
    h("div", { style: "width:640px" }, [
      h(ScrollArea as Component, { orientation: "horizontal", style: "height:200px" }, () =>
        h("div", { class: "min-w-full" }, [h("div", { style: "display:flex;padding:40px" }, [node])]),
      ),
    ]),
  );
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(root().getBoundingClientRect().width).toBe(560);
  expect(copies()[0]!.getBoundingClientRect().width).toBe(560);
});
