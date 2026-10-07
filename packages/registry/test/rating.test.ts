import "./setup.css";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, createSSRApp, defineComponent, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";

import { Field, FieldDescription, FieldError, FieldLabel, FieldSet } from "@/ui/field";
import { Rating, RatingDisplay, RatingDisplayItem, RatingItem } from "@/ui/rating";

import { controlSizes, overrideControlTokens, sentinel } from "./control-tokens";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const stars = ({ items }: { items: number[] }) => items.map((item) => h(RatingItem, { key: item, item }));
const pictures = ({ items }: { items: number[] }) => items.map((item) => h(RatingDisplayItem, { key: item, item }));

// readonly renders the display parts, with the value from modelValue
const render = (props: Record<string, unknown> = {}, wrap?: (rating: VNode) => VNode) => {
  const value = ref(props.modelValue as number | undefined);
  const hovers: number[] = [];
  const updates: number[] = [];
  const bound = "modelValue" in props;
  const wrapper = mount(
    defineComponent({
      setup: () => () => {
        const { readonly, modelValue, ...rest } = props;
        const rating = readonly
          ? h(RatingDisplay, { ...rest, value: modelValue as number }, { default: pictures })
          : h(
              Rating,
              {
                ...rest,
                ...(bound && { modelValue: value.value }),
                "onUpdate:modelValue": (next: number | undefined) => {
                  updates.push(next!);
                  if (bound) value.value = next;
                },
                onHover: (next: number) => hovers.push(next),
              },
              { default: stars },
            );
        return wrap ? wrap(rating) : rating;
      },
    }),
    { attachTo: document.body },
  );
  const root = () => document.querySelector<HTMLElement>("[data-slot=rating], [data-slot=rating-display]")!;
  const radios = () => [...document.querySelectorAll<HTMLButtonElement>("button[role=radio]")];
  const radio = (step: number) => radios().find((button) => button.value === String(step))!;
  const items = () => [...document.querySelectorAll<HTMLElement>("[data-slot=rating-item]")];
  const active = () => radios().flatMap((button) => (button.dataset.state === "active" ? [+button.value] : []));
  const checked = () => radios().flatMap((button) => (button.ariaChecked === "true" ? [+button.value] : []));
  return { wrapper, value, hovers, updates, root, radios, radio, items, active, checked };
};

// Reka selects the radio an arrow key moves to in a timeout after focus, while the key is still down.
const holdKey = async (key: string) => {
  await userEvent.keyboard(`{${key}>}`);
  await wait(20);
  await userEvent.keyboard(`{/${key}}`);
  await nextTick();
};

const tabIn = async () => {
  const before = document.body.insertBefore(document.createElement("button"), document.body.firstChild);
  before.focus();
  await userEvent.tab();
};

const center = (element: Element) => {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, rect };
};

const svg = (element: Element) => getComputedStyle(element.querySelector("svg")!);
const filledIcon = (step: number, scope: ParentNode = document) =>
  scope.querySelector(`button[value="${step}"] [data-slot=rating-icon]`)!;

