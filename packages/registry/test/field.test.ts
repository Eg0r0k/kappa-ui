import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { InputFloating } from "@/ui/input-floating";

const mountField = (options: {
  field?: Record<string, unknown>;
  input?: Record<string, unknown>;
  description?: boolean;
  errors?: () => string[] | null;
}) =>
  mount(
    defineComponent({
      setup: () => () =>
        h(Field, options.field ?? {}, () => [
          h(FieldLabel, () => "Email"),
          h(Input, options.input ?? {}),
          options.description ? h(FieldDescription, () => "We never share it.") : null,
          options.errors ? h(FieldError, { errors: options.errors() }) : null,
        ]),
    }),
    { attachTo: document.body },
  );

describe("Field", () => {
  it("labels the input", () => {
    const wrapper = mountField({});
    const input = wrapper.get("input");
    const label = wrapper.get("label");

    expect(input.attributes("id")).toBeTruthy();
    expect(label.attributes("for")).toBe(input.attributes("id"));
    wrapper.unmount();
  });

  it("describes the input only by the parts that are rendered", async () => {
    const errors = ref<string[] | null>(null);
    const wrapper = mountField({ description: true, errors: () => errors.value });
    await nextTick();
    const input = wrapper.get("input");
    const description = wrapper.get("[data-slot=field-description]");

    expect(input.attributes("aria-describedby")).toBe(description.attributes("id"));
    expect(wrapper.find("[data-slot=field-error]").exists()).toBe(false);

    errors.value = ["Enter an email address."];
    await nextTick();
    const error = wrapper.get("[data-slot=field-error]");
    expect(input.attributes("aria-describedby")).toBe(`${description.attributes("id")} ${error.attributes("id")}`);

    errors.value = null;
    await nextTick();
    expect(input.attributes("aria-describedby")).toBe(description.attributes("id"));
    wrapper.unmount();
  });

  it("marks the input invalid, disabled and required from the field", () => {
    const wrapper = mountField({ field: { invalid: true, disabled: true, required: true } });
    const input = wrapper.get("input").element as HTMLInputElement;

    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.disabled).toBe(true);
    expect(input.required).toBe(true);
    expect(wrapper.get("label").text()).toBe("Email*");
    expect(wrapper.get("label span").attributes("aria-hidden")).toBe("true");
    wrapper.unmount();
  });

  it("lets attributes on the input win over the field", async () => {
    const wrapper = mountField({
      field: { invalid: true },
      input: { id: "email", "aria-invalid": "false", "aria-describedby": "hint" },
      description: true,
    });
    await nextTick();
    const input = wrapper.get("input");

    expect(input.attributes("id")).toBe("email");
    expect(input.attributes("aria-invalid")).toBe("false");
    expect(input.attributes("aria-describedby")).toMatch(/^hint /);
    wrapper.unmount();
  });

  it("uses the id given to the field", () => {
    const wrapper = mountField({ field: { id: "email" } });

    expect(wrapper.get("input").attributes("id")).toBe("email");
    expect(wrapper.get("label").attributes("for")).toBe("email");
    expect(wrapper.find("[data-slot=field-description]").exists()).toBe(false);
    wrapper.unmount();
  });

  it("shows one message as text and several as a list, without duplicates", async () => {
    const errors = ref<string[] | null>(["Too short.", "Too short."]);
    const wrapper = mountField({ errors: () => errors.value });

    expect(wrapper.get("[data-slot=field-error]").text()).toBe("Too short.");

    errors.value = ["Too short.", "Needs a digit."];
    await nextTick();
    expect(wrapper.findAll("[data-slot=field-error] li").map((item) => item.text())).toEqual([
      "Too short.",
      "Needs a digit.",
    ]);
    wrapper.unmount();
  });
});

describe("Input", () => {
  it("works outside a field", () => {
    const wrapper = mount(Input, { props: { defaultValue: "hello" }, attrs: { placeholder: "Name" } });
    const input = wrapper.get("input").element as HTMLInputElement;

    expect(input.value).toBe("hello");
    expect(input.placeholder).toBe("Name");
    expect(input.hasAttribute("aria-describedby")).toBe(false);
    wrapper.unmount();
  });

  it("updates its model", async () => {
    const wrapper = mount(Input, { props: { modelValue: "", "onUpdate:modelValue": () => {} } });
    await wrapper.get("input").setValue("typed");

    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["typed"]);
    wrapper.unmount();
  });

  it("names itself with a floating label outside a field", () => {
    const wrapper = mount(InputFloating, { props: { label: "Email", class: "w-64" }, attrs: { name: "email" } });
    const input = wrapper.get("input");
    const label = wrapper.get("label");

    expect(input.attributes("id")).toBeTruthy();
    expect(label.attributes("for")).toBe(input.attributes("id"));
    expect(label.text()).toBe("Email");
    expect(input.attributes("name")).toBe("email");
    expect(input.attributes("placeholder")).toBe(" ");
    expect(wrapper.get("[data-slot=input-floating]").classes()).toContain("w-64");
    wrapper.unmount();
  });

  it("keeps a given placeholder and draws the notch only for outline", () => {
    const outline = mount(InputFloating, { props: { label: "Email" }, attrs: { placeholder: "ada@example.com" } });
    const filled = mount(InputFloating, { props: { label: "Email", variant: "filled" } });

    expect(outline.get("input").attributes("placeholder")).toBe("ada@example.com");
    expect(outline.get("fieldset").attributes("aria-hidden")).toBe("true");
    expect(outline.get("legend").text()).toBe("Email");
    expect(filled.find("fieldset").exists()).toBe(false);
    const soft = mount(InputFloating, { props: { label: "Email", variant: "soft" } });
    expect(soft.find("fieldset").exists()).toBe(false);
    soft.unmount();
    outline.unmount();
    filled.unmount();
  });

  it("wires a floating label into a field", async () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(Field, { required: true, invalid: true }, () => [
            h(InputFloating, { label: "Email" }),
            h(FieldDescription, () => "Receipts go here."),
          ]),
      }),
      { attachTo: document.body },
    );
    await nextTick();
    const input = wrapper.get("input");

    expect(wrapper.get("label").attributes("for")).toBe(input.attributes("id"));
    expect(wrapper.get("label span").attributes("aria-hidden")).toBe("true");
    expect(input.attributes("aria-describedby")).toBe(wrapper.get("[data-slot=field-description]").attributes("id"));
    expect(input.attributes("aria-invalid")).toBe("true");
    wrapper.unmount();
  });

  it("keeps the label up on inputs that always show their own controls", () => {
    const date = mount(InputFloating, { props: { label: "Start" }, attrs: { type: "date" } });
    const text = mount(InputFloating, { props: { label: "Name" } });

    expect(date.get("[data-slot=input-floating]").attributes("data-float")).toBe("true");
    expect(text.get("[data-slot=input-floating]").attributes("data-float")).toBeUndefined();
    date.unmount();
    text.unmount();
  });

  it("passes a stray label attribute through as an attribute of the input", () => {
    const wrapper = mount(Input, { attrs: { label: "Email" } });
    expect(wrapper.element.tagName).toBe("INPUT");
    expect(wrapper.find("label").exists()).toBe(false);
    expect(wrapper.attributes("label")).toBe("Email");
    wrapper.unmount();
  });
});
