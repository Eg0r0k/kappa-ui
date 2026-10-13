import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { h, nextTick } from "vue";

import { Editable, EditableArea, EditableInput, EditablePreview } from "@/ui/editable";

const wrappers: { unmount: () => void }[] = [];

afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
});

const render = (props: Record<string, unknown> = {}) => {
  const wrapper = mount(
    {
      render: () =>
        h("div", { style: "font-size: 32px" }, [
          h(Editable, { defaultValue: "Roadmap", ...props }, () =>
            h(EditableArea, () => [h(EditablePreview), h(EditableInput)]),
          ),
        ]),
    },
    { attachTo: document.body },
  );
  wrappers.push(wrapper);
  return wrapper;
};

const slot = (name: string) => document.querySelector<HTMLElement>(`[data-slot=${name}]`)!;
const input = () => slot("editable-input") as HTMLInputElement;
const editing = () => slot("editable-area").hasAttribute("data-focus");
const settle = async () => {
  await nextTick();
  await new Promise((resolve) => requestAnimationFrame(resolve));
};

it("shows the value, and the placeholder while it is empty, on slotted parts", async () => {
  render();
  for (const name of ["editable", "editable-area", "editable-preview", "editable-input"]) {
    expect(document.querySelector(`[data-slot=${name}]`), name).not.toBeNull();
  }
  expect(slot("editable-preview").textContent).toBe("Roadmap");
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  render({ defaultValue: "", placeholder: "Untitled" });
  await settle();
  expect(slot("editable-preview").textContent).toBe("Untitled");
  expect(slot("editable-area").hasAttribute("data-empty")).toBe(true);
});

it("inherits the surrounding type", () => {
  render();
  expect(getComputedStyle(slot("editable-preview")).fontSize).toBe("32px");
  expect(getComputedStyle(input()).fontSize).toBe("32px");
});

it("enters editing on focus, submits with Enter and reports the value", async () => {
  const updates: unknown[] = [];
  const submits: unknown[] = [];
  render({
    submitMode: "both",
    "onUpdate:modelValue": (value: unknown) => updates.push(value),
    onSubmit: (value: unknown) => submits.push(value),
  });
  await userEvent.click(slot("editable-preview"));
  await settle();
  expect(editing()).toBe(true);
  await userEvent.clear(input());
  await userEvent.type(input(), "Plan");
  await userEvent.keyboard("{Enter}");
  await settle();
  expect(editing()).toBe(false);
  expect(submits.at(-1)).toBe("Plan");
  expect(updates.at(-1)).toBe("Plan");
  expect(slot("editable-preview").textContent).toBe("Plan");
});

it("cancels with Escape and keeps the old value", async () => {
  render({ submitMode: "both" });
  await userEvent.click(slot("editable-preview"));
  await settle();
  await userEvent.type(input(), " draft");
  await userEvent.keyboard("{Escape}");
  await settle();
  expect(editing()).toBe(false);
  expect(slot("editable-preview").textContent).toBe("Roadmap");
});

it.each(["{Enter}", "{Escape}"])("gives focus back to the preview after %s", async (key) => {
  render({ submitMode: "both" });
  await userEvent.click(slot("editable-preview"));
  await settle();
  await userEvent.type(input(), "x");
  await userEvent.keyboard(key);
  await settle();
  await settle();
  expect(document.activeElement).toBe(slot("editable-preview"));
  expect(editing()).toBe(false);
});

it("saves on Enter without submitting the form it sits in", async () => {
  let submits = 0;
  const saved: unknown[] = [];
  const wrapper = mount(
    {
      render: () =>
        h(
          "form",
          {
            onSubmit: (event: Event) => {
              event.preventDefault();
              submits++;
            },
          },
          [
            h(
              Editable,
              { defaultValue: "a", submitMode: "enter", onSubmit: (value: unknown) => saved.push(value) },
              () => h(EditableArea, () => [h(EditablePreview), h(EditableInput)]),
            ),
            h("button", { type: "submit" }, "Save"),
          ],
        ),
    },
    { attachTo: document.body },
  );
  wrappers.push(wrapper);
  await userEvent.click(slot("editable-preview"));
  await settle();
  await userEvent.type(input(), "b");
  await userEvent.keyboard("{Enter}");
  await settle();
  expect(saved).toEqual(["ab"]);
  expect(submits).toBe(0);
});