describe("Rating", () => {
  it("renders a radiogroup with one labelled radio per step", async () => {
    const { root, radios, checked, active } = render({ modelValue: 3 });
    await nextTick();

    expect(root().getAttribute("role")).toBe("radiogroup");
    expect(radios().map((radio) => radio.getAttribute("aria-label"))).toEqual([
      "1 out of 5",
      "2 out of 5",
      "3 out of 5",
      "4 out of 5",
      "5 out of 5",
    ]);
    expect(checked()).toEqual([3]);
    expect(active()).toEqual([1, 2, 3]);
  });

  it("renders a radio per step for fractional steps", async () => {
    const { radios, radio, wrapper } = render({ step: 0.5, length: 5 });
    expect(radios()).toHaveLength(10);
    expect(radio(2.5).getAttribute("aria-label")).toBe("2.5 out of 5");
    wrapper.unmount();

    const tenths = render({ step: 0.1, length: 5 });
    expect(tenths.radios()).toHaveLength(50);
  });

  it("takes the step names from labels.item", () => {
    const { radios } = render({ length: 3, labels: { item: (value: number) => `${value} stars` } });
    expect(radios().map((radio) => radio.getAttribute("aria-label"))).toEqual(["1 stars", "2 stars", "3 stars"]);
  });

  it("selects the clicked step and updates v-model", async () => {
    const { radio, value, checked, active } = render({ modelValue: 1 });

    radio(4).click();
    await nextTick();
    expect(value.value).toBe(4);
    expect(checked()).toEqual([4]);
    expect(active()).toEqual([1, 2, 3, 4]);
  });

  it("starts from defaultValue without v-model", async () => {
    const { radio, active, updates } = render({ defaultValue: 2 });
    expect(active()).toEqual([1, 2]);

    radio(5).click();
    await nextTick();
    expect(active()).toEqual([1, 2, 3, 4, 5]);
    expect(updates).toEqual([5]);
  });

  it("emits nothing on mount when bound to undefined", async () => {
    const { updates, active } = render({ modelValue: undefined });
    await nextTick();
    await wait(20);

    expect(updates).toEqual([]);
    expect(active()).toEqual([]);
  });

  it("clears to 0 on the selected step when clearable, by click or Space", async () => {
    const { radio, value, active } = render({ modelValue: 3, clearable: true });

    radio(3).click();
    await nextTick();
    expect(value.value).toBe(0);
    expect(active()).toEqual([]);

    radio(2).click();
    await nextTick();
    radio(2).focus();
    await userEvent.keyboard(" ");
    await nextTick();
    expect(value.value).toBe(0);
  });

  it.each([undefined, 0, 2])(
    "keeps showing the model when the parent turns an update down (from %s)",
    async (start) => {
      const updates: number[] = [];
      mount(
        defineComponent({
          setup: () => () =>
            h(
              Rating,
              {
                modelValue: start,
                "onUpdate:modelValue": (next?: number) => updates.push(next!),
                clearable: true,
              },
              { default: stars },
            ),
        }),
        { attachTo: document.body },
      );
      const radio = (step: number) => document.querySelector<HTMLButtonElement>(`button[value="${step}"]`)!;
      const active = () => document.querySelectorAll("button[data-state=active]").length;

      radio(4).click();
      await nextTick();
      expect(updates).toEqual([4]);
      expect(active()).toBe(start ?? 0);

      if (start) {
        radio(start).click();
        await nextTick();
        expect(updates).toEqual([4, 0]);
        expect(active()).toBe(start);
      }
    },
  );

  it("keeps the value on the selected step without clearable", async () => {
    const { radio, value } = render({ modelValue: 3 });

    radio(3).click();
    await nextTick();
    expect(value.value).toBe(3);
  });
});

