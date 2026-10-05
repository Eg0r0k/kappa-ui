import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, defineComponent, h, nextTick, ref } from "vue";

import { Button } from "@/ui/button";
import {
  Combobox,
  ComboboxAnchor,
  ComboboxCancel,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxViewport,
} from "@/ui/combobox";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";

import { controlSizes, overrideControlTokens, px, sentinel } from "./control-tokens";

afterEach(() => {
  document.body.innerHTML = "";
});

const colors = "--input: rgb(0, 0, 255); --primary: rgb(0, 128, 0)";

const fruits = ["Apple", "Banana", "Blueberry", "Cherry"];

const list = () =>
  h(ComboboxList, () =>
    h(ComboboxViewport, () => [
      h(ComboboxEmpty, () => "Nothing found"),
      ...fruits.map((fruit) =>
        h(ComboboxItem, { key: fruit, value: fruit, disabled: fruit === "Cherry" }, () => fruit),
      ),
    ]),
  );

const controlled = (
  initial: string | null | undefined,
  rootProps: Record<string, unknown>,
  children: () => VNode[],
) => {
  const value = ref(initial);
  mount(
    defineComponent(
      () => () =>
        h(
          Combobox,
          {
            style: colors,
            modelValue: value.value,
            "onUpdate:modelValue": (next: unknown) => {
              value.value = next as string | null;
            },
            ...rootProps,
          },
          children,
        ),
    ),
    { attachTo: document.body },
  );
  return value;
};

const input = () => document.querySelector<HTMLInputElement>("[data-slot=combobox-input]")!;
const anchor = () => document.querySelector<HTMLElement>("[data-slot=combobox-anchor]")!;
const items = () => [...document.querySelectorAll<HTMLElement>("[data-slot=combobox-item]")];

