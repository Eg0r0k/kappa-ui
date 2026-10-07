import type { Ref } from "vue";

const blocksImplicitSubmission = new Set([
  "text",
  "search",
  "url",
  "tel",
  "email",
  "password",
  "date",
  "month",
  "week",
  "time",
  "datetime-local",
  "number",
]);

/** Counts the form's text-like fields the way the HTML spec does, a segmented field counting as one. */
const textFields = (form: HTMLFormElement) => {
  const segmented = new Set(
    [...form.querySelectorAll("[data-slot=input-date-segment], [data-slot=input-time-segment]")].map(
      (segment) => segment.parentElement,
    ),
  );
  const native = [...form.elements].filter(
    (element) =>
      element instanceof HTMLInputElement &&
      blocksImplicitSubmission.has(element.type) &&
      !element.hidden &&
      element.getAttribute("aria-hidden") !== "true" &&
      ![...segmented].some((root) => root?.contains(element)),
  );
  return segmented.size + native.length;
};

/**
 * Enter as implicit submission works on a native input: it clicks the form's default button, does
 * nothing while that button is disabled, and submits a form that has none only when this is its one
 * text field.
 */
const submitForm = (form: HTMLFormElement | null) => {
  if (!form) return;
  const button = [...form.elements].find(
    (element): element is HTMLButtonElement | HTMLInputElement =>
      (element instanceof HTMLButtonElement && element.type === "submit") ||
      (element instanceof HTMLInputElement && (element.type === "submit" || element.type === "image")),
  );
  if (!button) {
    if (textFields(form) === 1) form.requestSubmit();
  } else if (!button.disabled) button.click();
};

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
      submitForm((event.currentTarget as HTMLElement).closest("form"));
    },
  };
};