describe("Rating keyboard", () => {
  it("is one tab stop that lands on the checked step, or on the first one", async () => {
    const { radio, wrapper } = render({ modelValue: 3 });
    await tabIn();
    expect(document.activeElement).toBe(radio(3));
    wrapper.unmount();
    document.body.innerHTML = "";

    const empty = render({ modelValue: 0 });
    await tabIn();
    expect(document.activeElement).toBe(empty.radio(1));
    expect(empty.value.value).toBe(0);
  });

  it("moves and selects with ArrowRight and ArrowLeft, without wrapping", async () => {
    const { radio, value } = render({ modelValue: 4 });
    radio(4).focus();

    await holdKey("ArrowRight");
    expect(value.value).toBe(5);
    await holdKey("ArrowRight");
    expect(value.value).toBe(5);
    expect(document.activeElement).toBe(radio(5));

    await holdKey("ArrowLeft");
    expect(value.value).toBe(4);
  });

  it("picks the second step with ArrowRight from nothing, as a radio group does", async () => {
    const { value } = render({ modelValue: 0 });
    await tabIn();

    await holdKey("ArrowRight");
    expect(value.value).toBe(2);
  });

  it("ignores ArrowUp and ArrowDown when horizontal and uses them when vertical", async () => {
    const horizontal = render({ modelValue: 2 });
    horizontal.radio(2).focus();
    await holdKey("ArrowDown");
    await holdKey("ArrowUp");
    expect(horizontal.value.value).toBe(2);
    horizontal.wrapper.unmount();
    document.body.innerHTML = "";

    const vertical = render({ modelValue: 2, orientation: "vertical" });
    vertical.radio(2).focus();
    await holdKey("ArrowDown");
    expect(vertical.value.value).toBe(3);
    await holdKey("ArrowUp");
    expect(vertical.value.value).toBe(2);
  });

  it("swaps ArrowLeft and ArrowRight in rtl", async () => {
    const { radio, value } = render({ modelValue: 2, dir: "rtl" });
    radio(2).focus();

    await holdKey("ArrowLeft");
    expect(value.value).toBe(3);
    await holdKey("ArrowRight");
    expect(value.value).toBe(2);
  });

  it("moves focus with Home, End, PageUp and PageDown without selecting", async () => {
    const { radio, value } = render({ modelValue: 3 });
    radio(3).focus();

    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(radio(5));
    await userEvent.keyboard("{Home}");
    expect(document.activeElement).toBe(radio(1));
    await userEvent.keyboard("{PageDown}");
    expect(document.activeElement).toBe(radio(5));
    await userEvent.keyboard("{PageUp}");
    expect(document.activeElement).toBe(radio(1));
    await wait(20);
    expect(value.value).toBe(3);
  });

  it("does not submit the form on Enter", async () => {
    const submit = vi.fn((event: Event) => event.preventDefault());
    const { radio } = render({ modelValue: 3 }, (rating) =>
      h("form", { onSubmit: submit }, [rating, h("button", { type: "submit" }, "Send")]),
    );
    radio(3).focus();

    await userEvent.keyboard("{Enter}");
    expect(submit).not.toHaveBeenCalled();
  });
});

describe("Rating half steps", () => {
  it("splits a star into a start half and an end half", async () => {
    const { items, radio, value } = render({ modelValue: 1, step: 0.5 });
    const { rect, y } = center(items()[2]);

    const startHalf = document.elementFromPoint(rect.left + rect.width * 0.25, y);
    const endHalf = document.elementFromPoint(rect.left + rect.width * 0.75, y);
    expect(startHalf).toBe(radio(2.5));
    expect(endHalf).toBe(radio(3));

    (startHalf as HTMLElement).click();
    await nextTick();
    expect(value.value).toBe(2.5);
    (endHalf as HTMLElement).click();
    await nextTick();
    expect(value.value).toBe(3);
  });

  it("puts the first half on the right in rtl", async () => {
    const { items, radio } = render({ modelValue: 1, step: 0.5, dir: "rtl" });
    const { rect, y } = center(items()[2]);

    expect(document.elementFromPoint(rect.left + rect.width * 0.75, y)).toBe(radio(2.5));
    expect(document.elementFromPoint(rect.left + rect.width * 0.25, y)).toBe(radio(3));
  });

  it("fills exactly half a star for a half value", async () => {
    const { items, radio } = render({ modelValue: 2.5, step: 0.5 });
    await nextTick();
    const clip = radio(2.5).firstElementChild!;

    expect(clip.getBoundingClientRect().width).toBeCloseTo(items()[2].getBoundingClientRect().width / 2, 1);
    expect(getComputedStyle(filledIcon(2.5)).opacity).toBe("1");
    expect(getComputedStyle(filledIcon(3)).opacity).toBe("0");
  });
});