describe("Combobox", () => {
  it("takes its id, description, error and state from a field", async () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            "form",
            h(Field, { invalid: true, required: true }, () => [
              h(FieldLabel, () => "Fruit"),
              h(Combobox, { name: "fruit" }, () => [
                h(ComboboxAnchor, () => [h(ComboboxInput), h(ComboboxTrigger)]),
                list(),
              ]),
              h(FieldDescription, () => "Pick one."),
              h(FieldError, { errors: "Choose a fruit." }),
            ]),
          ),
      }),
      { attachTo: document.body },
    );
    await nextTick();

    expect(wrapper.get("label").attributes("for")).toBe(input().id);
    expect(input().getAttribute("role")).toBe("combobox");
    expect(input().getAttribute("aria-invalid")).toBe("true");
    expect(input().getAttribute("aria-required")).toBe("true");
    expect(input().getAttribute("aria-describedby")).toBe(
      `${wrapper.get("[data-slot=field-description]").attributes("id")} ${wrapper.get("[data-slot=field-error]").attributes("id")}`,
    );
    expect(document.querySelector("input[name=fruit]")).not.toBeNull();
    wrapper.unmount();
  });

  it("is disabled by a disabled field", () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(Field, { disabled: true }, () => [
            h(Combobox, () => [h(ComboboxAnchor, () => [h(ComboboxInput), h(ComboboxTrigger)]), list()]),
          ]),
      }),
    );

    expect(wrapper.get("[data-slot=combobox-input]").attributes("disabled")).toBeDefined();
    expect(wrapper.get("[data-slot=combobox-trigger]").attributes("disabled")).toBeDefined();
    wrapper.unmount();
  });

  it("filters as you type, skips disabled options and marks the chosen one", async () => {
    const value = controlled(undefined, {}, () => [
      h(ComboboxAnchor, () => [h(ComboboxInput, { "aria-label": "Fruit" }), h(ComboboxTrigger)]),
      list(),
    ]);

    await userEvent.click(input());
    await userEvent.keyboard("b");
    await expect.poll(() => items().map((item) => item.textContent)).toEqual(["Banana", "Blueberry"]);
    await userEvent.keyboard("lue");
    await expect.poll(() => items().map((item) => item.textContent)).toEqual(["Blueberry"]);
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => value.value).toBe("Blueberry");
    await expect.poll(() => document.querySelector("[data-slot=combobox-list]")).toBeNull();
    expect(input().value).toBe("Blueberry");

    await userEvent.keyboard("zzz");
    await expect.poll(() => document.querySelector("[data-slot=combobox-empty]")?.textContent).toBe("Nothing found");
    await userEvent.keyboard("{Escape}");

    await userEvent.click(document.querySelector<HTMLElement>("[data-slot=combobox-trigger]")!);
    await expect.poll(() => items().length).toBe(4);
    const chosen = items().find((item) => item.dataset.state === "checked");
    expect(chosen?.textContent).toBe("Blueberry");
    expect(chosen?.querySelector("[data-slot=combobox-item-indicator]")).not.toBeNull();

    expect(document.querySelector("[data-slot=combobox-item][data-highlighted]")?.textContent).toBe("Blueberry");
    await userEvent.keyboard("{ArrowDown}");
    expect(document.querySelector("[data-slot=combobox-item][data-highlighted]")?.textContent).not.toBe("Cherry");
    await userEvent.keyboard("{Escape}");
  });

  it("draws the input's frame, focused from the input inside it", async () => {
    controlled(undefined, {}, () => [
      h(ComboboxAnchor, { size: "xl" }, () => [h(ComboboxInput, { "aria-label": "Fruit" }), h(ComboboxTrigger)]),
      list(),
    ]);

    expect(anchor().offsetHeight).toBe(48);
    expect(getComputedStyle(anchor()).borderTopColor).toBe("rgb(0, 0, 255)");
    input().focus();
    await expect.poll(() => getComputedStyle(anchor()).borderTopColor).toBe("rgb(0, 128, 0)");
  });

  it("clears the text and the value, and hides the clear button while empty", async () => {
    const value = controlled("Banana", { resetModelValueOnClear: true }, () => [
      h(ComboboxAnchor, () => [
        h(ComboboxInput, { "aria-label": "Fruit", placeholder: "Pick a fruit" }),
        h(ComboboxCancel),
        h(ComboboxTrigger),
      ]),
      list(),
    ]);
    const cancel = document.querySelector<HTMLElement>("[data-slot=combobox-cancel]")!;

    await expect.poll(() => input().value).toBe("Banana");
    expect(getComputedStyle(cancel).display).not.toBe("none");
    expect(cancel.getAttribute("aria-label")).toBe("Clear");

    await userEvent.click(cancel);
    await expect.poll(() => value.value).toBeNull();
    expect(input().value).toBe("");
    expect(document.activeElement).toBe(input());
    expect(getComputedStyle(cancel).display).toBe("none");
  });

  it("opens from a button that keeps its own look and holds the search inside the list", async () => {
    const value = controlled(undefined, {}, () => [
      h(ComboboxAnchor, { asChild: true }, () =>
        h(ComboboxTrigger, { asChild: true }, () =>
          h(Button, { variant: "outline", class: "w-56" }, () => "Pick a fruit"),
        ),
      ),
      h(ComboboxList, () => [
        h(ComboboxInput, { "aria-label": "Search fruits" }),
        h(ComboboxViewport, () => fruits.map((fruit) => h(ComboboxItem, { key: fruit, value: fruit }, () => fruit))),
      ]),
    ]);
    const button = document.querySelector<HTMLButtonElement>("button")!;

    expect(button.tabIndex).toBe(0);
    expect(button.classList.contains("group/combobox-anchor")).toBe(false);
    expect(button.classList.contains("group/combobox-trigger")).toBe(false);

    button.focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => document.activeElement).toBe(input());
    const content = document.querySelector<HTMLElement>("[data-slot=combobox-list]")!;
    expect(getComputedStyle(input()).borderBottomWidth).toBe("1px");
    expect(input().offsetWidth).toBe(content.clientWidth);
    expect(content.offsetWidth).toBe(button.offsetWidth);

    await userEvent.keyboard("ch");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => value.value).toBe("Cherry");
    await expect.poll(() => document.activeElement).toBe(button);
  });
});

describe("Combobox control tokens", () => {
  overrideControlTokens();

  it.each(controlSizes)("the %s anchor reads its height and padding tokens", (size) => {
    controlled(undefined, {}, () => [
      h(ComboboxAnchor, { size }, () => [h(ComboboxInput, { "aria-label": "Fruit" }), h(ComboboxTrigger)]),
      list(),
    ]);

    expect(px(getComputedStyle(anchor()).height)).toBe(sentinel.height[size]);
    expect(px(getComputedStyle(input()).paddingInlineStart)).toBe(sentinel.padding[size]);
  });
});
