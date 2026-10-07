import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { defineComponent, h, nextTick, ref } from "vue";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import { controlSizes, overrideControlTokens, px, sentinel } from "./control-tokens";

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
    expect(trigger.attributes("data-size")).toBe("xl");
    expect(trigger.classes()).toContain("h-(--control-height-xl)");
    expect(trigger.classes()).toContain("border-b");
    wrapper.unmount();
  });

  it("marks the trigger with its default variant and size", () => {
    const wrapper = mount(Select, {
      slots: { default: () => h(SelectTrigger, { "aria-label": "Role" }, () => h(SelectValue)) },
    });
    const trigger = wrapper.get("[data-slot=select-trigger]");

    expect(trigger.attributes("data-variant")).toBe("outline");
    expect(trigger.attributes("data-size")).toBe("md");
    wrapper.unmount();
  });

  it("opens a list of the trigger's size, and follows it when it changes", async () => {
    const size = ref<"xs" | "md" | "xl" | undefined>(undefined);
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(Select, { open: true }, () => [
            h(SelectTrigger, { size: size.value, "aria-label": "Role" }, () => h(SelectValue)),
            h(SelectContent, options),
          ]),
      }),
      { attachTo: document.body },
    );
    const content = () => document.querySelector<HTMLElement>("[data-slot=select-content]");
    const item = () => getComputedStyle(document.querySelector("[data-slot=select-item]")!);

    await expect.poll(() => content()?.dataset.size).toBe("md");
    expect(item().minHeight).toBe("36px");

    size.value = "xl";
    await expect.poll(() => content()?.dataset.size).toBe("xl");
    expect(item().minHeight).toBe("48px");

    size.value = "xs";
    await expect.poll(() => item().minHeight).toBe("28px");
    wrapper.unmount();
  });

  it("lets the content's own size win over the trigger's", async () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(Select, { open: true }, () => [
            h(SelectTrigger, { size: "xl", "aria-label": "Role" }, () => h(SelectValue)),
            h(SelectContent, { size: "sm" }, options),
          ]),
      }),
      { attachTo: document.body },
    );

    await expect.poll(() => document.querySelector<HTMLElement>("[data-slot=select-content]")?.dataset.size).toBe("sm");
    expect(getComputedStyle(document.querySelector("[data-slot=select-item]")!).minHeight).toBe("32px");
    wrapper.unmount();
  });

  it("takes a menu variable from a class on the content", async () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(Select, { open: true }, () => [
            h(SelectTrigger, { "aria-label": "Role" }, () => h(SelectValue)),
            h(SelectContent, { class: "[--menu-item-height:50px]" }, options),
          ]),
      }),
      { attachTo: document.body },
    );

    await expect.poll(() => document.querySelector("[data-slot=select-item]")).not.toBeNull();
    expect(getComputedStyle(document.querySelector("[data-slot=select-item]")!).minHeight).toBe("50px");
    wrapper.unmount();
  });
});

describe("Select control tokens", () => {
  overrideControlTokens();

  it.each(controlSizes)("the %s trigger reads its height and padding tokens", (size) => {
    const wrapper = mount(Select, {
      slots: { default: () => h(SelectTrigger, { size, "aria-label": "Role" }, () => h(SelectValue)) },
      attachTo: document.body,
    });
    const trigger = getComputedStyle(wrapper.get("[data-slot=select-trigger]").element);

    expect(px(trigger.height)).toBe(sentinel.height[size]);
    expect(px(trigger.paddingInlineStart)).toBe(sentinel.padding[size]);
    wrapper.unmount();
  });

  it.each(controlSizes)("the list of a %s trigger reads the same tokens", async (size) => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(Select, { open: true }, () => [
            h(SelectTrigger, { size, "aria-label": "Role" }, () => h(SelectValue)),
            h(SelectContent, options),
          ]),
      }),
      { attachTo: document.body },
    );
    await expect.poll(() => document.querySelector("[data-slot=select-item]")).not.toBeNull();
    const item = getComputedStyle(document.querySelector("[data-slot=select-item]")!);

    expect(px(item.minHeight)).toBe(sentinel.height[size]);
    expect(px(item.paddingInlineStart)).toBe(sentinel.padding[size]);
    wrapper.unmount();
  });
});