describe("Rating hover", () => {
  const park = () => {
    const spot = document.body.appendChild(document.createElement("div"));
    spot.style.cssText = "height: 40px";
    return spot;
  };

  it("previews under a mouse and goes back to the value on leaving (nuxt/ui#6746)", async () => {
    const spot = park();
    const { radio, items, active, hovers } = render({ modelValue: 2, hoverable: true });
    await userEvent.hover(spot);

    await userEvent.hover(radio(4));
    await nextTick();
    expect(active()).toEqual([1, 2, 3, 4]);
    expect(items()[3].dataset.hovered).toBe("true");

    await userEvent.hover(spot);
    await nextTick();
    expect(active()).toEqual([1, 2]);
    expect(items().some((item) => item.dataset.hovered)).toBe(false);
    expect(hovers).toEqual([4, 0]);
  });

  it("does not preview without hoverable", async () => {
    const spot = park();
    const { radio, active, hovers } = render({ modelValue: 2 });
    await userEvent.hover(spot);

    await userEvent.hover(radio(4));
    await nextTick();
    expect(active()).toEqual([1, 2]);
    expect(hovers).toEqual([]);
  });

  it("neither previews nor shows the hover layer for a touch", async () => {
    const { radio, items, active, hovers } = render({ modelValue: 2, hoverable: true });
    const target = radio(4);
    const init = { bubbles: true, pointerType: "touch" };

    target.dispatchEvent(new PointerEvent("pointerover", init));
    items()[3].dispatchEvent(new PointerEvent("pointerenter", { pointerType: "touch" }));
    target.dispatchEvent(new MouseEvent("mouseenter"));
    await nextTick();

    expect(active()).toEqual([1, 2]);
    expect(items()[3].dataset.hovered).toBeUndefined();
    expect(hovers).toEqual([]);
  });
});

describe("Rating colours", () => {
  const BLUE = "rgb(0, 0, 255)";
  const GREY = "rgb(128, 128, 128)";
  const RED = "rgb(255, 0, 0)";
  const AMBER = "rgb(255, 200, 0)";
  const BROWN = "rgb(150, 100, 0)";
  const palette = [
    `--primary: ${BLUE}`,
    "--foreground: rgb(0, 128, 0)",
    "--background: rgb(255, 255, 255)",
    `--input: ${GREY}`,
    `--destructive: ${RED}`,
    `--warning: ${AMBER}`,
    `--warning-text: ${BROWN}`,
  ].join(";");

  const paint = (props: Record<string, unknown>) => {
    const result = render({ modelValue: 2, ...props }, (rating) => h("div", { style: palette }, [rating]));
    const filled = svg(filledIcon(1));
    const empty = svg(result.items()[4].querySelector("[data-slot=rating-empty-icon]")!);
    return { ...result, filled, empty };
  };

  it("fills in the primary tone and outlines empty steps with the input colour", () => {
    const { root, filled, empty } = paint({});

    expect(root().dataset.color).toBe("primary");
    expect(filled.fill).toBe(BLUE);
    expect(filled.stroke).toBe(BLUE);
    expect(empty.fill).toBe("none");
    expect(empty.stroke).toBe(GREY);
  });

  it("fills a warning rating amber with a darker edge and keeps the empty outline grey", () => {
    const { root, filled, empty } = paint({ color: "warning" });

    expect(root().dataset.color).toBe("warning");
    expect(filled.fill).toBe(AMBER);
    expect(filled.stroke).toBe(BROWN);
    expect(empty.stroke).toBe(GREY);
  });

  it("turns destructive when invalid, whatever its colour", () => {
    const { root, filled, empty } = paint({ color: "warning", "aria-invalid": "true" });

    expect(root().getAttribute("aria-invalid")).toBe("true");
    expect(filled.fill).toBe(RED);
    expect(empty.stroke).toBe(RED);
  });

  it("draws a disabled rating in one opaque grey", () => {
    const { filled, empty, radios } = paint({ disabled: true });

    expect(radios().every((radio) => radio.disabled)).toBe(true);
    expect(filled.fill).toBe(filled.stroke);
    expect(empty.stroke).toBe(filled.fill);
    expect(filled.fill).not.toMatch(/\/|rgba|transparent/);
  });

  it("takes a tone of its own from the class", () => {
    const { filled } = paint({ class: "[--tone:rgb(1,2,3)]" });
    expect(filled.fill).toBe("rgb(1, 2, 3)");
  });

  // reka-ui #2964: before 2.11, a server render shows every half step, which the client then keeps. With opaque
  // colours and transparent unfilled glyphs, a half step painted over its full step looks the same.
  it.each([{}, { disabled: true }])("looks the same with every half step shown (%o)", async (extra) => {
    const style = document.head.appendChild(document.createElement("style"));
    style.textContent = "[data-slot=rating-indicator] { --reka-rating-item-step-opacity: 1 !important }";
    paint({ modelValue: 3, step: 0.5, ...extra });
    await nextTick();

    const half = svg(filledIcon(2.5));
    const full = svg(filledIcon(3));
    expect(getComputedStyle(filledIcon(2.5)).opacity).toBe("1");
    expect(half.fill).toBe(full.fill);
    expect(half.stroke).toBe(full.stroke);
    expect(half.fill).not.toMatch(/\/|rgba|transparent/);
    expect(getComputedStyle(filledIcon(3.5)).opacity).toBe("0");
    style.remove();
  });
});

