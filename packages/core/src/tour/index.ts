// Adapted from Nuxt UI (https://github.com/nuxt/ui), modified for kappa-ui.
// Copyright (c) 2023 Nuxt. MIT License: https://github.com/nuxt/ui/blob/v4/LICENSE.md
import type { ReferenceElement } from "reka-ui";
import { type ComputedRef, type MaybeRefOrGetter, type Ref, computed, nextTick, ref, toValue, watch } from "vue";

import { isDev } from "../internal/dev";

export type TourTarget = string | ReferenceElement | null | undefined;

export interface TourStep {
  target?: MaybeRefOrGetter<TourTarget>;
  [key: string]: unknown;
}

export interface UseTourOptions {
  initialStep?: number;
  loop?: boolean;
  scrollIntoView?: boolean | ScrollIntoViewOptions;
}

export interface UseTourReturn<T extends TourStep = TourStep> {
  open: Ref<boolean>;
  index: Ref<number>;
  current: ComputedRef<T | undefined>;
  reference: ComputedRef<ReferenceElement | undefined>;
  centered: ComputedRef<boolean>;
  total: ComputedRef<number>;
  hasNext: ComputedRef<boolean>;
  hasPrev: ComputedRef<boolean>;
  start: (index?: number) => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  finish: () => void;
}

const centerAnchor: ReferenceElement = {
  getBoundingClientRect: () => DOMRect.fromRect({ x: window.innerWidth / 2, y: window.innerHeight / 2 }),
};

const warned = new Set<string>();

const resolve = (target: string | ReferenceElement): ReferenceElement | null => {
  if (typeof target !== "string") return target;
  // A plain word is an id, so `header` means `#header`, never the `<header>` element.
  if (/^[\w-]+$/.test(target)) return document.getElementById(target);
  try {
    return document.querySelector(target);
  } catch {
    return null;
  }
};

export const useTour = <T extends TourStep>(
  steps: MaybeRefOrGetter<T[]>,
  options: UseTourOptions = {},
): UseTourReturn<T> => {
  const { loop = false, scrollIntoView = true } = options;

  const stepList = computed<T[]>(() => toValue(steps) ?? []);
  const total = computed(() => stepList.value.length);
  const open = ref(false);
  const rawIndex = ref(options.initialStep ?? 0);

  const clamp = (value: number) => Math.min(Math.max(value, 0), Math.max(total.value - 1, 0));
  const index = computed({
    get: () => clamp(rawIndex.value),
    set: (value: number) => {
      rawIndex.value = clamp(value);
    },
  });

  const current = computed<T | undefined>(() => stepList.value[index.value]);
  const hasNext = computed(() => index.value < total.value - 1);
  const hasPrev = computed(() => index.value > 0);
  const target = computed(() => toValue(current.value?.target));

  const reference = computed<ReferenceElement | undefined>(() => {
    if (!open.value || typeof window === "undefined") return undefined;
    const value = target.value;
    return (value == null ? null : resolve(value)) ?? centerAnchor;
  });
  const centered = computed(() => reference.value === centerAnchor);

  const warnMissing = () => {
    const value = target.value;
    if (!isDev || typeof value !== "string" || !centered.value || warned.has(value)) return;
    warned.add(value);
    console.warn(
      `[kappa-ui] useTour: no element matches the target ${value}, so step ${index.value} shows in the centre.`,
    );
  };

  const scrollTargetIntoView = () => {
    const element = reference.value;
    if (!scrollIntoView || !(element instanceof Element)) return;
    element.scrollIntoView(
      typeof scrollIntoView === "object" ? scrollIntoView : { behavior: "smooth", block: "center" },
    );
  };

  const finish = () => {
    open.value = false;
  };

  const goTo = (value: number) => {
    index.value = value;
    if (total.value > 0) open.value = true;
  };

  const start = (value = options.initialStep ?? 0) => goTo(value);

  const next = () => {
    if (hasNext.value) index.value += 1;
    else if (loop) index.value = 0;
    else finish();
  };

  const prev = () => {
    if (hasPrev.value) index.value -= 1;
  };

  watch(total, (value) => {
    if (!value) finish();
  });

  watch([open, index], () => {
    if (!open.value) return;
    nextTick(() => {
      warnMissing();
      scrollTargetIntoView();
    });
  });

  return { open, index, current, reference, centered, total, hasNext, hasPrev, start, next, prev, goTo, finish };
};
