import type { Ref } from "vue";

/**
 * Root listeners shared by InputTime and InputTimeRange: `focus` and `blur` once per field rather than
 * per segment, a click on the frame focusing the first segment, and Enter submitting the form.
 */
export const useSegmentedField = (
  emit: { (event: "focus", value: FocusEvent): void; (event: "blur", value: FocusEvent): void },
  disabled: Ref<boolean | undefined>,
) => {
  const outside = (event: FocusEvent) =>
    !(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null);

  return {
    onFocusin: (event: FocusEvent) => {
      if (outside(event)) emit("focus", event);
    },
    onFocusout: (event: FocusEvent) => {
      if (outside(event)) emit("blur", event);
    },
    onMousedown: (event: MouseEvent) => {
      if (event.target !== event.currentTarget || disabled.value) return;
      event.preventDefault();
      (event.currentTarget as HTMLElement).querySelector<HTMLElement>("[role=spinbutton]")?.focus();
    },
    onKeydown: (event: KeyboardEvent) => {
      if (event.key !== "Enter" || event.isComposing) return;
      (event.currentTarget as HTMLElement).closest("form")?.requestSubmit();
    },
  };
};