describe("Rating SSR", () => {
  it("hydrates half steps without warnings", async () => {
    const app = () => createSSRApp({ render: () => h(Rating, { modelValue: 3, step: 0.5 }, { default: stars }) });
    const container = document.body.appendChild(document.createElement("div"));
    container.innerHTML = await renderToString(app());

    const warn = vi.spyOn(console, "warn");
    app().mount(container);
    await nextTick();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();

    const half = container.querySelector<HTMLElement>('button[value="2.5"]')!;
    expect(half.style.getPropertyValue("--reka-rating-item-step-opacity")).toBe("0");
  });
});

describe("Rating in a field", () => {
  const inField = (fieldProps: Record<string, unknown> = {}, props: Record<string, unknown> = {}) =>
    render({ modelValue: 2, ...props }, (rating) =>
      h(Field, fieldProps, () => [
        h(FieldLabel, () => "Your stay"),
        rating,
        h(FieldDescription, () => "Tap a star."),
        h(FieldError, { errors: fieldProps.invalid ? "Pick a rating." : undefined }),
      ]),
    );

  it("takes its id, name and description from the field", async () => {
    const { root } = inField();
    await nextTick();
    const label = document.querySelector("[data-slot=field-label]")!;

    expect(root().id).toBe(label.getAttribute("for"));
    expect(root().getAttribute("aria-labelledby")).toBe(label.id);
    expect(root().getAttribute("aria-describedby")).toBe(document.querySelector("[data-slot=field-description]")!.id);
  });

  it("drops the field label for its own aria-label", async () => {
    const { root } = inField({}, { "aria-label": "Cleanliness" });
    await nextTick();

    expect(root().getAttribute("aria-labelledby")).toBeNull();
    expect(root().getAttribute("aria-label")).toBe("Cleanliness");
  });

  it("puts invalid, required and the error on the radiogroup, not the radios", async () => {
    const { root } = inField({ invalid: true, required: true });
    await nextTick();

    expect(root().getAttribute("aria-invalid")).toBe("true");
    expect(root().getAttribute("aria-required")).toBe("true");
    expect(root().getAttribute("aria-describedby")).toContain(document.querySelector("[data-slot=field-error]")!.id);
    expect(document.querySelector("button[role=radio][aria-invalid]")).toBeNull();
  });

  it("is disabled by a disabled field or fieldset", async () => {
    const field = inField({ disabled: true });
    expect(field.radios().every((radio) => radio.disabled)).toBe(true);
    field.wrapper.unmount();
    document.body.innerHTML = "";

    const fieldset = render({ modelValue: 2, "aria-label": "Stay" }, (rating) =>
      h(FieldSet, { disabled: true }, () => [rating]),
    );
    expect(fieldset.radios().every((radio) => radio.disabled)).toBe(true);
  });
});

