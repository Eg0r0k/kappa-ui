import { type MaybeRefOrGetter, computed, toValue, watch } from "vue";

import { useToast } from "./manager";

export const useToastGroup = <T extends object = object>(
  group: MaybeRefOrGetter<string | undefined>,
  max: MaybeRefOrGetter<number>,
) => {
  const manager = useToast<T>();
  const toasts = computed(() => manager.toasts.value.filter((toast) => toast.group === toValue(group)));

  watch(
    () => toValue(group),
    (value, _, onCleanup) => onCleanup(manager.register(value)),
    { immediate: true },
  );

  watch(
    [toasts, () => toValue(max)],
    ([list, limit]) => {
      const open = list.filter((toast) => toast.open);
      open.slice(0, Math.max(open.length - limit, 0)).forEach((toast) => manager.remove(toast.id));
    },
    { immediate: true },
  );

  return { manager, toasts };
};
