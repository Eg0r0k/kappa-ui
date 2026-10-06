import { DateFormatter, type DateValue, getLocalTimeZone, toCalendarDateTime } from "@internationalized/date";
import { type Direction, VisuallyHidden, createContext, useDirection, useLocale } from "reka-ui";
import {
  type ComputedRef,
  type PropType,
  type Ref,
  type ShallowRef,
  computed,
  defineComponent,
  h,
  shallowRef,
  toRef,
  watch,
} from "vue";

import { useFieldControl } from "@/lib/field-context";
import type { TextControlSize, TextControlVariant } from "@/ui/input";

export type DatePickerSize = TextControlSize;
export type DatePickerVariant = TextControlVariant;

type Granularity = "day" | "hour" | "minute" | "second";

/** What the trigger, the content and the field read from either root: open state, field wiring, size and focus. */
export interface DatePickerContext {
  open: Ref<boolean>;
  setOpen: (open: boolean) => void;
  disabled: ComputedRef<boolean>;
  variant: ComputedRef<DatePickerVariant | undefined>;
  size: ComputedRef<DatePickerSize | undefined>;
  /** The size the field ended up with, which the calendar follows unless it has its own. */
  inputSize: Ref<DatePickerSize | undefined>;
  /** How many fields are mounted. With none, the trigger is the control and takes the Field's wiring. */
  inputs: Ref<number>;
  control: ReturnType<typeof useFieldControl>;
  locale: Ref<string>;
  dir: Ref<Direction>;
  trigger: ShallowRef<HTMLElement | undefined>;
  focus: PickerFocus;
}

export const [injectDatePickerContext, provideDatePickerContext] = createContext<DatePickerContext>("DatePicker");

/** The value, the placeholder and the calendar settings of a `DatePicker`. */
export interface DatePickerState {
  model: ShallowRef<DateValue | undefined>;
  setModel: (value: DateValue | undefined) => void;
  /** A day picked in the calendar: keeps the typed time and closes when `closeOnSelect` says so. */
  pick: (value: DateValue | undefined) => void;
  placeholder: ShallowRef<DateValue | undefined>;
  setPlaceholder: (value: DateValue) => void;
  field: ComputedRef<Record<string, unknown>>;
  calendar: ComputedRef<Record<string, unknown>>;
}

export const [injectDatePickerState, provideDatePickerState] = createContext<DatePickerState>("DatePickerState");

/** A controlled value with an uncontrolled fallback, like Reka's `useVModel` in passive mode. */
export const useModel = <T>(read: () => T | undefined, initial: T | undefined, emit: (value: T) => void) => {
  const state = shallowRef<T | undefined>(read() ?? initial);
  watch(read, (value) => {
    state.value = value;
  });
  const set = (value: T) => {
    state.value = value;
    emit(value);
  };
  return [state, set] as const;
};

export interface PickerFocus {
  onFocusin: (event: FocusEvent) => void;
  onFocusout: (event: FocusEvent) => void;
}

/**
 * `focus` and `blur` for the whole picker: the field, the trigger and the calendar's panel count as
 * one control, so a form validating on blur doesn't flag the field while the calendar is open.
 * Every part that takes focus calls these handlers, and registers itself by doing so.
 */
export const usePickerFocus = (emit: {
  (event: "focus", value: FocusEvent): void;
  (event: "blur", value: FocusEvent): void;
}): PickerFocus => {
  const parts = new Set<HTMLElement>();
  let within = false;

  const contains = (node: EventTarget | null) =>
    node instanceof Node && [...parts].some((part) => part.isConnected && part.contains(node));
  const register = (event: FocusEvent) => {
    for (const part of parts) if (!part.isConnected) parts.delete(part);
    if (event.currentTarget instanceof HTMLElement) parts.add(event.currentTarget);
  };

  return {
    onFocusin: (event) => {
      register(event);
      if (within) return;
      within = true;
      emit("focus", event);
    },
    onFocusout: (event) => {
      register(event);
      if (!within || contains(event.relatedTarget)) return;
      // Focus that goes nowhere may be on its way back: a closing popover hands it to the trigger
      // in a timeout of its own, so look after that one has run.
      setTimeout(() =>
        setTimeout(() => {
          if (!within || contains(document.activeElement)) return;
          within = false;
          emit("blur", event);
        }),
      );
    },
  };
};

