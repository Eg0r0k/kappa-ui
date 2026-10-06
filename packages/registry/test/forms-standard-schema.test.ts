import { mount } from "@vue/test-utils";
import * as v from "valibot";
import { type TypedSchema, useForm } from "vee-validate";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import * as z from "zod";

import { issuePath, toTypedSchema } from "@/lib/standard-schema";

afterEach(() => {
  document.body.innerHTML = "";
});

const formWith = (validationSchema: unknown, initialValues: Record<string, unknown>) => {
  let form!: ReturnType<typeof useForm>;
  mount(
    defineComponent({
      setup() {
        form = useForm({ validationSchema: validationSchema as TypedSchema, initialValues });
        return () => h("div");
      },
    }),
    { attachTo: document.body },
  );
  return form;
};

describe("issuePath", () => {
  it("joins keys with dots and indexes with brackets", () => {
    expect(issuePath(["emails", 0, "address"])).toBe("emails[0].address");
    expect(issuePath([{ key: "emails" }, { key: 2 }])).toBe("emails[2]");
    expect(issuePath([0])).toBe("[0]");
    expect(issuePath()).toBe("");
  });
});

describe("toTypedSchema", () => {
  const Contacts = z.object({
    contact: z.union([z.email(), z.string().regex(/^\+\d+$/)], "Enter an email address or a phone number."),
    emails: z
      .array(z.object({ address: z.email("Enter a valid email address.") }))
      .min(1, "Add at least one email address."),
    name: z.string().trim().min(2, "Too short.").max(3, "Too long."),
  });

  it("reports a failing Zod 4 union at its field instead of throwing (vee-validate#5085)", async () => {
    const result = await toTypedSchema(Contacts).parse({
      contact: "nope",
      emails: [{ address: "a@b.co" }],
      name: "Ada",
    });
    expect(result.errors).toEqual([{ path: "contact", errors: ["Enter an email address or a phone number."] }]);
  });

  it("maps nested array items and array lengths to vee-validate paths", async () => {
    const schema = toTypedSchema(Contacts);
    const nested = await schema.parse({
      contact: "+1",
      emails: [{ address: "a@b.co" }, { address: "x" }],
      name: "Ada",
    });
    expect(nested.errors).toEqual([{ path: "emails[1].address", errors: ["Enter a valid email address."] }]);

    const empty = await schema.parse({ contact: "+1", emails: [], name: "Ada" });
    expect(empty.errors).toEqual([{ path: "emails", errors: ["Add at least one email address."] }]);
  });

  it("returns the parsed output, transforms applied", async () => {
    const result = await toTypedSchema(Contacts).parse({
      contact: "+1",
      emails: [{ address: "a@b.co" }],
      name: " Ada ",
    });
    expect(result).toEqual({ value: { contact: "+1", emails: [{ address: "a@b.co" }], name: "Ada" }, errors: [] });
  });

  it("keeps every message for one path, in order", async () => {
    const schema = z.object({ code: z.string().min(6, "Six digits.").regex(/^\d*$/, "Digits only.") });
    const result = await toTypedSchema(schema).parse({ code: "a" });
    expect(result.errors).toEqual([{ path: "code", errors: ["Six digits.", "Digits only."] }]);
  });

  it("takes any Standard Schema, such as Valibot", async () => {
    const schema = v.object({
      emails: v.array(v.object({ address: v.pipe(v.string(), v.email("Enter a valid email address.")) })),
    });
    const result = await toTypedSchema(schema).parse({ emails: [{ address: "x" }] });
    expect(result.errors).toEqual([{ path: "emails[0].address", errors: ["Enter a valid email address."] }]);
  });

  it("makes vee-validate catch errors a raw Zod 4 schema lets through", async () => {
    const schema = z.object({ email: z.email("Enter a valid email address.") });

    const raw = await formWith(schema, { email: "x" }).validate();
    expect(raw.valid).toBe(true);

    const adapted = await formWith(toTypedSchema(schema), { email: "x" }).validate();
    expect(adapted.valid).toBe(false);
    expect(adapted.errors).toEqual({ email: "Enter a valid email address." });
  });
});

describe("VeeValidate examples", () => {
  const sources = import.meta.glob<string>("../src/examples/forms/VeeValidate*.vue", {
    query: "?raw",
    import: "default",
    eager: true,
  });

  it("pass every Zod schema through the adapter, never @vee-validate/zod", () => {
    expect(Object.keys(sources).length).toBeGreaterThan(0);
    for (const [path, source] of Object.entries(sources)) {
      expect(source, path).not.toContain("@vee-validate/zod");
      expect(source, path).toMatch(/toTypedSchema\(/);
      expect(source, path).not.toMatch(/validationSchema:(?!\s*toTypedSchema\()/);
    }
  });
});
