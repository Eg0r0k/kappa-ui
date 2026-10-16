<script setup lang="ts" generic="Datum">
import type { Crosshair, CrosshairConfigInterface } from "@unovis/ts";
import { VisCrosshair } from "@unovis/vue";
import { computed, shallowRef, watch } from "vue";

import { type ChartDatum, useChart } from ".";

defineOptions({ inheritAttrs: false });

type Config = CrosshairConfigInterface<Datum>;

const props = withDefaults(
  defineProps<{
    x?: Config["x"] | ((datum: Datum, index: number) => Date);
    y?: Config["y"];
    yStacked?: Config["yStacked"];
    color?: Config["color"];
    duration?: number;
    snapToData?: boolean;
    hideWhenFarFromPointer?: boolean;
    strokeColor?: Config["strokeColor"];
    strokeWidth?: Config["strokeWidth"];
    circleRadius?: number;
  }>(),
  {
    x: undefined,
    y: undefined,
    yStacked: undefined,
    color: undefined,
    duration: 0,
    snapToData: true,
    hideWhenFarFromPointer: false,
    strokeColor: undefined,
    strokeWidth: undefined,
    circleRadius: undefined,
  },
);

const { pointer, setActive, clearActive } = useChart();

const crosshair = shallowRef<{ component?: Crosshair<Datum> }>();
const forceShowAt = shallowRef<number | Date>();
const template = () => "";

// Unovis renders a hide on setData before the container hands over the y accessors, and warns without them.
watch(
  () => crosshair.value?.component,
  (component) => {
    if (!component) return;
    const current = component.accessors ?? {};
    if (current.y || current.yStacked) return;
    component.accessors = { ...current, x: (props.x as Config["x"]) ?? current.x, y: [], yStacked: [] };
  },
  { immediate: true },
);

const xOf = (datum: Datum, index: number, fallback?: number | Date) => {
  const accessor = props.x ?? crosshair.value?.component?.accessors.x;
  const value = typeof accessor === "function" ? accessor(datum, index) : accessor;
  return (value ?? fallback) as number | Date | undefined;
};

const onCrosshairMove = (x?: number | Date, datum?: Datum, index?: number) => {
  if (x === undefined || datum === undefined) {
    if (forceShowAt.value === undefined) clearActive();
    return;
  }
  setActive({ datum: datum as ChartDatum, index, x: xOf(datum, index ?? 0, x) });
};

const nearestTo = (clientX: number) => {
  const component = crosshair.value?.component;
  const data = component?.datamodel.data;
  const accessor = component?.accessors.x;
  if (!component || !data?.length || typeof accessor !== "function") return undefined;
  const matrix = (component.element as SVGGElement).getScreenCTM();
  if (!matrix) return undefined;
  const local = new DOMPoint(clientX, 0).matrixTransform(matrix.inverse());
  const target = Number(component.xScale.invert(local.x));
  let best = 0;
  let distance = Number.POSITIVE_INFINITY;
  data.forEach((datum, index) => {
    const delta = Math.abs(Number(accessor(datum, index)) - target);
    if (delta >= distance) return;
    distance = delta;
    best = index;
  });
  return { datum: data[best] as ChartDatum, index: best, x: accessor(data[best]!, best) as number | Date };
};

const clientXOf = (x: number) => {
  const root = (crosshair.value?.component?.element as SVGGElement | undefined)?.ownerSVGElement?.closest<HTMLElement>(
    "[data-slot=chart]",
  );
  if (!root) return undefined;
  const box = root.getBoundingClientRect();
  return box.left + (root.offsetWidth > 0 ? (x * box.width) / root.offsetWidth : x);
};

watch(pointer, (current) => {
  if (current === undefined || current.type === "mouse" || !current.down) {
    if (forceShowAt.value === undefined) return;
    forceShowAt.value = undefined;
    clearActive();
    return;
  }
  const clientX = clientXOf(current.x);
  if (clientX === undefined) return;
  const nearest = nearestTo(clientX);
  if (!nearest) return;
  forceShowAt.value = nearest.x;
  setActive(nearest);
});

const ownsAccessors = computed(() => props.y !== undefined || props.yStacked !== undefined);

const forwarded = computed(() =>
  Object.fromEntries(
    Object.entries({
      x: ownsAccessors.value ? props.x : undefined,
      y: props.y,
      yStacked: props.yStacked,
      color: props.color,
      duration: props.duration,
      snapToData: props.snapToData,
      hideWhenFarFromPointer: props.hideWhenFarFromPointer,
      strokeColor: props.strokeColor,
      strokeWidth: props.strokeWidth,
      circleRadius: props.circleRadius,
      forceShowAt: forceShowAt.value,
    }).filter(([, value]) => value !== undefined),
  ),
);
</script>

<template>
  <VisCrosshair
    ref="crosshair"
    v-bind="{ ...$attrs, ...forwarded, onCrosshairMove }"
    data-slot="chart-crosshair"
    :template="template"
  />
</template>
