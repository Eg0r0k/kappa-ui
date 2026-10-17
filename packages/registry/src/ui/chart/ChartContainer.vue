<script setup lang="ts">
import { useIntersectionObserver, useResizeObserver, useVModel } from "@vueuse/core";
import { useId } from "reka-ui";
import { type HTMLAttributes, type Ref, computed, shallowRef, watch } from "vue";

import { cn } from "@/lib/utils";
import {
  type ChartActive,
  type ChartConfig,
  type ChartDatum,
  type ChartEvents,
  type ChartPointer,
  chartItemColor,
  provideChartContext,
} from ".";

const props = withDefaults(
  defineProps<{
    config: ChartConfig;
    label?: string;
    hidden?: string[];
    lazy?: boolean;
    class?: HTMLAttributes["class"];
  }>(),
  { label: undefined, hidden: undefined, lazy: false, class: undefined },
);
const emits = defineEmits<{ "update:hidden": [keys: string[]] }>();

const VARIABLE_NAME = /^[a-z_][\w-]*$/i;
const isDev = () => (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true;

const id = useId();
const root = shallowRef<HTMLElement>();

const hidden = useVModel(props, "hidden", emits, {
  defaultValue: [],
  passive: (props.hidden === undefined) as false,
}) as Ref<string[]>;
const isHidden = (key: string) => hidden.value.includes(key);
const toggle = (key: string) => {
  hidden.value = isHidden(key) ? hidden.value.filter((item) => item !== key) : [...hidden.value, key];
};

const colorStyle = computed(() =>
  Object.fromEntries(
    Object.entries(props.config).flatMap(([key, item]) => {
      const value = chartItemColor(item);
      return value === undefined ? [] : [[`--color-${key}`, value]];
    }),
  ),
);

if (isDev()) {
  watch(
    () => Object.keys(props.config),
    (keys) => {
      for (const key of keys) {
        if (VARIABLE_NAME.test(key)) continue;
        console.warn(`[Chart] config key "${key}" cannot name a CSS variable, so --color-${key} will not resolve.`);
      }
    },
    { immediate: true },
  );
}

const pointer = shallowRef<ChartPointer>();
const track = (event: PointerEvent) => {
  const box = root.value!.getBoundingClientRect();
  const scale = box.width > 0 ? root.value!.offsetWidth / box.width : 1;
  pointer.value = {
    x: (event.clientX - box.left) * scale,
    y: (event.clientY - box.top) * scale,
    type: event.pointerType,
    down: event.buttons > 0,
  };
};
const active = shallowRef<ChartActive>();
const sameX = (a?: number | Date, b?: number | Date) => Object.is(Number(a), Number(b));
const setActive = (next: ChartActive) => {
  const current = active.value;
  if (current && current.datum === next.datum && current.index === next.index && sameX(current.x, next.x)) return;
  active.value = next;
};
const clearActive = () => {
  active.value = undefined;
};
const leave = () => {
  pointer.value = undefined;
  clearActive();
};

const unwrap = (datum: unknown): ChartDatum =>
  (datum !== null &&
  typeof datum === "object" &&
  "data" in datum &&
  typeof datum.data === "object" &&
  datum.data !== null
    ? datum.data
    : datum) as ChartDatum;
const events = (selector: string): ChartEvents => ({
  [selector]: {
    pointermove: (datum, _event, index) => setActive({ datum: unwrap(datum), index }),
    pointerdown: (datum, _event, index) => setActive({ datum: unwrap(datum), index }),
    pointerout: clearActive,
  },
});

const size = shallowRef({ width: 0, height: 0 });
useResizeObserver(root, () => {
  size.value = { width: root.value!.offsetWidth, height: root.value!.offsetHeight };
});

const ready = shallowRef(!props.lazy);
if (props.lazy) {
  const { stop } = useIntersectionObserver(
    root,
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      ready.value = true;
      stop();
    },
    { rootMargin: "200px" },
  );
}

provideChartContext({
  id,
  config: computed(() => props.config),
  hidden,
  toggle,
  isHidden,
  pointer,
  size,
  active,
  setActive,
  clearActive,
  events,
});
</script>

<template>
  <div
    ref="root"
    data-slot="chart"
    :data-chart="id"
    :role="props.label === undefined ? undefined : 'group'"
    :aria-label="props.label"
    :class="
      cn(
        'kappa-chart relative flex aspect-video w-full flex-col justify-center text-body-sm contain-inline-size',
        props.class,
      )
    "
    :style="colorStyle"
    @pointermove.passive="track"
    @pointerdown.passive="track"
    @pointerup.passive="track"
    @pointerleave="leave"
    @pointercancel="leave"
  >
    <slot v-if="ready" :id="id" />
  </div>
</template>

<style scoped>
@layer components {
  .kappa-chart {
    --vis-font-family: var(--font-sans);
    --vis-axis-font-family: var(--font-sans);
    --vis-axis-tick-color: var(--border);
    --vis-axis-tick-label-color: var(--muted-foreground);
    --vis-axis-tick-label-font-size: var(--typescale-body-sm-size);
    --vis-axis-label-color: var(--muted-foreground);
    --vis-axis-label-font-size: var(--typescale-body-sm-size);
    --vis-axis-grid-color: var(--border);
    --vis-axis-domain-color: var(--border);
    --vis-crosshair-line-stroke-color: var(--border);
    --vis-crosshair-circle-stroke-color: var(--background);
    --vis-crosshair-circle-stroke-width: 2px;
    --vis-donut-background-color: var(--muted);
    --vis-donut-segment-stroke-color: var(--background);
    --vis-donut-segment-stroke-width: 2px;
    --vis-donut-central-label-text-color: var(--foreground);
    --vis-donut-central-label-font-family: var(--font-sans);
    --vis-donut-central-sub-label-text-color: var(--muted-foreground);
    --vis-donut-central-sub-label-font-family: var(--font-sans);
    --vis-radial-bar-background-color: var(--muted);
    --vis-radial-bar-bar-stroke-color: var(--background);
    --vis-radial-bar-bar-stroke-width: 2px;
    --vis-radial-bar-central-label-text-color: var(--foreground);
    --vis-radial-bar-central-sub-label-text-color: var(--muted-foreground);
    min-height: 0;
    touch-action: pan-y;
  }

  .kappa-chart :deep([data-vis-xy-container]),
  .kappa-chart :deep([data-vis-single-container]) {
    width: 100%;
    flex: 1 1 auto;
    min-height: 0;
  }
}
</style>
