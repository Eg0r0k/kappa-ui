import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";

import { Checkbox, CheckboxGroup } from "@/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/ui/field";

describe("Checkbox", () => {
  it("toggles and reports its state", async () => {
    const wrapper = mount(Checkbox, { attachTo: document.body });
    const button = wrapper.get("button");

    expect(button.attributes("role")).toBe("checkbox");
    expect(button.attributes("aria-checked")).toBe("false");

    await button.trigger("click");
    expect(button.attributes("data-state")).toBe("checked");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([true]);
    wrapper.unmount();
  });

  it("rounds the box with the xs radius token at every size", () => {
    for (const size of ["xs", "md", "xl"] as const) {
      const wrapper = mount(Checkbox, { props: { size }, attachTo: document.body });
      expect(getComputedStyle(wrapper.get("[data-slot=checkbox]").element).borderRadius, size).toBe("2.4px");
      wrapper.unmount();
    }
  });

  it("shows the indeterminate state as mixed", () => {
    const wrapper = mount(Checkbox, { props: { defaultValue: "indeterminate" } });

    expect(wrapper.get("button").attributes("aria-checked")).toBe("mixed");
    expect(wrapper.get("button").attributes("data-state")).toBe("indeterminate");
    wrapper.unmount();
  });

  it("takes its id, description, state and label from a field", async () => {
    const checked = ref<boolean | "indeterminate">(false);
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(Field, { orientation: "horizontal", invalid: true, required: true }, () => [
            h(Checkbox, {
              modelValue: checked.value,
              "onUpdate:modelValue": (value: boolean | "indeterminate") => (checked.value = value),
            }),
            h(FieldContent, () => [h(FieldLabel, () => "Accept"), h(FieldDescription, () => "Required.")]),
          ]),
      }),
      { attachTo: document.body },
    );
    await nextTick();
    const button = wrapper.get("button");

    expect(wrapper.get("label").attributes("for")).toBe(button.attributes("id"));
    expect(button.attributes("aria-describedby")).toBe(wrapper.get("[data-slot=field-description]").attributes("id"));
    expect(button.attributes("aria-invalid")).toBe("true");
    expect(button.attributes("aria-required")).toBe("true");

    (wrapper.get("label").element as HTMLLabelElement).click();
    await nextTick();
    expect(checked.value).toBe(true);
    wrapper.unmount();
  });

  it("is disabled by its field", () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () => h(Field, { disabled: true }, () => [h(Checkbox)]),
      }),
    );

    expect(wrapper.get("button").element.hasAttribute("disabled")).toBe(true);
    wrapper.unmount();
  });

  it("shows the hover layer only for a mouse over the box", async () => {
    const wrapper = mount(Checkbox);
    const button = wrapper.get("button");

    await button.trigger("pointerenter", { pointerType: "touch" });
    expect(button.attributes("data-hovered")).toBeUndefined();

    await button.trigger("pointerenter", { pointerType: "mouse" });
    expect(button.attributes("data-hovered")).toBe("true");

    await button.trigger("pointerleave", { pointerType: "mouse" });
    expect(button.attributes("data-hovered")).toBeUndefined();
    wrapper.unmount();
  });

  it("marks the wrapper touch target", () => {
    const wrapper = mount(Checkbox, { props: { touchTarget: "wrapper", size: "xl" } });

    expect(wrapper.get("button").attributes("data-touch-target")).toBe("wrapper");
    wrapper.unmount();
  });
});

describe("CheckboxGroup", () => {
  it("binds one array and keeps every checkbox in the tab order", async () => {
    const selected = ref(["a"]);
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            CheckboxGroup,
            {
              modelValue: selected.value,
              "onUpdate:modelValue": (value: unknown[]) => (selected.value = value as string[]),
            },
            () => ["a", "b", "c"].map((value) => h(Checkbox, { value, "aria-label": value })),
          ),
      }),
      { attachTo: document.body },
    );
    const buttons = wrapper.findAll("button");

    expect(buttons.map((button) => button.attributes("data-state"))).toEqual(["checked", "unchecked", "unchecked"]);
    expect(buttons.every((button) => button.attributes("tabindex") !== "-1")).toBe(true);

    await buttons[2].trigger("click");
    expect(selected.value).toEqual(["a", "c"]);
    wrapper.unmount();
  });
});
