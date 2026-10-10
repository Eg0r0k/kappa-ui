import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, h } from "vue";

import { Marquee } from "@/ui/marquee";

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

it("repeats the content and keeps every copy but the first out of the way", () => {
  render();
  expect(copies()).toHaveLength(4);
  expect(copies().map((copy) => copy.inert)).toEqual([false, true, true, true]);
  expect(copies().map((copy) => copy.getAttribute("aria-hidden"))).toEqual([null, "true", "true", "true"]);
  expect(root().dataset.orientation).toBe("horizontal");
  expect(getComputedStyle(root()).overflow).toBe("clip");
  reset();

  render({ repeat: 2 });
  expect(copies()).toHaveLength(2);
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
});

it("pauses on hover and on focus within when asked", async () => {
  render({ pauseOnHover: true });
  expect(first().animationPlayState).toBe("running");
  await userEvent.hover(root());
  expect(first().animationPlayState).toBe("paused");
  await userEvent.unhover(root());
  expect(first().animationPlayState).toBe("running");
  document.querySelector<HTMLElement>("[data-slot=marquee-content] a")!.focus();
  expect(first().animationPlayState).toBe("paused");
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
