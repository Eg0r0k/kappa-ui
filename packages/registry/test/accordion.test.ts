import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { defineComponent, h, nextTick } from "vue";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/ui/accordion";

let unmount: (() => void) | undefined;

afterEach(() => {
  unmount?.();
  unmount = undefined;
  document.body.innerHTML = "";
});

const renderAccordion = (root: Record<string, unknown> = {}, items: Record<string, Record<string, unknown>> = {}) => {
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(Accordion, root, () =>
          ["one", "two"].map((value) =>
            h(AccordionItem, { value, ...items[value] }, () => [
              h(AccordionTrigger, () => `Question ${value}`),
              h(AccordionContent, () => h("p", { "data-test": `answer-${value}` }, `Answer ${value}`)),
            ]),
          ),
        ),
    }),
    { attachTo: document.body },
  );
  unmount = () => wrapper.unmount();
  return wrapper;
};

const trigger = (value: string) =>
  [...document.querySelectorAll<HTMLElement>("[data-slot=accordion-trigger]")].find((element) =>
    element.textContent?.includes(`Question ${value}`),
  )!;
const panel = (value: string) =>
  document.querySelector<HTMLElement>(`[data-test=answer-${value}]`)?.closest<HTMLElement>("[data-slot=accordion-content]") ??
  null;
const isOpen = (value: string) => trigger(value).getAttribute("data-state") === "open";
const settle = () => new Promise((resolve) => setTimeout(resolve, 400));

it("opens one item at a time in single mode and closes the open one on a second click", async () => {
  renderAccordion({ type: "single" });
  await userEvent.click(trigger("one"));
  expect(isOpen("one")).toBe(true);

  await userEvent.click(trigger("two"));
  expect(isOpen("two")).toBe(true);
  expect(isOpen("one")).toBe(false);

  await userEvent.click(trigger("two"));
  expect(isOpen("two")).toBe(false);
});

it("animates a panel's height open and closed", async () => {
  renderAccordion({ type: "single" });
  await userEvent.click(trigger("one"));
  expect(getComputedStyle(panel("one")!).animationName).toBe("delta-accordion-down");

  await userEvent.click(trigger("one"));
  expect(getComputedStyle(panel("one")!).animationName).toBe("delta-accordion-up");
});

it("keeps several items open in multiple mode", async () => {
  renderAccordion({ type: "multiple" });
  await userEvent.click(trigger("one"));
  await userEvent.click(trigger("two"));
  expect(isOpen("one") && isOpen("two")).toBe(true);
});

it("ignores clicks on a disabled root and on a disabled item", async () => {
  renderAccordion({ type: "single", disabled: true });
  trigger("one").click();
  await nextTick();
  expect(isOpen("one")).toBe(false);
  expect(trigger("one").hasAttribute("data-disabled")).toBe(true);
  unmount?.();
  unmount = undefined;

  renderAccordion({ type: "single" }, { two: { disabled: true } });
  trigger("two").click();
  await nextTick();
  expect(isOpen("two")).toBe(false);
  await userEvent.click(trigger("one"));
  expect(isOpen("one")).toBe(true);
});

it("keeps closed answers findable and opens an item when find-in-page matches it", async () => {
  renderAccordion({ type: "single" });
  const closed = panel("two")!;
  expect(closed).not.toBeNull();
  expect(closed.getAttribute("hidden")).toBe("until-found");

  closed.dispatchEvent(new Event("beforematch"));
  await settle();
  expect(isOpen("two")).toBe(true);
});

it("removes closed answers with unmount-on-hide, which items inherit", async () => {
  renderAccordion({ type: "single", unmountOnHide: true });
  await nextTick();
  expect(panel("one")).toBeNull();
  expect(panel("two")).toBeNull();
});

it("lets one item keep its answer mounted against the root", async () => {
  renderAccordion({ type: "single", unmountOnHide: true }, { two: { unmountOnHide: false } });
  await nextTick();
  expect(panel("one")).toBeNull();
  expect(panel("two")?.getAttribute("hidden")).toBe("until-found");
});
