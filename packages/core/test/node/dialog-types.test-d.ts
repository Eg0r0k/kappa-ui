import { describe, expectTypeOf, it } from "vitest";
import { type PropType, defineComponent, h } from "vue";

import {
  type DialogHandle,
  type DialogProps,
  type DialogResult,
  type DismissReason,
  defineDialog,
  openDialog,
  useDialogContext,
} from "../../src/dialog";

const Card = defineComponent({
  props: {
    name: { type: String, required: true },
    tags: { type: Array as PropType<string[]>, default: () => [] },
  },
  setup: () => () => h("div"),
});

const Loose = defineComponent({ props: { note: String }, setup: () => () => h("div") });

const Generic = <T>(props: { items: T[] }) => h("div", props.items.length);

describe("dialog types", () => {
  it("types the result from the type argument and narrows it (T1, T7)", () => {
    expectTypeOf(openDialog<number>).returns.resolves.toEqualTypeOf<DialogResult<number>>();
    expectTypeOf(openDialog(Loose)).resolves.toEqualTypeOf<DialogResult<void>>();

    const read = (result: DialogResult<number>) => {
      if (result.ok) expectTypeOf(result.value).toEqualTypeOf<number>();
      else expectTypeOf(result.reason).toEqualTypeOf<DismissReason>();
    };
    read({ ok: true, value: 1 });
  });

  it("checks the props of openDialog without a type argument", () => {
    openDialog(Card, { name: "a" });
    openDialog(Loose);
    // @ts-expect-error name is required
    openDialog(Card);
    // @ts-expect-error name is a string
    openDialog(Card, { name: 1 });
  });

  it("checks the props of a definition and types its result (T2, T3, T5)", () => {
    const card = defineDialog(Card, { props: { tags: ["a"] } });
    expectTypeOf(card.open).toBeCallableWith({ name: "a" });
    // @ts-expect-error unknown prop
    expectTypeOf(card.open).toBeCallableWith({ wrongProp: 1 });
    // @ts-expect-error name is a string
    expectTypeOf(card.open).toBeCallableWith({ name: 123 });
    expectTypeOf(card.open<string>).returns.toEqualTypeOf<DialogHandle<string, DialogProps<typeof Card>>>();
    expectTypeOf<DialogHandle<void, DialogProps<typeof Card>>["patch"]>()
      .parameter(0)
      .toEqualTypeOf<Partial<DialogProps<typeof Card>>>();
  });

  it("types close inside the dialog (T4, L12)", () => {
    type Numbered = ReturnType<typeof useDialogContext<number>>;
    expectTypeOf<Numbered["close"]>().toBeCallableWith(1);
    // @ts-expect-error a string is not a number
    expectTypeOf<Numbered["close"]>().toBeCallableWith("x");
    expectTypeOf(() => useDialogContext().close()).toBeFunction();
  });

  it("does not fall into never for a generic component (T6)", () => {
    expectTypeOf<DialogProps<typeof Generic>>().not.toBeNever();
    openDialog(Generic, { items: [1, 2] });
  });
});
