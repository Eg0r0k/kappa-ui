import type { TypedSchema, TypedSchemaError } from "vee-validate";

// The Standard Schema v1 interface (https://standardschema.dev), inlined so
// the adapter needs no extra package. Zod 4, Valibot and ArkType implement it.
export interface StandardSchemaV1<Input = unknown, Output = Input> {
  readonly "~standard": {
    readonly version: 1;
    readonly vendor: string;
    readonly validate: (value: unknown) => StandardSchemaResult<Output> | Promise<StandardSchemaResult<Output>>;
    readonly types?: { readonly input: Input; readonly output: Output };
  };
}

export type StandardSchemaResult<Output> =
  { readonly value: Output; readonly issues?: undefined } | { readonly issues: readonly StandardSchemaIssue[] };

export interface StandardSchemaIssue {
  readonly message: string;
  readonly path?: readonly (PropertyKey | { readonly key: PropertyKey })[];
}

export type InferSchemaInput<S extends StandardSchemaV1> = NonNullable<S["~standard"]["types"]>["input"];
export type InferSchemaOutput<S extends StandardSchemaV1> = NonNullable<S["~standard"]["types"]>["output"];

/** Turns an issue path into vee-validate's field path: `emails[0].address`. */
export const issuePath = (path: StandardSchemaIssue["path"] = []) =>
  path
    .map((segment) => (typeof segment === "object" ? segment.key : segment))
    .reduce<string>((joined, key) => {
      if (typeof key === "number") return `${joined}[${key}]`;
      const name = String(key);
      return joined ? `${joined}.${name}` : name;
    }, "");

/**
 * Lets vee-validate 4 validate with any Standard Schema, such as Zod 4.
 * vee-validate 4 can't read a Zod 4 schema on its own: passed as is, every
 * value passes.
 */
export const toTypedSchema = <S extends StandardSchemaV1>(
  schema: S,
): TypedSchema<InferSchemaInput<S>, InferSchemaOutput<S>> => ({
  __type: "VVTypedSchema",
  async parse(values) {
    const result = await schema["~standard"].validate(values);
    if (!result.issues) return { value: result.value as InferSchemaOutput<S>, errors: [] };

    const errors = new Map<string, TypedSchemaError>();
    for (const issue of result.issues) {
      const path = issuePath(issue.path);
      const entry = errors.get(path) ?? { path, errors: [] };
      entry.errors.push(issue.message);
      errors.set(path, entry);
    }
    return { errors: [...errors.values()] };
  },
});
