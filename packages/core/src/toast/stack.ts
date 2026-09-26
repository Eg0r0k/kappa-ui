import {
  type ComponentPublicInstance,
  type MaybeRefOrGetter,
  computed,
  onScopeDispose,
  shallowRef,
  toValue,
  watch,
} from "vue";

import type { ToastRecord } from "./manager";

export interface ToastLayout {
  index: number;
  offset: number;
  height: number;
}

type Measured = Element | ComponentPublicInstance | null;

export const useToastStack = (toasts: MaybeRefOrGetter<readonly ToastRecord[]>) => {
  const heights = shallowRef(new Map<string, number>());
  const layout = shallowRef(new Map<string, ToastLayout>());
  const ids = new WeakMap<Element, string>();
  const elements = new Map<string, Element>();
  const refs = new Map<string, (value: Measured) => void>();

  const observer =
    typeof ResizeObserver === "undefined"
      ? undefined
      : new ResizeObserver((entries) => {
          const next = new Map(heights.value);
          for (const entry of entries) {
            const id = ids.get(entry.target);
            if (id !== undefined && elements.get(id) === entry.target) {
              next.set(id, entry.borderBoxSize[0]?.blockSize ?? entry.target.getBoundingClientRect().height);
            }
          }
          heights.value = next;
        });

  const measure = (id: string) => {
    const existing = refs.get(id);
    if (existing) return existing;
    const set = (value: Measured) => {
      const element = value instanceof Element ? value : (value?.$el as unknown);
      const previous = elements.get(id);
      if (previous === element) return;
      if (previous) observer?.unobserve(previous);
      if (element instanceof Element) {
        elements.set(id, element);
        ids.set(element, id);
        observer?.observe(element);
      } else {
        elements.delete(id);
        refs.delete(id);
        if (heights.value.has(id)) {
          const next = new Map(heights.value);
          next.delete(id);
          heights.value = next;
        }
      }
    };
    refs.set(id, set);
    return set;
  };

  watch(
    [() => toValue(toasts), heights],
    ([list, measured]) => {
      const previous = layout.value;
      const next = new Map<string, ToastLayout>();
      let index = 0;
      let offset = 0;
      for (let position = list.length - 1; position >= 0; position--) {
        const toast = list[position]!;
        if (!toast.open) continue;
        const height = measured.get(toast.id) ?? 0;
        next.set(toast.id, { index, offset, height });
        offset += height;
        index++;
      }
      for (const toast of list) {
        if (!toast.open) next.set(toast.id, previous.get(toast.id) ?? { index: 0, offset: 0, height: 0 });
      }
      layout.value = next;
    },
    { immediate: true },
  );

  const open = computed(() => toValue(toasts).filter((toast) => toast.open));
  const front = computed(() => heights.value.get(open.value.at(-1)?.id ?? "") ?? 0);
  const total = computed(() => open.value.reduce((sum, toast) => sum + (heights.value.get(toast.id) ?? 0), 0));
  const count = computed(() => open.value.length);

  onScopeDispose(() => observer?.disconnect());

  return { layout, front, total, count, measure };
};
