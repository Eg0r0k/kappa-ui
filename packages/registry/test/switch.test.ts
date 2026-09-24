import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";

import { Field, FieldContent, FieldDescription, FieldLabel } from "@/ui/field";
import { Switch } from "@/ui/switch";

describe("Switch", () => {
  it("toggles and reports its state", async () => {
    const wrapper = mount(Switch, { attachTo: document.body });
    const button = wrapper.get("button");

    expect(button.attributes("role")).toBe("switch");
    expect(button.attributes("aria-checked")).toBe("false");

    await button.trigger("click");
    expect(button.attributes("aria-checked")).toBe("true");
    expect(wrapper.get("[data-slot=switch-thumb]").attributes("data-state")).toBe("checked");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([true]);
    wrapper.unmount();
  });

  it("takes its id, description, state and label from a field", async () => {
    const on = ref(false);
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(Field, { orientation: "horizontal", invalid: true, required: true }, () => [
            h(FieldContent, () => [h(FieldLabel, () => "Wi-Fi"), h(FieldDescription, () => "Joins known networks.")]),
            h(Switch, { modelValue: on.value, "onUpdate:modelValue": (value: boolean) => (on.value = value) }),
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
    expect(on.value).toBe(true);
    wrapper.unmount();
  });

  it("shows the hover layer only for a mouse over the track", async () => {
    const wrapper = mount(Switch);
    const button = wrapper.get("button");

    await button.trigger("pointerenter", { pointerType: "touch" });
    expect(button.attributes("data-hovered")).toBeUndefined();
    await button.trigger("pointerenter", { pointerType: "mouse" });
    expect(button.attributes("data-hovered")).toBe("true");
    await button.trigger("pointerleave", { pointerType: "mouse" });
    expect(button.attributes("data-hovered")).toBeUndefined();
    wrapper.unmount();
  });

  it("renders the icons it is given and hides them from assistive technology", () => {
    const both = mount(Switch, {
      slots: { "checked-icon": () => h("svg", { class: "on" }), "unchecked-icon": () => h("svg", { class: "off" }) },
    });
    const checkedOnly = mount(Switch, { slots: { "checked-icon": () => h("svg", { class: "on" }) } });

    expect(both.get("button").attributes("data-unchecked-icon")).toBe("");
    expect(both.get(".on").element.parentElement?.getAttribute("aria-hidden")).toBe("true");
    expect(both.find(".off").exists()).toBe(true);
    expect(checkedOnly.get("button").attributes("data-unchecked-icon")).toBeUndefined();
    both.unmount();
    checkedOnly.unmount();
  });
});
