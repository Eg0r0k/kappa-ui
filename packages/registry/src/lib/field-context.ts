import { createContext } from "reka-ui";
import { type Ref, computed, nextTick } from "vue";

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

const TABBABLE = ["input:not([type=hidden])", "textarea", "select", "button", "[tabindex]"]
  .map((selector) => `${selector}:not(:disabled):not([tabindex^="-"])`)
  .join(", ");

const GROUP_ROLES = new Set(["group", "radiogroup"]);

/**
 * Moves focus to the first invalid control inside `root`, in DOM order, once
 * the errors have rendered. For a checkbox or radio group it focuses the box
 * Tab would reach. Returns the focused element, or null when nothing is invalid.
 */
export const focusFirstInvalid = async (root: ParentNode | null | undefined, options?: FocusOptions) => {
  await nextTick();
  const invalid = root?.querySelector<HTMLElement>('[aria-invalid="true"]');
  if (!invalid) return null;

  // A group's own tab stop hands focus to its checked or first item.
  const isGroup = GROUP_ROLES.has(invalid.getAttribute("role") ?? "");
  const target =
    (isGroup && invalid.querySelector<HTMLElement>(TABBABLE)) ||
    (invalid.matches(TABBABLE) ? invalid : invalid.querySelector<HTMLElement>(TABBABLE));
  if (!target) return null;
  target.focus({ focusVisible: true, ...options });
  return document.activeElement as HTMLElement;
};
