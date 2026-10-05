import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, defineComponent, h, nextTick, ref } from "vue";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText } from "@/ui/tags-input";

import { controlSizes, overrideControlTokens, px, sentinel } from "./control-tokens";

afterEach(() => {
  document.body.innerHTML = "";
});

const colors =
  "--input: rgb(0, 0, 255); --primary: rgb(0, 128, 0); --destructive: rgb(255, 0, 0); --disabled-opacity: 38%";

const chip = (value: string, props: Record<string, unknown> = {}) =>
  h(TagsInputItem, { value, key: value, ...props }, () => [h(TagsInputItemText), h(TagsInputItemDelete)]);

const tags = (
  props: Record<string, unknown> = {},
  items: string[] = ["Apple", "Banana"],
  inputProps: Record<string, unknown> = {},
) =>
  h(TagsInput, { style: colors, defaultValue: items, ...props }, () => [
    ...items.map((item) => chip(item)),
    h(TagsInputInput, inputProps),
  ]);

const render = (node: VNode) => mount({ render: () => node }, { attachTo: document.body });

const controlled = (initial: string[], props: Record<string, unknown> = {}) => {
  const value = ref(initial);
  const events: string[] = [];
  mount(
    defineComponent(
      () => () =>
        h(
          TagsInput,
          {
            style: colors,
            modelValue: value.value,
            "onUpdate:modelValue": (next: unknown) => {
              value.value = next as string[];
            },
            onAddTag: (tag: unknown) => events.push(`add:${tag}`),
            onRemoveTag: (tag: unknown) => events.push(`remove:${tag}`),
            onInvalid: (tag: unknown) => events.push(`invalid:${tag}`),
            ...props,
          },
          () => [...value.value.map((item) => chip(item)), h(TagsInputInput)],
        ),
    ),
    { attachTo: document.body },
  );
  return { value, events };
};

const root = () => document.querySelector<HTMLElement>("[data-slot=tags-input]")!;
const input = () => document.querySelector<HTMLInputElement>("[data-slot=tags-input-input]")!;
const chips = () => [...document.querySelectorAll<HTMLElement>("[data-slot=tags-input-item]")];
const deletes = () => [...document.querySelectorAll<HTMLButtonElement>("[data-slot=tags-input-item-delete]")];
const settle = () => new Promise((resolve) => setTimeout(resolve, 250));

it("renders the tags as badges and a text box inside one frame", () => {
  render(tags({ name: "fruits" }));
  expect(root().dataset.variant).toBe("outline");
  expect(root().dataset.size).toBe("md");
  expect(chips()).toHaveLength(2);
  expect(chips()[0]!.dataset.slot).toBe("tags-input-item");
  expect(chips()[0]!.dataset.variant).toBe("soft");
  expect(chips()[0]!.dataset.color).toBe("neutral");
  expect(chips()[0]!.querySelector("[data-slot=tags-input-item-text]")!.textContent).toBe("Apple");
  expect(deletes()[0]!.tagName).toBe("BUTTON");
  expect(deletes()[0]!.tabIndex).toBe(-1);
  expect(deletes()[0]!.querySelector("svg.lucide-x")).not.toBeNull();
  expect(input().parentElement).toBe(root());
  expect(input().type).toBe("text");
});

it("adds a tag on Enter or the delimiter and removes one with its button or Backspace", async () => {
  const { value, events } = controlled(["Apple", "Banana"]);
  await userEvent.click(input());
  await userEvent.keyboard("Cherry{Enter}");
  expect(value.value).toEqual(["Apple", "Banana", "Cherry"]);
  expect(input().value).toBe("");
  await userEvent.keyboard("Date,");
  expect(value.value).toEqual(["Apple", "Banana", "Cherry", "Date"]);
  await userEvent.click(deletes()[0]!);
  expect(value.value).toEqual(["Banana", "Cherry", "Date"]);
  await userEvent.click(input());
  await userEvent.keyboard("{Backspace}");
  expect(chips().at(-1)!.dataset.state).toBe("active");
  expect(getComputedStyle(chips().at(-1)!).outlineStyle).toBe("solid");
  await userEvent.keyboard("{Backspace}");
  expect(value.value).toEqual(["Banana", "Cherry"]);
  expect(events).toEqual(["add:Cherry", "add:Date", "remove:Apple", "remove:Date"]);
});

it("refuses a duplicate and a tag past max, and reports them as invalid", async () => {
  const { value, events } = controlled(["Apple", "Banana"], { max: 3 });
  await userEvent.click(input());
  await userEvent.keyboard("Apple{Enter}");
  expect(value.value).toEqual(["Apple", "Banana"]);
  expect(root().dataset.invalid).toBe("");
  await userEvent.keyboard("{Control>}a{/Control}Cherry{Enter}");
  expect(value.value).toEqual(["Apple", "Banana", "Cherry"]);
  await userEvent.keyboard("Date{Enter}");
  expect(value.value).toEqual(["Apple", "Banana", "Cherry"]);
  expect(events).toEqual(["invalid:Apple", "add:Cherry", "invalid:Date"]);
});

it("splits pasted text on the delimiter with addOnPaste", async () => {
  const { value } = controlled([], { addOnPaste: true });
  const data = new DataTransfer();
  data.setData("text", "Cherry,Date");
  input().dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
  await nextTick();
  expect(value.value).toEqual(["Cherry", "Date"]);
});

