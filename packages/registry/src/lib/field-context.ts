import { createContext } from "reka-ui";
import { type Ref, computed } from "vue";

export interface FieldContext {
  id: string;
  labelId: string;
  descriptionId: string;
  errorId: string;
  invalid: Ref<boolean>;
  disabled: Ref<boolean>;
  required: Ref<boolean>;
  hasLabel: Ref<boolean>;
  hasDescription: Ref<boolean>;
  hasError: Ref<boolean>;
}

export const [injectFieldContext, provideFieldContext] = createContext<FieldContext>("Field");

type Booleanish = boolean | "true" | "false";

export const useFieldControl = (
  props: { id?: string; disabled?: boolean; required?: boolean },
  attrs: Record<string, unknown>,
) => {
  const field = injectFieldContext(null);

  return {
    field,
    id: computed(() => props.id ?? field?.id),
    disabled: computed(() => props.disabled || field?.disabled.value),
    required: computed(() => props.required || field?.required.value),
    invalid: computed(() => (attrs["aria-invalid"] as Booleanish | undefined) ?? (field?.invalid.value || undefined)),
    labelledBy: computed(
      () =>
        (attrs["aria-labelledby"] as string | undefined) ??
        (!attrs["aria-label"] && field?.hasLabel.value ? field.labelId : undefined),
    ),
    describedBy: computed(
      () =>
        [
          attrs["aria-describedby"],
          field?.hasDescription.value && field.descriptionId,
          field?.hasError.value && field.errorId,
        ]
          .filter(Boolean)
          .join(" ") || undefined,
    ),
  };
};
