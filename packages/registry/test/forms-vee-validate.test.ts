import { type VueWrapper, mount } from "@vue/test-utils";
import { type FieldSlotProps, Field as VeeField, useForm } from "vee-validate";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { type Component, defineComponent, h, nextTick, ref } from "vue";
import * as z from "zod";

import VeeValidateArray from "@/examples/forms/VeeValidateArray.vue";
import VeeValidateChoices from "@/examples/forms/VeeValidateChoices.vue";
import VeeValidateControls from "@/examples/forms/VeeValidateControls.vue";
import VeeValidateDemo from "@/examples/forms/VeeValidateDemo.vue";
import VeeValidateDialog from "@/examples/forms/VeeValidateDialog.vue";
import VeeValidateFieldSlot from "@/examples/forms/VeeValidateFieldSlot.vue";
import VeeValidateSelect from "@/examples/forms/VeeValidateSelect.vue";
import { focusFirstInvalid } from "@/lib/field-context";
import { toTypedSchema } from "@/lib/standard-schema";
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/ui/field";
import { InputNumber, InputNumberInput } from "@/ui/input-number";
import { Radio, RadioGroup } from "@/ui/radio-group";
import { Slider } from "@/ui/slider";
import { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemText } from "@/ui/tags-input";

const mounted: VueWrapper[] = [];

afterEach(() => {
  for (const wrapper of mounted.splice(0)) wrapper.unmount();
  document.body.innerHTML = "";
  document.body.removeAttribute("style");
});

const render = (component: Component) => {
  const wrapper = mount(component, { attachTo: document.body });
  mounted.push(wrapper);
  return wrapper;
};

const submitButton = () => document.querySelector<HTMLButtonElement>("button[type=submit]")!;
const errorTexts = () => [...document.querySelectorAll("[data-slot=field-error]")].map((error) => error.textContent);
const byLabel = <T extends HTMLElement = HTMLInputElement>(text: string) => {
  const label = [...document.querySelectorAll("label")].find(
    (node) => node.textContent?.replace("*", "").trim() === text,
  )!;
  return document.getElementById(label.htmlFor) as T;
};

describe("VeeValidate demo", () => {
  it("shows every error on submit and focuses the first invalid field, described by its error", async () => {
    render(VeeValidateDemo);
    await userEvent.click(submitButton());

    await expect
      .poll(errorTexts)
      .toEqual(["Bug title must be at least 5 characters.", "Description must be at least 20 characters."]);
    expect(document.querySelectorAll("[aria-invalid=true]")).toHaveLength(2);
    const title = byLabel("Bug title");
    await expect.poll(() => document.activeElement).toBe(title);
    const error = document.querySelector("[data-slot=field-error]")!;
    expect(title.getAttribute("aria-describedby")?.split(" ")).toContain(error.id);
  });

  it("checks a field on blur first, then on every keystroke once it's wrong", async () => {
    render(VeeValidateDemo);
    const title = byLabel("Bug title");

    await userEvent.type(title, "Bug");
    await nextTick();
    expect(errorTexts()).toEqual([]);

    await userEvent.keyboard("{Tab}");
    await expect.poll(errorTexts).toEqual(["Bug title must be at least 5 characters."]);

    // Typing here blurs the description, which Tab had focused, so that one is checked now.
    await userEvent.type(title, "gy");
    await expect.poll(errorTexts).toEqual(["Description must be at least 20 characters."]);
    expect(title.getAttribute("aria-invalid")).toBeNull();
  });

  it("sends the parsed values and resets to the starting ones", async () => {
    render(VeeValidateDemo);
    await userEvent.type(byLabel("Bug title"), "Login fails");
    await userEvent.type(byLabel("Description"), "The button does nothing on iOS.");
    await userEvent.click(submitButton());
    await expect.poll(() => document.querySelector("[aria-live]")?.textContent).toBe("Sent: Login fails");

    await userEvent.click([...document.querySelectorAll("button")].find((node) => node.textContent === "Reset")!);
    await expect.poll(() => byLabel("Bug title").value).toBe("");
    expect(byLabel<HTMLTextAreaElement>("Description").value).toBe("");
  });
});

