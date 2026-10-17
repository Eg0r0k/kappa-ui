<script setup lang="ts">
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { type ChartDatum, type ChartTooltipRow, chartItemColor, useChart } from ".";

const props = withDefaults(
  defineProps<{
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "dot" | "line" | "dashed";
    nameKey?: string;
    labelKey?: string;
    labelFormatter?: (x: unknown, datum: ChartDatum) => string;
    valueFormatter?: (value: unknown, key: string, datum: ChartDatum) => string;
    class?: HTMLAttributes["class"];
  }>(),
  {
    indicator: "dot",
    nameKey: undefined,
    labelKey: undefined,
    labelFormatter: undefined,
    valueFormatter: undefined,
    class: undefined,
  },
);

defineSlots<{
  label?: (props: { label: string }) => unknown;
  item?: (props: { item: ChartTooltipRow; index: number; datum: ChartDatum }) => unknown;
}>();

const { config, active, isHidden } = useChart();

const rows = computed<ChartTooltipRow[]>(() => {
  const datum = active.value?.datum;
  if (!datum) return [];
  return Object.entries(config.value).flatMap(([key, item]) => {
    if (!(key in datum) || isHidden(key)) return [];
    const name = props.nameKey === undefined ? key : String(datum[props.nameKey]);
    const named = props.nameKey === undefined ? item : config.value[name];
    return [
      {
        key,
        name,
        label: named?.label ?? name,
        value: datum[key],
        color: chartItemColor(named) ?? (typeof datum.fill === "string" ? datum.fill : undefined),
        icon: named?.icon,
      },
    ];
  });
});

const formatX = (x: unknown) => {
  if (x instanceof Date) return x.toLocaleDateString();
  if (typeof x === "number") return x.toLocaleString();
  return x === undefined || x === null ? "" : String(x);
};

const label = computed(() => {
  const current = active.value;
  if (!current || props.hideLabel) return undefined;
  if (props.labelFormatter)
    return props.labelFormatter(current.x ?? current.datum[props.labelKey ?? ""], current.datum);
  if (props.labelKey !== undefined) {
    const own = config.value[props.labelKey]?.label;
    if (typeof own === "string") return own;
    const field = current.datum[props.labelKey];
    const named = config.value[String(field)]?.label;
    return typeof named === "string" ? named : formatX(field);
  }
  return current.x === undefined ? undefined : formatX(current.x);
});

const nested = computed(() => rows.value.length === 1 && props.indicator !== "dot");

const formatValue = (row: ChartTooltipRow) => {
  const datum = active.value!.datum;
  if (props.valueFormatter) return props.valueFormatter(row.value, row.key, datum);
  return typeof row.value === "number" ? row.value.toLocaleString() : String(row.value);
};
</script>

<template>
  <div
    data-slot="chart-tooltip-content"
    :class="
      cn(
        `
          grid min-w-32 items-start gap-1.5 rounded-surface-xs border border-surface-border bg-popover px-2.5 py-1.5
          text-body-sm text-popover-foreground shadow-shadow-popover
        `,
        props.class,
      )
    "
  >
    <div v-if="!nested && label !== undefined && label !== ''" class="font-medium">
      <slot name="label" :label="label">{{ label }}</slot>
    </div>
    <div class="grid gap-1.5">
      <div
        v-for="(row, index) in rows"
        :key="row.key"
        data-slot="chart-tooltip-item"
        :class="
          cn(
            'flex w-full flex-wrap items-stretch gap-2 [&>svg]:size-2.5 [&>svg]:text-muted-foreground',
            props.indicator === 'dot' && 'items-center',
          )
        "
      >
        <slot name="item" :item="row" :index="index" :datum="active!.datum">
          <component :is="row.icon" v-if="row.icon" />
          <div
            v-else-if="!props.hideIndicator"
            data-slot="chart-tooltip-indicator"
            :class="
              cn('shrink-0 rounded-xs border-(--chart-indicator) bg-(--chart-indicator)', {
                'size-2.5': props.indicator === 'dot',
                'w-1': props.indicator === 'line',
                'w-0 border-[1.5px] border-dashed bg-transparent': props.indicator === 'dashed',
                'my-0.5': nested && props.indicator === 'dashed',
              })
            "
            :style="{ '--chart-indicator': row.color }"
          />
          <div :class="cn('flex flex-1 justify-between leading-none', nested ? 'items-end' : 'items-center')">
            <div class="grid gap-1.5">
              <div v-if="nested && label !== undefined && label !== ''" class="font-medium">{{ label }}</div>
              <span class="text-muted-foreground">
                <component :is="row.label" v-if="typeof row.label !== 'string'" />
                <template v-else>{{ row.label }}</template>
              </span>
            </div>
            <span v-if="row.value !== null && row.value !== undefined" class="font-medium text-foreground tabular-nums">
              {{ formatValue(row) }}
            </span>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>