describe("Rating item icons", () => {
  it("draws the item slot in both layers, empty and filled", async () => {
    mount(
      defineComponent({
        setup: () => () =>
          h(
            Rating,
            { modelValue: 2 },
            {
              default: ({ items }: { items: number[] }) =>
                items.map((item) =>
                  h(
                    RatingItem,
                    { key: item, item },
                    { default: ({ filled }: { filled: boolean }) => h("i", { "data-filled": String(filled) }) },
                  ),
                ),
            },
          ),
      }),
      { attachTo: document.body },
    );
    await nextTick();
    const first = document.querySelector("[data-slot=rating-item]")!;
    expect(first.querySelector("[data-slot=rating-empty-icon] i")?.getAttribute("data-filled")).toBe("false");
    expect(first.querySelector("[data-slot=rating-icon] i")?.getAttribute("data-filled")).toBe("true");
    expect(first.querySelector("svg")).toBeNull();
  });

  it("draws the display item slot in both layers too", async () => {
    mount(
      defineComponent({
        setup: () => () =>
          h(
            RatingDisplay,
            { value: 2 },
            {
              default: ({ items }: { items: number[] }) =>
                items.map((item) =>
                  h(
                    RatingDisplayItem,
                    { key: item, item },
                    { default: ({ filled }: { filled: boolean }) => h("i", { "data-filled": String(filled) }) },
                  ),
                ),
            },
          ),
      }),
      { attachTo: document.body },
    );
    await nextTick();
    const first = document.querySelector("[data-slot=rating-item]")!;
    expect([...first.querySelectorAll("i")].map((icon) => icon.getAttribute("data-filled"))).toEqual(["false", "true"]);
  });
});

describe("RatingDisplay", () => {
  it("is one picture named after its value, with no radios", async () => {
    const { root, radios } = render({ modelValue: 4.3, readonly: true });
    await nextTick();

    expect(root().getAttribute("role")).toBe("img");
    expect(root().getAttribute("aria-label")).toBe("Rated 4.3 out of 5");
    expect(root().dataset.slot).toBe("rating-display");
    expect(radios()).toHaveLength(0);
    expect(document.querySelector("button")).toBeNull();
  });

  it("fills exact fractions", async () => {
    const { items } = render({ modelValue: 4.3, readonly: true });
    await nextTick();
    const fifth = items()[4];
    const clip = fifth.querySelector("[data-slot=rating-icon]")!.parentElement!;

    expect(clip.getBoundingClientRect().width / fifth.getBoundingClientRect().width).toBeCloseTo(0.3, 2);
    expect(items()[3].querySelector("[data-slot=rating-icon]")!.parentElement!.style.width).toBe("100%");
  });

  it("reads the field label first", async () => {
    const { root } = render({ modelValue: 4.3, readonly: true }, (rating) =>
      h(Field, () => [h(FieldLabel, () => "Overall"), rating]),
    );
    await nextTick();

    const label = document.querySelector("[data-slot=field-label]")!;
    expect(root().getAttribute("aria-labelledby")).toBe(`${label.id} ${root().id}`);
  });

  it("takes its name from labels.readonly and adds an aria-label in front", () => {
    const { root } = render({
      modelValue: 4,
      readonly: true,
      "aria-label": "Hotel",
      labels: { readonly: (value: number, length: number) => `${value} of ${length} stars` },
    });
    expect(root().getAttribute("aria-label")).toBe("Hotel, 4 of 5 stars");
  });

  it("submits its value with a name", () => {
    render({ modelValue: 4.5, readonly: true, name: "score" }, (rating) => h("form", [rating]));
    expect(new FormData(document.querySelector("form")!).get("score")).toBe("4.5");
  });
});

