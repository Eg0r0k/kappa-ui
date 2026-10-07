import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { defineComponent, h, nextTick, ref } from "vue";

import SliderStates from "@/examples/slider/SliderStates.vue";
import SliderTouchTarget from "@/examples/slider/SliderTouchTarget.vue";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import { Slider } from "@/ui/slider";

const thumbs = (wrapper: ReturnType<typeof mount>) => wrapper.findAll("[role=slider]");

describe("Slider", () => {
  it("binds a number to one thumb and moves it with the keyboard", async () => {
    const value = ref(50);
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(Slider, {
            modelValue: value.value,
            "onUpdate:modelValue": (next: unknown) => (value.value = next as number),
            "aria-label": "Volume",
          }),
      }),
      { attachTo: document.body },
    );
    await nextTick();
    const [thumb] = thumbs(wrapper);

    expect(thumbs(wrapper)).toHaveLength(1);
    expect(thumb.attributes("aria-valuenow")).toBe("50");
    expect(thumb.attributes("aria-label")).toBe("Volume");
    expect(wrapper.get("[data-slot=slider]").attributes("aria-label")).toBeUndefined();

    (thumb.element as HTMLElement).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(value.value).toBe(51);
    await userEvent.keyboard("{End}");
    expect(value.value).toBe(100);
    wrapper.unmount();
  });

  it("gives an array one thumb per item and keeps them apart", async () => {
    const value = ref([20, 30]);
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(Slider, {
            modelValue: value.value,
            "onUpdate:modelValue": (next: unknown) => (value.value = next as number[]),
            minStepsBetweenThumbs: 10,
            "aria-label": "Price",
          }),
      }),
      { attachTo: document.body },
    );
    await nextTick();
    const root = wrapper.get("[data-slot=slider]");

    expect(thumbs(wrapper)).toHaveLength(2);
    expect(root.attributes("role")).toBe("group");
    expect(root.attributes("aria-label")).toBe("Price");
    expect(thumbs(wrapper).map((thumb) => thumb.attributes("aria-label"))).toEqual(["Minimum", "Maximum"]);

    (thumbs(wrapper)[0].element as HTMLElement).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(value.value).toEqual([20, 30]);
    await userEvent.keyboard("{ArrowLeft}");
    expect(value.value).toEqual([19, 30]);
    wrapper.unmount();
  });

  it("starts from its default value, or from min without one", async () => {
    const fallback = mount(Slider, { props: { min: 10 } });
    await nextTick();
    expect(thumbs(fallback)[0].attributes("aria-valuenow")).toBe("10");
    fallback.unmount();

    const range = mount(Slider, { props: { defaultValue: [10, 90] } });
    await nextTick();
    expect(thumbs(range).map((thumb) => thumb.attributes("aria-valuenow"))).toEqual(["10", "90"]);
    range.unmount();
  });

  it("commits once, in the shape of its value", async () => {
    const wrapper = mount(Slider, { props: { defaultValue: 5, "aria-label": "Level" }, attachTo: document.body });
    await nextTick();

    (thumbs(wrapper)[0].element as HTMLElement).focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(wrapper.emitted("valueCommit")).toEqual([[6]]);
    wrapper.unmount();
  });

  it("takes its name, description, error and state from a field", async () => {
    const mountIn = (defaultValue: number | number[], field: Record<string, unknown> = {}) =>
      mount(
        defineComponent({
          setup: () => () =>
            h(Field, field, () => [
              h(FieldLabel, () => "Budget"),
              h(Slider, { defaultValue }),
              h(FieldDescription, () => "Share of the month."),
              h(FieldError, { errors: "Too high." }),
            ]),
        }),
        { attachTo: document.body },
      );

    const single = mountIn(85, { invalid: true });
    await nextTick();
    const labelId = single.get("label").attributes("id");
    const [thumb] = thumbs(single);

    expect(labelId).toBeTruthy();
    expect(thumb.attributes("aria-labelledby")).toBe(labelId);
    expect(thumb.attributes("aria-invalid")).toBe("true");
    expect(thumb.attributes("aria-describedby")).toBe(
      `${single.get("[data-slot=field-description]").attributes("id")} ${single.get("[data-slot=field-error]").attributes("id")}`,
    );
    single.unmount();

    const range = mountIn([20, 60], { disabled: true });
    await nextTick();
    const root = range.get("[data-slot=slider]");

    expect(root.attributes("role")).toBe("group");
    expect(root.attributes("aria-labelledby")).toBe(range.get("label").attributes("id"));
    expect(root.attributes("data-disabled")).toBeDefined();
    expect(thumbs(range).map((item) => item.attributes("tabindex"))).toEqual([undefined, undefined]);
    range.unmount();
  });

  it("shows the hover layer only for a mouse over a thumb", async () => {
    const wrapper = mount(Slider, { props: { defaultValue: [20, 60] } });
    const [first, second] = thumbs(wrapper);

    await first.trigger("pointerenter", { pointerType: "touch" });
    expect(first.attributes("data-hovered")).toBeUndefined();
    await first.trigger("pointerenter", { pointerType: "mouse" });
    expect(first.attributes("data-hovered")).toBe("true");
    expect(second.attributes("data-hovered")).toBeUndefined();
    await first.trigger("pointerleave", { pointerType: "mouse" });
    expect(first.attributes("data-hovered")).toBeUndefined();
    wrapper.unmount();
  });

  it("clears the states example's error once the budget is back under 80%", async () => {
    const wrapper = mount(SliderStates, { attachTo: document.body });
    await nextTick();
    const budget = () => thumbs(wrapper).at(-1)!;

    expect(budget().attributes("aria-invalid")).toBe("true");
    expect(wrapper.find("[data-slot=field-error]").exists()).toBe(true);

    (budget().element as HTMLElement).focus();
    await userEvent.keyboard("{PageDown}");
    await nextTick();
    expect(budget().attributes("aria-valuenow")).toBe("75");
    expect(budget().attributes("aria-invalid")).not.toBe("true");
    expect(wrapper.find("[data-slot=field-error]").exists()).toBe(false);
    wrapper.unmount();
  });

  it("keeps each touch area in the touch target example clear of the next row", () => {
    const wrapper = mount(SliderTouchTarget, { attachTo: document.body });
    const extents = [...wrapper.element.children].map((row) => {
      const slider = row.querySelector("[data-slot=slider]")!;
      const box = slider.getBoundingClientRect();
      const centre = box.top + box.height / 2;
      const reach = slider.getAttribute("data-touch-target") === "none" ? box.height / 2 : 24;
      return { top: centre - reach, bottom: centre + reach };
    });

    const gaps = extents.slice(1).map((extent, index) => extent.top - extents[index]!.bottom);
    expect(gaps).toHaveLength(2);
    expect(Math.min(...gaps)).toBeGreaterThanOrEqual(0);
    wrapper.unmount();
  });
});

