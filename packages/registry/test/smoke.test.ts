import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";

import { Button } from "@/ui/button";

it("mounts a registry component with Tailwind applied", () => {
  const wrapper = mount(Button, {
    attachTo: document.body,
    slots: { default: () => "Press" },
  });

  expect(wrapper.attributes("data-slot")).toBe("button");
  expect(getComputedStyle(wrapper.element).position).toBe("relative");

  wrapper.unmount();
});
