import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { defineComponent, h, nextTick, ref } from "vue";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

afterEach(() => {
  document.body.innerHTML = "";
});

const options = () =>
  ["viewer", "editor", "admin"].map((value) => h(SelectItem, { value, disabled: value === "admin" }, () => value));

describe("Select", () => {
  it("takes its id, description, error and state from a field", async () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            "form",
            h(Field, { invalid: true, required: true }, () => [
              h(FieldLabel, () => "Role"),
              h(Select, { name: "role" }, () => [
                h(SelectTrigger, () => h(SelectValue, { placeholder: "Choose" })),
                h(SelectContent, options),
              ]),
              h(FieldDescription, () => "Who can edit."),
              h(FieldError, { errors: "Choose a role." }),
            ]),
          ),
      }),
      { attachTo: document.body },
    );
    await nextTick();
    const trigger = wrapper.get("[data-slot=select-trigger]");

    expect(wrapper.get("label").attributes("for")).toBe(trigger.attributes("id"));
    expect(trigger.attributes("role")).toBe("combobox");
    expect(trigger.attributes("aria-invalid")).toBe("true");
    expect(trigger.attributes("aria-required")).toBe("true");
    expect(trigger.attributes("aria-describedby")).toBe(
      `${wrapper.get("[data-slot=field-description]").attributes("id")} ${wrapper.get("[data-slot=field-error]").attributes("id")}`,
    );
    expect(trigger.attributes("data-placeholder")).toBeDefined();
    expect(document.querySelector("select[name=role]")).not.toBeNull();
    wrapper.unmount();
  });

  it("is disabled by a disabled field", () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(Field, { disabled: true }, () => [
            h(Select, () => [h(SelectTrigger, () => h(SelectValue)), h(SelectContent, options)]),
          ]),
      }),
    );

    expect(wrapper.get("[data-slot=select-trigger]").attributes("disabled")).toBeDefined();
    wrapper.unmount();
  });

  it("chooses with the keyboard, skips disabled options and marks the selected one", async () => {
    const value = ref<string>();
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            Select,
            { modelValue: value.value, "onUpdate:modelValue": (next: unknown) => (value.value = next as string) },
            () => [h(SelectTrigger, { "aria-label": "Role" }, () => h(SelectValue)), h(SelectContent, options)],
          ),
      }),
      { attachTo: document.body },
    );
    (wrapper.get("[data-slot=select-trigger]").element as HTMLElement).focus();

    await userEvent.keyboard("{Enter}");
    await expect.poll(() => document.activeElement?.getAttribute("data-slot")).toBe("select-item");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => value.value).toBe("editor");
    await expect.poll(() => document.querySelector("[data-slot=select-content]")).toBeNull();
    expect(document.activeElement?.getAttribute("data-slot")).toBe("select-trigger");

    await userEvent.keyboard("{Enter}");
    await expect.poll(() => document.activeElement?.getAttribute("data-slot")).toBe("select-item");
    const selected = document.querySelector("[data-slot=select-item][data-state=checked]");
    expect(selected?.textContent).toContain("editor");
    expect(selected?.querySelector("[data-slot=select-item-indicator]")).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    wrapper.unmount();
  });

  it("uses the input's variants and sizes on the trigger", () => {
    const wrapper = mount(Select, {
      slots: {
        default: () => h(SelectTrigger, { variant: "filled", size: "xl", "aria-label": "Role" }, () => h(SelectValue)),
      },
    });
    const trigger = wrapper.get("[data-slot=select-trigger]");

    expect(trigger.attributes("data-variant")).toBe("filled");
    expect(trigger.classes()).toContain("h-12");
    expect(trigger.classes()).toContain("border-b");
    wrapper.unmount();
  });
});
