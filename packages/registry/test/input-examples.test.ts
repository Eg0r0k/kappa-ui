import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import { nextTick } from "vue";

import InputFloatingDemo from "@/examples/input-floating/InputFloatingDemo.vue";
import InputStates from "@/examples/input/InputStates.vue";

const invalidFields = (wrapper: ReturnType<typeof mount>) =>
  wrapper.findAll("[data-slot=field]").filter((field) => field.find("[data-slot=field-error]").exists());

it("clears the states example's email error once the address is complete", async () => {
  const wrapper = mount(InputStates, { attachTo: document.body });
  expect(invalidFields(wrapper)).toHaveLength(5);

  const [first] = invalidFields(wrapper);
  await first!.get("input").setValue("ada@example.com");
  await nextTick();

  expect(invalidFields(wrapper)).toHaveLength(4);
  expect(first!.get("input").attributes("aria-invalid")).not.toBe("true");
  wrapper.unmount();
});

it("clears the floating example's username error once it holds only letters, digits and hyphens", async () => {
  const wrapper = mount(InputFloatingDemo, { attachTo: document.body });
  expect(invalidFields(wrapper)).toHaveLength(5);

  const [first] = invalidFields(wrapper);
  await first!.get("input").setValue("ada-lovelace");
  await nextTick();

  expect(invalidFields(wrapper)).toHaveLength(4);
  expect(first!.get("input").attributes("aria-invalid")).not.toBe("true");
  wrapper.unmount();
});