/** Whether the picker edits a time as well as a date, the way Reka infers it for the segments. */
export const hasTime = (granularity: Granularity | undefined, ...values: (DateValue | null | undefined)[]) => {
  if (granularity) return granularity !== "day";
  const value = values.find(Boolean);
  return value ? "hour" in value : false;
};

/** A day picked in the calendar, keeping the time of `current`, or at midnight when the picker edits time. */
export const withTime = (day: DateValue, current: DateValue | null | undefined, timed: boolean) => {
  if (current && "hour" in current) {
    return current.set({ era: day.era, year: day.year, month: day.month, day: day.day } as never);
  }
  if (timed && !("hour" in day)) return toCalendarDateTime(day);
  return day;
};

/** The native input's precision for a hidden fallback input. */
export const nativeGranularity = (timed: boolean, granularity: Granularity | undefined) =>
  !timed ? "day" : granularity === "second" ? "second" : "minute";

/** Drops `undefined` entries, so a prop left out doesn't override the default of the component it is passed to. */
export const defined = (values: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined));

/** `medium` dates, plus a `short` time when the value has one. */
export const defaultFormat = (value: DateValue): Intl.DateTimeFormatOptions =>
  "hour" in value ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" };

/** A formatter and a `Date` for a value, in its own time zone when it has one. */
export const formatterFor = (locale: string, value: DateValue, format?: Intl.DateTimeFormatOptions) => {
  const zone = "timeZone" in value ? value.timeZone : getLocalTimeZone();
  return {
    formatter: new DateFormatter(locale, { ...(format ?? defaultFormat(value)), timeZone: zone }),
    toDate: (date: DateValue) => date.toDate(zone),
  };
};

/** The calendar's size: its own, else the field's, else the root's. */
export const useCalendarSize = (
  own: () => DatePickerSize | undefined,
  context: DatePickerContext,
): ComputedRef<DatePickerSize> => computed(() => own() ?? context.inputSize.value ?? context.size.value ?? "md");

interface PickerRootProps {
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  locale?: string;
  dir?: Direction;
  variant?: DatePickerVariant;
  size?: DatePickerSize;
}

/** Open state, Field wiring, locale and focus shared by both roots, provided to their parts. */
export const usePickerRoot = (
  props: PickerRootProps,
  attrs: Record<string, unknown>,
  emit: {
    (event: "update:open", value: boolean): void;
    (event: "focus", value: FocusEvent): void;
    (event: "blur", value: FocusEvent): void;
  },
) => {
  const [open, setOpen] = useModel(
    () => props.open,
    props.defaultOpen ?? false,
    (value) => emit("update:open", value),
  );
  const control = useFieldControl(props, attrs);
  const context: DatePickerContext = {
    open: open as Ref<boolean>,
    setOpen,
    disabled: computed(() => Boolean(control.disabled.value)),
    variant: computed(() => props.variant),
    size: computed(() => props.size),
    inputSize: shallowRef(),
    inputs: shallowRef(0),
    control,
    locale: useLocale(toRef(() => props.locale)),
    dir: useDirection(toRef(() => props.dir)),
    trigger: shallowRef(),
    focus: usePickerFocus(emit),
  };
  provideDatePickerContext(context);
  return context;
};

/**
 * Hidden native inputs for a picker whose trigger is a button: with no field mounted, nothing else
 * submits the value or fails `required`. Rendered after the root's slot, so a field mounted there
 * has already counted itself. Focus, from a failed `required`, goes on to the trigger.
 */
export const PickerNativeInputs = defineComponent({
  props: {
    inputs: { type: Function as PropType<() => Record<string, unknown>[]>, required: true },
    name: { type: String, default: undefined },
  },
  setup(props) {
    const picker = injectDatePickerContext();
    return () =>
      picker.inputs.value > 0 || !(props.name || picker.control.required.value)
        ? null
        : props.inputs().map((input) =>
            h(VisuallyHidden, {
              as: "input",
              feature: "focusable",
              "aria-hidden": "true",
              tabindex: "-1",
              ...input,
              required: picker.control.required.value,
              disabled: picker.disabled.value,
              onFocus: () => picker.trigger.value?.focus(),
            }),
          );
  },
});