describe("VeeValidate examples", () => {
  it.each([
    VeeValidateDemo,
    VeeValidateSelect,
    VeeValidateChoices,
    VeeValidateControls,
    VeeValidateArray,
    VeeValidateFieldSlot,
  ])("render a novalidate form, so required controls never block the submit handler", (example) => {
    render(example);
    const forms = [...document.querySelectorAll("form")];
    expect(forms.length).toBeGreaterThan(0);
    for (const form of forms) expect(form.noValidate).toBe(true);
  });

  it("keep Reka's hidden inputs out of the tab order and every label pointing at a control (reka-ui#2718, nuxt/ui#3998)", () => {
    render(VeeValidateSelect);
    const hidden = [...document.querySelectorAll<HTMLInputElement>("form input[aria-hidden=true], form select")];
    expect(hidden.length).toBeGreaterThan(0);
    for (const input of hidden) expect(input.tabIndex).toBe(-1);

    const labels = [...document.querySelectorAll("label")].filter((label) => label.htmlFor);
    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) expect(document.getElementById(label.htmlFor), label.textContent!).not.toBeNull();
  });
});

describe("VeeValidate select and combobox", () => {
  it("focuses the trigger and the input from their labels (nuxt/ui#4690)", async () => {
    render(VeeValidateSelect);
    await userEvent.click(
      [...document.querySelectorAll("label")].find((label) => label.textContent?.includes("Spoken"))!,
    );
    expect(document.activeElement?.getAttribute("data-slot")).toBe("select-trigger");

    await userEvent.click(
      [...document.querySelectorAll("label")].find((label) => label.textContent?.includes("Country"))!,
    );
    expect(document.activeElement?.getAttribute("data-slot")).toBe("combobox-input");
  });

  it("focuses the trigger on an invalid submit and clears the error once a value is chosen", async () => {
    render(VeeValidateSelect);
    await userEvent.click(submitButton());

    await expect.poll(errorTexts).toEqual(["Choose a language.", "Choose a country."]);
    const trigger = document.querySelector<HTMLElement>("[data-slot=select-trigger]")!;
    await expect.poll(() => document.activeElement).toBe(trigger);

    await userEvent.keyboard("{Enter}");
    await expect.poll(() => document.activeElement?.getAttribute("data-slot")).toBe("select-item");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");
    await expect.poll(errorTexts).toEqual(["Choose a country."]);
    expect(trigger.textContent).toContain("Deutsch");
  });

  it("keeps the combobox value until an item is picked, never the search text (reka-ui#1653)", async () => {
    render(VeeValidateSelect);
    const input = document.querySelector<HTMLInputElement>("[data-slot=combobox-input]")!;
    await userEvent.click(input);
    await userEvent.keyboard("Sp");
    await userEvent.keyboard("{Tab}");
    await userEvent.click(submitButton());
    await expect.poll(errorTexts).toEqual(["Choose a language.", "Choose a country."]);

    await userEvent.click(input);
    await userEvent.keyboard("Sp");
    await expect
      .poll(() => document.querySelector("[data-slot=combobox-item][data-highlighted]")?.textContent)
      .toBe("Spain");
    await userEvent.keyboard("{Enter}");
    await expect.poll(errorTexts).toEqual(["Choose a language."]);
    expect(input.value).toBe("Spain");
  });
});

describe("VeeValidate choices", () => {
  it("focuses the first box of an invalid group and validates each control on change", async () => {
    render(VeeValidateChoices);
    await userEvent.click(submitButton());

    await expect
      .poll(errorTexts)
      .toEqual([
        "Pick at least one way to be notified.",
        "Choose a plan.",
        "Turn on two-factor authentication to continue.",
      ]);
    const first = document.querySelector("[data-slot=checkbox]");
    await expect.poll(() => document.activeElement).toBe(first);

    await userEvent.keyboard(" ");
    await expect.poll(errorTexts).toEqual(["Choose a plan.", "Turn on two-factor authentication to continue."]);

    await userEvent.click(document.querySelector<HTMLElement>("[data-slot=switch]")!);
    await expect.poll(errorTexts).toEqual(["Choose a plan."]);

    await userEvent.click(submitButton());
    await expect.poll(() => document.activeElement?.getAttribute("data-slot")).toBe("radio");
    await userEvent.keyboard(" ");
    await expect.poll(errorTexts).toEqual([]);
  });
});

