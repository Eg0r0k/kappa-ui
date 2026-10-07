import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { type ComponentPublicInstance, defineComponent, h, nextTick, ref } from "vue";

import FormischDemo from "@/examples/forms/FormischDemo.vue";
import { Input } from "@/ui/input";
import { InputFloating } from "@/ui/input-floating";

const settle = () => new Promise((resolve) => setTimeout(resolve, 100));

describe("Formisch", () => {
  it("shows every error on submit and focuses the first invalid field", async () => {
    mount(FormischDemo, { attachTo: document.body });
    document.querySelector<HTMLButtonElement>("button[type=submit]")!.click();
    await settle();
    await nextTick();

    const errors = [...document.querySelectorAll("[data-slot=field-error]")].map((error) => error.textContent);
    expect(errors).toEqual(["Bug title must be at least 5 characters.", "Description must be at least 20 characters."]);
    expect(document.querySelectorAll("[aria-invalid=true]")).toHaveLength(2);
    expect(document.activeElement).toBe(document.querySelector("input"));
  });

  it("exposes the native input as $el, with or without a floating label", async () => {
    const plain = ref<ComponentPublicInstance>();
    const floating = ref<ComponentPublicInstance>();
    mount(
      defineComponent({
        setup: () => () => [h(Input, { ref: plain }), h(InputFloating, { ref: floating, label: "Email" })],
      }),
      { attachTo: document.body },
    );
    await nextTick();

    expect(plain.value?.$el).toBeInstanceOf(HTMLInputElement);
    expect(floating.value?.$el).toBeInstanceOf(HTMLInputElement);
  });
});