describe("Slider inset", () => {
  const colors = "--primary: rgb(0, 128, 0); --destructive: rgb(255, 0, 0); --destructive-foreground: rgb(0, 0, 255)";
  const rect = (wrapper: ReturnType<typeof mount>, slot: string) =>
    wrapper.get(`[data-slot=${slot}]`).element.getBoundingClientRect();
  const heights = (wrapper: ReturnType<typeof mount>) =>
    ["slider", "slider-track", "slider-thumb", "slider-handle"].map((slot) => rect(wrapper, slot).height);

  it("keeps the default variant's 16px thumb on a 6px track", async () => {
    const wrapper = mount(Slider, { props: { defaultValue: 50 }, attachTo: document.body });
    await nextTick();

    expect(wrapper.get("[data-slot=slider]").attributes("data-variant")).toBe("default");
    expect(heights(wrapper)).toEqual([16, 6, 16, 16]);
    wrapper.unmount();
  });

  it("draws the track 4px thicker than the handle at every size, as tall as the slider and its thumbs", async () => {
    const measured: number[][] = [];
    for (const size of ["xs", "sm", "md", "lg", "xl"] as const) {
      const wrapper = mount(Slider, { props: { variant: "inset", size, defaultValue: 50 }, attachTo: document.body });
      await nextTick();
      measured.push(heights(wrapper));
      wrapper.unmount();
    }

    expect(measured).toEqual([
      [16, 16, 16, 12],
      [18, 18, 18, 14],
      [20, 20, 20, 16],
      [24, 24, 24, 20],
      [28, 28, 28, 24],
    ]);
  });

  it("keeps the thumb inside the track at both ends and over the end of the fill", async () => {
    const at = async (value: number) => {
      const wrapper = mount(Slider, { props: { variant: "inset", defaultValue: value }, attachTo: document.body });
      await nextTick();
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const result = {
        track: rect(wrapper, "slider-track"),
        range: rect(wrapper, "slider-range"),
        thumb: rect(wrapper, "slider-thumb"),
      };
      wrapper.unmount();
      return result;
    };

    const start = await at(0);
    expect(Math.round(start.thumb.left)).toBe(Math.round(start.track.left));

    const end = await at(100);
    expect(Math.round(end.thumb.right)).toBe(Math.round(end.track.right));

    const middle = await at(50);
    expect(middle.range.right).toBeGreaterThan(middle.thumb.left);
    expect(middle.range.right).toBeLessThan(middle.thumb.right);
  });

  const settled = async (props: Record<string, unknown>) => {
    const wrapper = mount(Slider, { props: { variant: "inset", ...props }, attachTo: document.body });
    await nextTick();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return wrapper;
  };
  const centres = (wrapper: ReturnType<typeof mount>) =>
    wrapper.findAll("[data-slot=slider-thumb]").map((thumb) => {
      const box = thumb.element.getBoundingClientRect();
      return box.left + box.width / 2;
    });

  const offset = (edge: number, centre: number) => Math.round(edge - centre) + 0;

  it("ends the fill under the centre of the thumb wherever the thumb is", async () => {
    const gaps: number[] = [];
    for (const value of [5, 25, 50, 75, 95]) {
      const wrapper = await settled({ defaultValue: value });
      gaps.push(offset(rect(wrapper, "slider-range").right, centres(wrapper)[0]!));
      wrapper.unmount();
    }

    expect(gaps).toEqual([0, 0, 0, 0, 0]);
  });

  it("spans a range from the centre of one thumb to the centre of the other, in either direction", async () => {
    const ltr = await settled({ defaultValue: [10, 80] });
    const [first, second] = centres(ltr);
    expect([offset(rect(ltr, "slider-range").left, first!), offset(rect(ltr, "slider-range").right, second!)]).toEqual([
      0, 0,
    ]);
    ltr.unmount();

    const rtl = await settled({ defaultValue: 20, dir: "rtl" });
    expect(offset(rect(rtl, "slider-range").left, centres(rtl)[0]!)).toBe(0);
    rtl.unmount();
  });

  it("rounds the fill into the start of the track with a half disc", async () => {
    const wrapper = await settled({ defaultValue: 30 });
    const range = wrapper.get("[data-slot=slider-range]").element;
    const cap = getComputedStyle(range, "::before");

    expect(cap.width).toBe("10px");
    expect(cap.borderTopLeftRadius).not.toBe("0px");
    expect(Math.round(range.getBoundingClientRect().left - 10)).toBe(Math.round(rect(wrapper, "slider-track").left));
    wrapper.unmount();
  });

  it("turns the fill and the thumb destructive when invalid", async () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(Field, { invalid: true }, () => [
            h(FieldLabel, () => "Budget"),
            h(Slider, { variant: "inset", defaultValue: 85, style: colors }),
          ]),
      }),
      { attachTo: document.body },
    );
    await nextTick();

    expect(getComputedStyle(wrapper.get("[data-slot=slider-range]").element).backgroundColor).toBe("rgb(255, 0, 0)");
    expect(getComputedStyle(wrapper.get("[data-slot=slider-thumb]").element).backgroundColor).toBe("rgb(255, 0, 0)");
    expect(getComputedStyle(wrapper.get("[data-slot=slider-handle]").element).backgroundColor).toBe("rgb(0, 0, 255)");
    wrapper.unmount();
  });

  it("gives the range and the disc one opaque colour when disabled", async () => {
    const wrapper = mount(Slider, {
      props: { variant: "inset", disabled: true, defaultValue: 50 },
      attrs: { style: "--foreground: rgb(0, 0, 0); --background: rgb(255, 255, 255); --disabled-opacity: 38%" },
      attachTo: document.body,
    });
    await nextTick();

    const range = getComputedStyle(wrapper.get("[data-slot=slider-range]").element).backgroundColor;
    const thumb = getComputedStyle(wrapper.get("[data-slot=slider-thumb]").element).backgroundColor;

    expect(range).toBe(thumb);
    expect(range).not.toMatch(/\/|rgba|transparent/);
    wrapper.unmount();
  });

  it("is as wide as its track when vertical", async () => {
    const wrapper = mount(Slider, {
      props: { variant: "inset", orientation: "vertical", defaultValue: 50 },
      attrs: { style: "height: 200px" },
      attachTo: document.body,
    });
    await nextTick();

    expect([
      rect(wrapper, "slider").width,
      rect(wrapper, "slider-track").width,
      rect(wrapper, "slider-thumb").width,
    ]).toEqual([20, 20, 20]);
    wrapper.unmount();
  });
});

describe("Slider touch target", () => {
  it("reserves 48px across the track with touch-target wrapper in both orientations", async () => {
    const margins = async (props: Record<string, unknown>) => {
      const wrapper = mount(Slider, {
        props: { touchTarget: "wrapper", defaultValue: 50, ...props },
        attrs: { style: "height: 200px" },
        attachTo: document.body,
      });
      await nextTick();
      const style = getComputedStyle(wrapper.get("[data-slot=slider]").element);
      const result = [style.marginTop, style.marginLeft];
      wrapper.unmount();
      return result;
    };

    expect(await margins({})).toEqual(["16px", "0px"]);
    expect(await margins({ orientation: "vertical" })).toEqual(["0px", "16px"]);
  });
});