describe("VeeValidate controls", () => {
  it("keeps numbers, arrays and the joined code typed while bound with v-model (reka-ui#1653, #2241)", async () => {
    render(VeeValidateControls);
    const amount = document.querySelector<HTMLInputElement>("[data-slot=input-number-input]")!;
    await userEvent.fill(amount, "3");
    await userEvent.keyboard("{Tab}");

    const draft = document.querySelector<HTMLInputElement>("[data-slot=tags-input-input]")!;
    await userEvent.click(draft);
    await userEvent.keyboard("ada@example.com{Enter}");
    await expect.poll(() => document.querySelectorAll("[data-slot=tags-input-item]").length).toBe(1);

    await userEvent.click(document.querySelector<HTMLInputElement>("[data-slot=pin-input-slot]")!);
    await userEvent.keyboard("123456");

    await userEvent.click(submitButton());
    await expect.poll(() => document.querySelector("[aria-live]")?.textContent).toBe("Sent 3 × $20–100, code 123456");
    expect(errorTexts()).toEqual([]);
  });

  it("lists every error and focuses the first invalid control", async () => {
    render(VeeValidateControls);
    const amount = document.querySelector<HTMLInputElement>("[data-slot=input-number-input]")!;
    await userEvent.fill(amount, "0");
    await userEvent.keyboard("{Tab}");
    await userEvent.click(submitButton());

    await expect
      .poll(errorTexts)
      .toEqual(["Send at least one card.", "Add at least one recipient.", "Enter the six digits we emailed you."]);
    await expect.poll(() => document.activeElement).toBe(amount);
  });

  it("flags a recipient that isn't an email address", async () => {
    render(VeeValidateControls);
    await userEvent.click(document.querySelector<HTMLInputElement>("[data-slot=tags-input-input]")!);
    await userEvent.keyboard("ada{Enter}");
    await expect.poll(errorTexts).toEqual(["Every recipient needs a valid email address."]);
  });

  it("resets the number input and the tags to their starting values", async () => {
    render(VeeValidateControls);
    const amount = document.querySelector<HTMLInputElement>("[data-slot=input-number-input]")!;
    await userEvent.fill(amount, "7");
    await userEvent.keyboard("{Tab}");
    await userEvent.click(document.querySelector<HTMLInputElement>("[data-slot=tags-input-input]")!);
    await userEvent.keyboard("ada@example.com{Enter}");
    await expect.poll(() => document.querySelectorAll("[data-slot=tags-input-item]").length).toBe(1);

    await userEvent.click([...document.querySelectorAll("button")].find((node) => node.textContent === "Reset")!);
    await expect.poll(() => amount.value).toBe("1");
    expect(document.querySelectorAll("[data-slot=tags-input-item]")).toHaveLength(0);
  });
});

describe("VeeValidate array", () => {
  const emails = () => [...document.querySelectorAll<HTMLInputElement>("input[type=email]")];
  const button = (text: string) =>
    [...document.querySelectorAll("button")].find((node) => node.textContent?.trim() === text)!;

  it("adds rows up to the limit and drops a removed row's error", async () => {
    render(VeeValidateArray);
    for (let index = 1; index < 5; index++) await userEvent.click(button("Add address"));
    await expect.poll(() => emails().length).toBe(5);
    expect(button("Add address").disabled).toBe(true);

    await userEvent.fill(emails()[0]!, "ada@example.com");
    await userEvent.fill(emails()[1]!, "nope");
    await userEvent.fill(emails()[2]!, "grace@example.com");
    await userEvent.fill(emails()[3]!, "joan@example.com");
    await userEvent.fill(emails()[4]!, "mary@example.com");
    await userEvent.click(button("Save"));

    await expect.poll(errorTexts).toEqual(["Enter a valid email address."]);
    await expect.poll(() => document.activeElement).toBe(emails()[1]);

    await userEvent.click(document.querySelector<HTMLElement>("[aria-label='Remove email 2']")!);
    await expect
      .poll(() => emails().map((input) => input.value))
      .toEqual(["ada@example.com", "grace@example.com", "joan@example.com", "mary@example.com"]);
    expect(errorTexts()).toEqual([]);
    expect(button("Add address").disabled).toBe(false);
  });
});

