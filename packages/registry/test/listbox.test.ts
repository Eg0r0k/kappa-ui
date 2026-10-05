import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import type { AcceptableValue, ListboxItemSelectEvent } from "reka-ui";
import { defineComponent, h, nextTick, ref } from "vue";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import { Listbox, ListboxGroup, ListboxGroupLabel, ListboxItem } from "@/ui/listbox";

import { controlSizes, overrideControlTokens, px, sentinel } from "./control-tokens";

const fruits = ["Apple", "Banana", "Cherry"];

const mountListbox = (props: Record<string, unknown> = {}, disabledItem?: string) => {
  const value = ref(props.modelValue as AcceptableValue | AcceptableValue[] | undefined);
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          Listbox,
          {
            "aria-label": "Fruit",
            ...props,
            modelValue: value.value,
            "onUpdate:modelValue": (next: AcceptableValue) => (value.value = next),
          },
          () => fruits.map((fruit) => h(ListboxItem, { value: fruit, disabled: fruit === disabledItem }, () => fruit)),
        ),
    }),
    { attachTo: document.body },
  );
  return { wrapper, value };
};

describe("Listbox", () => {
  it("puts attributes and classes on the element with the listbox role", () => {
    const { wrapper } = mountListbox({ class: "w-56" });
    const listbox = wrapper.get("[role=listbox]");

    expect(listbox.attributes("data-slot")).toBe("listbox");
    expect(listbox.attributes("aria-label")).toBe("Fruit");
    expect(listbox.classes()).toContain("w-56");
    wrapper.unmount();
  });

  it("selects on click, marks the option and shows the indicator", async () => {
    const { wrapper, value } = mountListbox();

    await wrapper.findAll("[role=option]")[1].trigger("click");
    await nextTick();
    const option = wrapper.findAll("[role=option]")[1];

    expect(value.value).toBe("Banana");
    expect(option.attributes("aria-selected")).toBe("true");
    expect(option.attributes("data-state")).toBe("checked");
    expect(option.find("[data-slot=listbox-item-indicator]").exists()).toBe(true);
    expect(wrapper.findAll("[data-slot=listbox-item-indicator]")).toHaveLength(1);
    wrapper.unmount();
  });

  it("moves with the arrow keys, skips disabled options and selects with Enter", async () => {
    const { wrapper, value } = mountListbox({}, "Banana");

    (wrapper.get("[role=listbox]").element as HTMLElement).focus();
    await nextTick();
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");
    expect(value.value).toBe("Cherry");
    wrapper.unmount();
  });

  it("collects an array with multiple", async () => {
    const { wrapper, value } = mountListbox({ multiple: true, modelValue: [] });
    const options = wrapper.findAll("[role=option]");

    await options[0].trigger("click");
    await options[2].trigger("click");
    expect(value.value).toEqual(["Apple", "Cherry"]);
    expect(wrapper.get("[role=listbox]").attributes("aria-multiselectable")).toBe("true");
    wrapper.unmount();
  });

  it("lets select run an action without selecting", async () => {
    const opened: unknown[] = [];
    const value = ref<unknown>();
    const wrapper = mount(Listbox, {
      props: { modelValue: undefined, "onUpdate:modelValue": (next: unknown) => (value.value = next) },
      slots: {
        default: () =>
          h(
            ListboxItem,
            {
              value: "report.pdf",
              onSelect: (event: ListboxItemSelectEvent<AcceptableValue>) => {
                event.preventDefault();
                opened.push(event.detail.value);
              },
            },
            () => "report.pdf",
          ),
      },
      attachTo: document.body,
    });

    await wrapper.get("[role=option]").trigger("click");
    expect(opened).toEqual(["report.pdf"]);
    expect(value.value).toBeUndefined();
    wrapper.unmount();
  });

  it("uses a custom indicator icon", async () => {
    const wrapper = mount(Listbox, {
      props: { defaultValue: "a" },
      slots: {
        default: () =>
          h(ListboxItem, { value: "a" }, { default: () => "A", "indicator-icon": () => h("i", { class: "custom" }) }),
      },
    });
    await nextTick();

    expect(wrapper.find("[data-slot=listbox-item-indicator] .custom").exists()).toBe(true);
    expect(wrapper.find("[data-slot=listbox-item-indicator] svg").exists()).toBe(false);
    wrapper.unmount();
  });

  it("names a group by its label", () => {
    const wrapper = mount(Listbox, {
      slots: {
        default: () =>
          h(ListboxGroup, () => [
            h(ListboxGroupLabel, () => "Europe"),
            h(ListboxItem, { value: "Berlin" }, () => "Berlin"),
          ]),
      },
    });
    const group = wrapper.get("[role=group]");

    expect(group.attributes("aria-labelledby")).toBe(wrapper.get("[data-slot=listbox-group-label]").attributes("id"));
    wrapper.unmount();
  });

  it("takes its name, description, error and state from a field", async () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(Field, { invalid: true, required: true, disabled: true }, () => [
            h(FieldLabel, () => "Region"),
            h(Listbox, () => h(ListboxItem, { value: "eu" }, () => "Frankfurt")),
            h(FieldDescription, () => "Where data is stored."),
            h(FieldError, { errors: "Choose a region." }),
          ]),
      }),
      { attachTo: document.body },
    );
    await nextTick();
    const listbox = wrapper.get("[role=listbox]");

    expect(listbox.attributes("aria-labelledby")).toBe(wrapper.get("label").attributes("id"));
    expect(listbox.attributes("aria-describedby")).toBe(
      `${wrapper.get("[data-slot=field-description]").attributes("id")} ${wrapper.get("[data-slot=field-error]").attributes("id")}`,
    );
    expect(listbox.attributes("aria-invalid")).toBe("true");
    expect(listbox.attributes("aria-required")).toBe("true");
    expect(listbox.attributes("data-disabled")).toBeDefined();
    expect(wrapper.get("[role=option]").attributes("data-disabled")).toBeDefined();
    wrapper.unmount();
  });
});

