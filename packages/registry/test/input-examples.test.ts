import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";

import InputFloatingDemo from "@/examples/input-floating/InputFloatingDemo.vue";
import { Field, FieldError, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";

const invalidFields = (wrapper: ReturnType<typeof mount>) =>
  wrapper.findAll("[data-slot=field]").filter((field) => field.find("[data-slot=field-error]").exists());

const complete = (email: string) => /^[^s@]+@[^s@.]+(?:.[^s@.]+)+$/.test(email);

it("clears a field's email error once the address is complete", async () => {
  const email = ref("ada@");
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(Field, { invalid: !complete(email.value) }, () => [
          h(FieldLabel, () => "Email"),
          h(Input, {
            modelValue: email.value,
            "onUpdate:modelValue": (next: unknown) => (email.value = next as string),
          }),
          complete(email.value) ? null : h(FieldError, { errors: "Enter a complete email address." }),
        ]),
    }),
    { attachTo: document.body },
  );
  expect(invalidFields(wrapper)).toHaveLength(1);

  await wrapper.get("input").setValue("ada@example.com");
  await nextTick();

  expect(invalidFields(wrapper)).toHaveLength(0);
  expect(wrapper.get("input").attributes("aria-invalid")).not.toBe("true");
  wrapper.unmount();
});

it("clears the floating example's username error once it holds only letters, digits and hyphens", async () => {
  const wrapper = mount(InputFloatingDemo, { attachTo: document.body });
  expect(invalidFields(wrapper)).toHaveLength(1);

  const [first] = invalidFields(wrapper);
  await first!.get("input").setValue("ada-lovelace");
  await nextTick();

  expect(invalidFields(wrapper)).toHaveLength(0);
  expect(first!.get("input").attributes("aria-invalid")).not.toBe("true");
  wrapper.unmount();
});