describe("VeeValidate dialog", () => {
  const open = async () => {
    await userEvent.click(
      [...document.querySelectorAll("button")].find((node) => node.textContent === "Invite member")!,
    );
    await expect.poll(() => document.querySelector("[role=dialog]")).not.toBeNull();
    return document.querySelector<HTMLInputElement>("[role=dialog] input[type=email]")!;
  };

  it("doesn't flash an error when Escape closes it, and opens clean (reka-ui#2630, shadcn-vue#1687)", async () => {
    render(VeeValidateDialog);
    const email = await open();
    await userEvent.click(email);
    await userEvent.keyboard("ad");

    const seen: string[] = [];
    const observer = new MutationObserver(() => {
      if (document.querySelector("[data-slot=field-error]")) seen.push("error");
    });
    observer.observe(document.body, { childList: true, subtree: true });
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => document.querySelector("[role=dialog]")).toBeNull();
    observer.disconnect();
    expect(seen).toEqual([]);

    const reopened = await open();
    expect(reopened.value).toBe("");
    expect(errorTexts()).toEqual([]);
  });

  it("shows an error from the server on the field and moves focus to it", async () => {
    render(VeeValidateDialog);
    const email = await open();
    await userEvent.fill(email, "ada@example.com");
    const submit = document.querySelector<HTMLButtonElement>("[role=dialog] button[type=submit]")!;
    await userEvent.click(submit);

    await expect.poll(() => submit.disabled).toBe(true);
    expect(submit.querySelector("[data-slot=spinner]")).not.toBeNull();
    await expect.poll(errorTexts, { timeout: 3000 }).toEqual(["This email is already a member."]);
    await expect.poll(() => document.activeElement).toBe(email);
    expect(email.disabled).toBe(false);
    expect(submit.disabled).toBe(false);

    await userEvent.fill(email, "alan@example.com");
    await expect.poll(errorTexts).toEqual([]);
    await userEvent.click(submit);
    await expect.poll(() => document.querySelector("[role=dialog]"), { timeout: 3000 }).toBeNull();
    expect(document.querySelector("[aria-live]")?.textContent).toBe("Invited alan@example.com as viewer.");
  });
});

describe("VeeValidate Field slot", () => {
  it("shows the starting value through componentField (shadcn-vue#1673) and keeps the number a number", async () => {
    render(VeeValidateFieldSlot);
    await nextTick();
    const guests = document.querySelector<HTMLInputElement>("[data-slot=input-number-input]")!;
    expect(guests.value).toBe("2");

    await userEvent.click(submitButton());
    await expect.poll(errorTexts).toEqual(["Enter the name on the booking."]);
    await expect.poll(() => document.activeElement).toBe(byLabel("Name"));

    await userEvent.fill(byLabel("Name"), "Ada");
    await userEvent.fill(guests, "4");
    await userEvent.keyboard("{Tab}");
    await userEvent.click(submitButton());
    await expect.poll(() => document.querySelector("[aria-live]")?.textContent).toBe("Table for 4, Ada.");
  });
});

describe("focusFirstInvalid", () => {
  it("returns null when nothing is invalid", async () => {
    render(defineComponent(() => () => h("form", [h("input")])));
    expect(await focusFirstInvalid(document.querySelector("form"))).toBeNull();
    expect(await focusFirstInvalid(null)).toBeNull();
  });

  it("focuses the radio Tab would reach in an invalid group, and a slider's thumb", async () => {
    const groupInvalid = ref(true);
    render(
      defineComponent(
        () => () =>
          h("form", [
            h(FieldSet, { invalid: groupInvalid.value }, () => [
              h(FieldLegend, () => "Seats"),
              h(RadioGroup, { defaultValue: 5 }, () => [1, 5, 10].map((seats) => h(Radio, { value: seats }))),
              h(FieldError, { errors: "Pick a team size." }),
            ]),
            h(Field, { invalid: true }, () => [h(FieldLabel, () => "Budget"), h(Slider, { defaultValue: [10] })]),
          ]),
      ),
    );
    const form = document.querySelector("form")!;

    const focused = await focusFirstInvalid(form);
    expect(focused).toBe(document.activeElement);
    expect(focused?.getAttribute("data-slot")).toBe("radio");
    expect(focused?.getAttribute("aria-checked")).toBe("true");

    groupInvalid.value = false;
    expect((await focusFirstInvalid(form))?.getAttribute("role")).toBe("slider");
  });

  it("follows DOM order, not schema order, in a right-to-left form", async () => {
    render(
      defineComponent(
        () => () =>
          h("form", { dir: "rtl" }, [
            h(Field, { invalid: false }, () => [
              h(FieldLabel, () => "First"),
              h(InputNumber, () => h(InputNumberInput)),
            ]),
            h(Field, { invalid: true }, () => [
              h(FieldLabel, () => "Second"),
              h(InputNumber, () => h(InputNumberInput)),
            ]),
            h(Field, { invalid: true }, () => [
              h(FieldLabel, () => "Third"),
              h(InputNumber, () => h(InputNumberInput)),
            ]),
          ]),
      ),
    );
    const inputs = document.querySelectorAll("input");
    expect(await focusFirstInvalid(document.querySelector("form"))).toBe(inputs[1]);
  });
});