it.each([
  ["xs", 28, 20, 8],
  ["sm", 32, 24, 10],
  ["md", 36, 24, 12],
  ["lg", 40, 28, 12],
  ["xl", 48, 32, 16],
] as const)(
  "at %s the frame is %ipx tall with %ipx chips and the input text %ipx from the edge",
  (size, frame, tag, pad) => {
    render(tags({ size }));
    expect(root().offsetHeight).toBe(frame);
    const box = chips()[0]!.getBoundingClientRect();
    expect(box.height).toBe(tag);
    const inset = (frame - tag) / 2;
    const frameBox = root().getBoundingClientRect();
    expect(box.left - frameBox.left).toBeCloseTo(inset, 1);
    expect(box.top - frameBox.top).toBeCloseTo(inset, 1);
    const outer = Number.parseFloat(getComputedStyle(root()).borderTopLeftRadius);
    expect(Number.parseFloat(getComputedStyle(chips()[0]!).borderTopLeftRadius)).toBeCloseTo(outer - inset, 1);
    document.body.innerHTML = "";

    render(tags({ size }, []));
    expect(root().offsetHeight).toBe(frame);
    expect(input().offsetHeight).toBe(tag);
    const text = input().getBoundingClientRect().left + Number.parseFloat(getComputedStyle(input()).paddingLeft);
    expect(text - root().getBoundingClientRect().left).toBeCloseTo(pad + 1, 1);
  },
);

it("wraps the tags onto more lines", () => {
  render(
    tags(
      { class: "w-64" },
      Array.from({ length: 10 }, (_, index) => `Long tag number ${index + 1}`),
    ),
  );
  expect(root().offsetHeight).toBeGreaterThan(72);
  expect(input().getBoundingClientRect().top).toBeGreaterThan(chips()[0]!.getBoundingClientRect().bottom);
});

it("takes the text control variants", () => {
  render(tags({ variant: "soft" }));
  expect(root().dataset.variant).toBe("soft");
  expect(root().className).toContain("bg-muted");
  expect(getComputedStyle(root()).borderTopColor).toBe("rgba(0, 0, 0, 0)");
});

it("rings the frame while the input has focus and turns it destructive when invalid", async () => {
  render(tags());
  expect(getComputedStyle(root()).borderTopColor).toBe("rgb(0, 0, 255)");
  input().focus();
  await settle();
  expect(getComputedStyle(root()).borderTopColor).toBe("rgb(0, 128, 0)");
  expect(getComputedStyle(root()).boxShadow).not.toBe("none");
  document.body.innerHTML = "";

  render(tags({}, ["Apple"], { "aria-invalid": "true" }));
  expect(getComputedStyle(root()).borderTopColor).toBe("rgb(255, 0, 0)");
});

it("lets a tag take a badge variant and colour", () => {
  render(h(TagsInput, { defaultValue: ["Apple"] }, () => [chip("Apple", { variant: "solid", color: "primary" })]));
  expect(chips()[0]!.dataset.variant).toBe("solid");
  expect(chips()[0]!.dataset.color).toBe("primary");
});

it("takes its id, description, error and state from a surrounding field", async () => {
  render(
    h(Field, { invalid: true, required: true }, () => [
      h(FieldLabel, () => "Fruits"),
      tags(),
      h(FieldDescription, () => "Press Enter after each one."),
      h(FieldError, { errors: "Add at least three." }),
    ]),
  );
  await nextTick();
  const label = document.querySelector<HTMLElement>("[data-slot=field-label]")!;
  const description = document.querySelector<HTMLElement>("[data-slot=field-description]")!;
  const error = document.querySelector<HTMLElement>("[data-slot=field-error]")!;
  expect(input().id).toBe(label.getAttribute("for"));
  expect(input().getAttribute("aria-describedby")).toBe(`${description.id} ${error.id}`);
  expect(input().getAttribute("aria-invalid")).toBe("true");
  expect(input().getAttribute("aria-required")).toBe("true");
  expect(input().required).toBe(false);
  expect(getComputedStyle(root()).borderTopColor).toBe("rgb(255, 0, 0)");
  document.body.innerHTML = "";

  render(h(Field, { disabled: true }, () => [h(FieldLabel, () => "Fruits"), tags()]));
  await nextTick();
  expect(input().disabled).toBe(true);
  expect(chips()[0]!.dataset.disabled).toBe("");
  expect(deletes()[0]!.dataset.disabled).toBe("");
});

it("exposes the input element through the part's ref", async () => {
  let exposed: unknown;
  render(
    h(TagsInput, {}, () => [
      h(TagsInputInput, {
        ref: (el: unknown) => {
          exposed = el;
        },
      }),
    ]),
  );
  await nextTick();
  expect((exposed as { $el: HTMLElement }).$el).toBe(input());
});

describe("TagsInput control tokens", () => {
  overrideControlTokens();

  const inset = { xs: 4, sm: 4, md: 6, lg: 6, xl: 8 };

  it.each(controlSizes)("%s reads its minimum height and padding tokens", (size) => {
    render(tags({ size }, []));

    expect(px(getComputedStyle(root()).minHeight)).toBe(sentinel.height[size]);
    expect(px(getComputedStyle(input()).paddingInlineStart)).toBe(sentinel.padding[size] - inset[size] + 1);
  });
});