describe("Listbox sizes", () => {
  const root = () => document.querySelector<HTMLElement>("[data-slot=listbox]")!;
  const item = () => getComputedStyle(document.querySelector("[data-slot=listbox-item]")!);

  it("defaults to md", () => {
    const { wrapper } = mountListbox();

    expect(root().dataset.size).toBe("md");
    expect([item().minHeight, item().paddingInlineStart, item().columnGap]).toEqual(["36px", "12px", "8px"]);
    wrapper.unmount();
  });

  it.each([
    ["xs", "12px"],
    ["sm", "12px"],
    ["md", "14px"],
    ["lg", "16px"],
    ["xl", "16px"],
  ] as const)("%s options use %s text, like a menu of that size", (size, fontSize) => {
    const { wrapper } = mountListbox({ size });

    expect(item().fontSize).toBe(fontSize);
    wrapper.unmount();
  });

  describe("control tokens", () => {
    overrideControlTokens();

    it.each(controlSizes)("%s options read the height, padding, icon and gap tokens", (size) => {
      const { wrapper } = mountListbox({ size });
      const style = item();

      expect(root().dataset.size).toBe(size);
      expect(px(style.minHeight)).toBe(sentinel.height[size]);
      expect(px(style.paddingInlineStart)).toBe(sentinel.padding[size]);
      expect(px(style.columnGap)).toBe(sentinel.gap[size]);
      expect(px(style.getPropertyValue("--listbox-icon"))).toBe(sentinel.icon[size]);
      wrapper.unmount();
    });

    it.each(controlSizes)("a %s group label lines up with the options", (size) => {
      const wrapper = mount(
        () =>
          h(Listbox, { "aria-label": "Fruit", size }, () =>
            h(ListboxGroup, () => [
              h(ListboxGroupLabel, () => "Fruit"),
              h(ListboxItem, { value: "apple" }, () => "Apple"),
            ]),
          ),
        { attachTo: document.body },
      );

      expect(px(getComputedStyle(document.querySelector("[data-slot=listbox-group-label]")!).paddingInlineStart)).toBe(
        sentinel.padding[size],
      );
      wrapper.unmount();
    });
  });
});
