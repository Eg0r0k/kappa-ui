import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import { Textarea } from "@/ui/textarea";

const lines = (count: number) => Array.from({ length: count }, (_, index) => `Line ${index + 1}`).join("\n");

describe("Textarea", () => {
  it("is three rows tall unless told otherwise and starts from its default value", () => {
    const wrapper = mount(Textarea, { props: { defaultValue: "hello" } });
    const textarea = wrapper.get("textarea").element as HTMLTextAreaElement;

    expect(textarea.rows).toBe(3);
    expect(textarea.value).toBe("hello");
    wrapper.unmount();

    const five = mount(Textarea, { props: { rows: 5 } });
    expect((five.get("textarea").element as HTMLTextAreaElement).rows).toBe(5);
    five.unmount();
  });

  it("takes its id, description, error and state from a field", async () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(Field, { invalid: true, required: true, disabled: true }, () => [
            h(FieldLabel, () => "Bio"),
            h(Textarea),
            h(FieldDescription, () => "Shown on your profile."),
            h(FieldError, { errors: "Too short." }),
          ]),
      }),
      { attachTo: document.body },
    );
    await nextTick();
    const textarea = wrapper.get("textarea");

    expect(wrapper.get("label").attributes("for")).toBe(textarea.attributes("id"));
    expect(textarea.attributes("aria-invalid")).toBe("true");
    expect(textarea.attributes("required")).toBeDefined();
    expect(textarea.attributes("disabled")).toBeDefined();
    expect(textarea.attributes("aria-describedby")).toBe(
      `${wrapper.get("[data-slot=field-description]").attributes("id")} ${wrapper.get("[data-slot=field-error]").attributes("id")}`,
    );
    wrapper.unmount();
  });

  it("grows with its text under autoresize and scrolls past maxrows", async () => {
    const value = ref("");
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(Textarea, {
            autoresize: true,
            rows: 2,
            maxrows: 5,
            modelValue: value.value,
            "onUpdate:modelValue": (next: unknown) => (value.value = next as string),
          }),
      }),
      { attachTo: document.body },
    );
    await nextTick();
    const textarea = wrapper.get("textarea").element as HTMLTextAreaElement;
    const lineHeight = Number.parseFloat(getComputedStyle(textarea).lineHeight);
    const empty = textarea.offsetHeight;

    value.value = lines(4);
    await nextTick();
    await nextTick();
    expect(textarea.offsetHeight).toBeCloseTo(empty + 2 * lineHeight, 0);
    expect(textarea.style.overflowY).toBe("hidden");

    value.value = lines(12);
    await nextTick();
    await nextTick();
    expect(textarea.offsetHeight).toBeCloseTo(empty + 3 * lineHeight, 0);
    expect(textarea.style.overflowY).toBe("");

    value.value = "";
    await nextTick();
    await nextTick();
    expect(textarea.offsetHeight).toBe(empty);
    wrapper.unmount();
  });

  it("keeps the height the rows give it without autoresize", async () => {
    const wrapper = mount(Textarea, { props: { rows: 2, modelValue: lines(10) }, attachTo: document.body });
    await nextTick();
    const textarea = wrapper.get("textarea").element as HTMLTextAreaElement;

    expect(textarea.style.height).toBe("");
    expect(textarea.scrollHeight).toBeGreaterThan(textarea.clientHeight);
    wrapper.unmount();
  });
});