describe("Rating in a form", () => {
  const inForm = (props: Record<string, unknown>) =>
    render({ name: "rating", ...props }, (rating) => h("form", [rating]));
  const form = () => document.querySelector("form")!;

  it("submits its value under its name", async () => {
    const { radio } = inForm({ modelValue: 1 });
    radio(3).click();
    await nextTick();

    expect(new FormData(form()).get("rating")).toBe("3");
  });

  it("fails native required until a step is picked, and again once cleared", async () => {
    const { radio, value } = inForm({ modelValue: undefined, required: true, clearable: true });
    await nextTick();
    expect(form().checkValidity()).toBe(false);

    radio(3).click();
    await nextTick();
    expect(form().checkValidity()).toBe(true);

    radio(3).click();
    await nextTick();
    await nextTick();
    expect(value.value).toBe(0);
    expect(new FormData(form()).get("rating")).toBe("");
    expect(form().checkValidity()).toBe(false);
  });

  it("tells the form when its value changes, as Reka's own inputs do", async () => {
    const { radio } = inForm({ modelValue: 1, clearable: true });
    const changes: string[] = [];
    form().addEventListener("change", (event) => changes.push((event.target as HTMLInputElement).value));

    radio(3).click();
    await nextTick();
    radio(3).click();
    await nextTick();
    expect(changes).toEqual(["3", ""]);
  });

  it("nests no input inside a radio (reka-ui #2718, #1597)", () => {
    inForm({ modelValue: 2 });
    expect(document.querySelectorAll("form input")).toHaveLength(1);
    expect(document.querySelector("button[role=radio] input")).toBeNull();
  });
});

describe("Rating sizes", () => {
  overrideControlTokens();

  it.each(controlSizes)("sizes the %s item box and glyph from the control tokens", async (size) => {
    const { items } = render({ size, modelValue: 2 });
    await nextTick();
    const item = items()[0].getBoundingClientRect();
    const glyph = items()[0].querySelector("[data-slot=rating-empty-icon]")!.getBoundingClientRect();
    const halo = Number.parseFloat(getComputedStyle(items()[0], "::before").width);

    const box = sentinel.height[size];
    const icon = Math.round((box * 2) / 3 / 2) * 2;
    expect(item.height).toBe(box);
    expect(glyph.width).toBe(icon);
    expect(item.width).toBeCloseTo(icon + sentinel.gap[size] / 2, 1);
    expect(halo).toBe(box);
    expect(document.querySelector("[data-slot=rating]")!.getAttribute("data-size")).toBe(size);
  });
});

describe("Rating touch target", () => {
  const measure = (touchTarget: string) => {
    const { items, wrapper } = render({ touchTarget, modelValue: 2 }, (rating) =>
      h("div", { "data-testid": "row", style: "display: flex; flex-direction: column; width: fit-content" }, [rating]),
    );
    const row = document.querySelector("[data-testid=row]")!.getBoundingClientRect().height;
    const rects = items().map((item) => item.getBoundingClientRect());
    wrapper.unmount();
    document.body.innerHTML = "";
    return { row, rects };
  };

  it("grows each item to 48px across the row; expand keeps the footprint, wrapper reserves it", () => {
    const none = measure("none");
    const expand = measure("expand");
    const wrapper = measure("wrapper");

    expect(none.rects[0].height).toBe(36);
    expect(expand.rects[0].height).toBe(48);
    expect(expand.row).toBe(36);
    expect(wrapper.rects[0].height).toBe(48);
    expect(wrapper.row).toBe(48);
    for (const { rects } of [none, expand, wrapper]) {
      rects.slice(1).forEach((rect, index) => expect(rect.left).toBeGreaterThanOrEqual(rects[index].right - 0.01));
      expect(rects[0].width).toBe(28);
    }
  });

  it("keeps the indicators' z-index inside each item", async () => {
    const { items } = render({ modelValue: 2, step: 0.1 }, (rating) =>
      h("div", { style: "position: relative" }, [
        h("div", { "data-testid": "cover", style: "position: absolute; inset: 0; z-index: 1" }),
        rating,
      ]),
    );
    await nextTick();

    expect(getComputedStyle(items()[0]).isolation).toBe("isolate");
    const { x, y } = center(items()[1]);
    expect(document.elementFromPoint(x, y)).toBe(document.querySelector("[data-testid=cover]"));
  });
});