describe("bindings", () => {
  it("keeps a radio group's number values numbers through handleChange (reka-ui#1653)", async () => {
    let values!: Record<string, unknown>;
    render(
      defineComponent({
        setup() {
          const form = useForm({ initialValues: { seats: 1 } });
          values = form.values;
          return () =>
            h(
              VeeField,
              { name: "seats" },
              {
                default: ({ value, handleChange }: FieldSlotProps<number>) =>
                  h(RadioGroup, { modelValue: value, "onUpdate:modelValue": handleChange, "aria-label": "Seats" }, () =>
                    [1, 5, 10].map((seats) => h(Radio, { value: seats, "aria-label": `${seats}` })),
                  ),
              },
            );
        },
      }),
    );
    await userEvent.click(document.querySelector<HTMLElement>("[aria-label='5']")!);
    await expect.poll(() => values.seats).toBe(5);
  });

  it("documents why componentField is off-limits on InputNumber: Reka's bubbling input event stringifies it (reka-ui#2241)", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    let values!: Record<string, unknown>;
    render(
      defineComponent({
        setup() {
          const form = useForm({ initialValues: { amount: 1 } });
          values = form.values;
          return () =>
            h(
              VeeField,
              { name: "amount" },
              {
                default: ({ componentField }: FieldSlotProps<number>) =>
                  // The slot types componentField loosely, which is the point of this test.
                  h(InputNumber as Component, { ...componentField, "aria-label": "Amount" }, () => h(InputNumberInput)),
              },
            );
        },
      }),
    );
    await userEvent.fill(document.querySelector<HTMLInputElement>("[data-slot=input-number-input]")!, "42");
    await expect.poll(() => typeof values.amount).toBe("string");
    warn.mockRestore();
  });
});

describe("TagsInput inside a form", () => {
  const mountForm = (inputProps: Record<string, unknown> = {}) => {
    const submits = ref(0);
    const tags = ref<string[]>([]);
    render(
      defineComponent(
        () => () =>
          h("form", { novalidate: true, onSubmit: (event: Event) => (event.preventDefault(), submits.value++) }, [
            h(
              TagsInput,
              { modelValue: tags.value, "onUpdate:modelValue": (value: unknown) => (tags.value = value as string[]) },
              () => [
                ...tags.value.map((tag) => h(TagsInputItem, { key: tag, value: tag }, () => h(TagsInputItemText))),
                h(TagsInputInput, { "aria-label": "Tags", ...inputProps }),
              ],
            ),
            h("button", { type: "submit" }, "Save"),
          ]),
      ),
    );
    return { submits, tags, input: document.querySelector<HTMLInputElement>("[data-slot=tags-input-input]")! };
  };

  it("adds the draft on Enter without submitting, even when the browser submits before Reka cancels (reka-ui#2966)", async () => {
    // Stands in for a browser that settles the implicit submit before reka-ui 2.10 cancels the
    // Enter a tick later. It runs right after Reka's own handler, before that tick.
    const { submits, tags, input } = mountForm({
      onKeydown: (event: KeyboardEvent) => {
        if (event.key === "Enter" && !event.defaultPrevented) (event.target as HTMLInputElement).form!.requestSubmit();
      },
    });

    await userEvent.click(input);
    await userEvent.keyboard("draft{Enter}");
    await expect.poll(() => tags.value).toEqual(["draft"]);
    expect(submits.value).toBe(0);

    await userEvent.click(submitButton());
    await expect.poll(() => submits.value).toBe(1);
  });

  it("submits on Enter with an empty draft", async () => {
    const { submits, input } = mountForm();
    await userEvent.click(input);
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => submits.value).toBe(1);
  });

  it("submits a valid vee-validate form with z.array(z.email())", async () => {
    let sent: unknown;
    render(
      defineComponent({
        setup() {
          const { defineField, handleSubmit } = useForm({
            validationSchema: toTypedSchema(z.object({ to: z.array(z.email()).min(1) })),
            initialValues: { to: [] },
          });
          const [to] = defineField("to");
          const submit = handleSubmit((values) => (sent = values.to));
          return () =>
            h("form", { novalidate: true, onSubmit: submit }, [
              h(
                TagsInput,
                { modelValue: to.value, "onUpdate:modelValue": (value: unknown) => (to.value = value as string[]) },
                () => [
                  ...(to.value ?? []).map((tag) =>
                    h(TagsInputItem, { key: tag, value: tag }, () => h(TagsInputItemText)),
                  ),
                  h(TagsInputInput, { "aria-label": "To" }),
                ],
              ),
            ]);
        },
      }),
    );
    await userEvent.click(document.querySelector<HTMLInputElement>("[data-slot=tags-input-input]")!);
    await userEvent.keyboard("ada@example.com{Enter}");
    expect(sent).toBeUndefined();
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => sent).toEqual(["ada@example.com"]);
  });
});