it("waits for a double click with activation-mode dblclick", async () => {
  render({ activationMode: "dblclick" });
  await userEvent.click(slot("editable-preview"));
  await settle();
  expect(editing()).toBe(false);
  await userEvent.dblClick(slot("editable-preview"));
  await settle();
  expect(editing()).toBe(true);
});

it("lets a readonly value be focused and selected but not changed, and a disabled one not edited", async () => {
  render({ readonly: true, submitMode: "both" });
  await userEvent.click(slot("editable-preview"));
  await settle();
  expect(slot("editable-area").hasAttribute("data-readonly")).toBe(true);
  expect(input().readOnly).toBe(true);
  await userEvent.type(input(), "X");
  await userEvent.keyboard("{Enter}");
  await settle();
  expect(slot("editable-preview").textContent).toBe("Roadmap");
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  render({ disabled: true });
  await settle();
  expect(slot("editable-preview").tabIndex).toBe(-1);
  expect(getComputedStyle(slot("editable-preview")).pointerEvents).toBe("none");
  expect(editing()).toBe(false);
  expect(slot("editable-area").hasAttribute("data-disabled")).toBe(true);
  expect(input().disabled).toBe(true);
});

it("keeps the box the same width when it switches to the input", async () => {
  render();
  await settle();
  const before = slot("editable-area").getBoundingClientRect().width;
  await userEvent.click(slot("editable-preview"));
  await settle();
  expect(editing()).toBe(true);
  expect(slot("editable-area").getBoundingClientRect().width).toBe(before);
});

it("sizes the box to its text and grows it while typing", async () => {
  render();
  await settle();
  const range = document.createRange();
  range.selectNodeContents(slot("editable-preview"));
  const text = range.getBoundingClientRect().width;
  const box = () => slot("editable-area").getBoundingClientRect().width;
  expect(box()).toBeLessThan(text + 16);
  await userEvent.click(slot("editable-preview"));
  await settle();
  const before = box();
  await userEvent.type(input(), " for the whole team");
  await settle();
  expect(box()).toBeGreaterThan(before + 100);
});

it("drops the draft when editing is cancelled, so the box fits the old text again", async () => {
  render({ submitMode: "enter" });
  await settle();
  const before = slot("editable-area").getBoundingClientRect().width;
  await userEvent.click(slot("editable-preview"));
  await settle();
  await userEvent.type(input(), " that nobody saved after all");
  await userEvent.keyboard("{Escape}");
  await settle();
  expect(slot("editable-preview").textContent).toBe("Roadmap");
  expect(slot("editable-area").getBoundingClientRect().width).toBe(before);
});

it("applies width, background and font classes on the input, sized by the kit or not", async () => {
  const probe = mount(() => h("div", { class: "w-40 bg-red-500 font-mono" }), { attachTo: document.body });
  const reference = getComputedStyle(probe.element as HTMLElement);
  const expected = { width: reference.width, background: reference.backgroundColor, font: reference.fontFamily };
  probe.unmount();

  const read = async (autoResize: boolean) => {
    const wrapper = mount(
      () =>
        h(Editable, { defaultValue: "Roadmap", autoResize }, () =>
          h(EditableArea, () => [
            h(EditablePreview),
            h(EditableInput, { "aria-label": "Title", class: "w-40 bg-red-500 font-mono" }),
          ]),
        ),
      { attachTo: document.body },
    );
    await userEvent.click(slot("editable-preview"));
    await settle();
    expect(editing()).toBe(true);
    expect(input().getAttribute("style")).toBeNull();
    const style = getComputedStyle(input());
    const result = { width: style.width, background: style.backgroundColor, font: style.fontFamily };
    wrapper.unmount();
    return result;
  };
  expect(await read(true)).toEqual(expected);
  expect(await read(false)).toEqual(expected);
});

it("swaps the text for the field without a shared box when auto-resize is off", async () => {
  render({ autoResize: false });
  await settle();
  expect(getComputedStyle(slot("editable-area")).display).toBe("block");
  expect(input().hidden).toBe(true);
  expect(slot("editable-preview").hidden).toBe(false);
  await userEvent.click(slot("editable-preview"));
  await settle();
  expect(editing()).toBe(true);
  expect(input().hidden).toBe(false);
  expect(slot("editable-preview").hidden).toBe(true);
});
