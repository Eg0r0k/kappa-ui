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
    expect(thumbs(range).every((item) => item.attributes("tabindex") === undefined)).toBe(true);
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

    for (const [index, extent] of extents.entries()) {
      if (index > 0) expect(extent.top).toBeGreaterThanOrEqual(extents[index - 1]!.bottom);
    }
    wrapper.unmount();
  });
});
