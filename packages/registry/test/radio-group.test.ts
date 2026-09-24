import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { defineComponent, h, nextTick, ref } from "vue";

import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/ui/field";
import { Radio, RadioGroup } from "@/ui/radio-group";

const options = ["s", "m", "l"];

const mountGroup = (fieldset: Record<string, unknown> = {}, withError = false) => {
  const value = ref<string>();
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(FieldSet, fieldset, () => [
          h(FieldLegend, () => "Size"),
          h(
            RadioGroup,
            { modelValue: value.value, "onUpdate:modelValue": (next: unknown) => (value.value = next as string) },
            () =>
              options.map((option) =>
                h(Field, { orientation: "horizontal" }, () => [h(Radio, { value: option }), h(FieldLabel, () => option)]),
              ),
          ),
          withError ? h(FieldError, { errors: "Choose a size." }) : null,
        ]),
    }),
    { attachTo: document.body },
  );
  return { wrapper, value };
};

describe("RadioGroup", () => {
  it("selects the radio that is clicked or whose label is clicked", async () => {
    const { wrapper, value } = mountGroup();
    const radios = wrapper.findAll("button[role=radio]");

    await radios[1].trigger("click");
    expect(value.value).toBe("m");
    expect(radios[1].attributes("aria-checked")).toBe("true");

    (wrapper.findAll("label")[2].element as HTMLLabelElement).click();
    await nextTick();
    expect(value.value).toBe("l");
    wrapper.unmount();
  });

  it("is a single tab stop that lands on the checked radio and arrow keys move within", async () => {
    const before = document.createElement("button");
    document.body.append(before);
    const { wrapper, value } = mountGroup();
    await wrapper.findAll("button[role=radio]")[1].trigger("click");
    before.focus();

    await userEvent.tab();
    expect(document.activeElement).toBe(wrapper.findAll("button[role=radio]")[1].element);

    await userEvent.keyboard("{ArrowDown>}");
    await new Promise((resolve) => setTimeout(resolve, 20));
    await userEvent.keyboard("{/ArrowDown}");
    expect(value.value).toBe("l");
    wrapper.unmount();
    before.remove();
  });

  it("takes invalid, required and its error from the fieldset around it", async () => {
    const { wrapper } = mountGroup({ invalid: true, required: true }, true);
    await nextTick();
    const group = wrapper.get("[role=radiogroup]");

    expect(group.attributes("aria-invalid")).toBe("true");
    expect(group.attributes("aria-required")).toBe("true");
    expect(group.attributes("aria-describedby")).toBe(wrapper.get("[data-slot=field-error]").attributes("id"));
    expect(wrapper.find("button[role=radio][aria-invalid]").exists()).toBe(false);
    wrapper.unmount();
  });

  it("is disabled by a disabled fieldset", () => {
    const { wrapper } = mountGroup({ disabled: true });

    expect(wrapper.findAll("button[role=radio]").every((radio) => radio.element.matches(":disabled"))).toBe(true);
    wrapper.unmount();
  });

  it("labels each radio through its own field", () => {
    const { wrapper } = mountGroup();
    const radios = wrapper.findAll("button[role=radio]");
    const labels = wrapper.findAll("label");

    radios.forEach((radio, index) => expect(labels[index].attributes("for")).toBe(radio.attributes("id")));
    wrapper.unmount();
  });
});

describe("Radio", () => {
  it("shows the hover layer only for a mouse over the circle", async () => {
    const wrapper = mount(RadioGroup, { slots: { default: () => h(Radio, { value: "a", "aria-label": "a" }) } });
    const radio = wrapper.get("button");

    await radio.trigger("pointerenter", { pointerType: "touch" });
    expect(radio.attributes("data-hovered")).toBeUndefined();
    await radio.trigger("pointerenter", { pointerType: "mouse" });
    expect(radio.attributes("data-hovered")).toBe("true");
    await radio.trigger("pointerleave", { pointerType: "mouse" });
    expect(radio.attributes("data-hovered")).toBeUndefined();
    wrapper.unmount();
  });
});
