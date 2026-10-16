<script setup lang="ts">
import { VisAxis, VisGroupedBar, VisXYContainer } from "@unovis/vue";
import { computed, ref } from "vue";

import {
  type ChartConfig,
  ChartContainer,
  ChartCrosshair,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
  chartColors,
} from "@/ui/chart";

defineOptions({ inheritAttrs: false });

type Month = { month: string; desktop: number; mobile: number };
type Series = "desktop" | "mobile";

const data: Month[] = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const config = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig;

const keys: Series[] = ["desktop", "mobile"];
const hidden = ref<string[]>([]);
const x = (_d: Month, i: number) => i;
const y = computed(() => keys.map((key) => (hidden.value.includes(key) ? () => null : (d: Month) => d[key])));
const color = chartColors(keys);
const ticks = data.map((_d, i) => i);
const monthOf = (i: unknown) => data[Number(i)]?.month.slice(0, 3) ?? "";
</script>

<template>
  <ChartContainer v-model:hidden="hidden" :config="config" class="min-h-50 w-full max-w-xl" v-bind="$attrs">
    <VisXYContainer :data="data" :padding="{ left: 24, right: 24 }">
      <VisGroupedBar :x="x" :y="y" :color="color" :rounded-corners="4" :group-padding="0.3" :bar-min-height="0" />
      <VisAxis type="x" :x="x" :tick-values="ticks" :tick-format="monthOf" :tick-line="false" :domain-line="false" />
      <ChartCrosshair :x="x" :color="color" :circle-radius="0" />
    </VisXYContainer>
    <ChartTooltip>
      <ChartTooltipContent :label-formatter="monthOf" />
    </ChartTooltip>
    <ChartLegend toggle />
  </ChartContainer>
</template>
