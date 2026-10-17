<script setup lang="ts">
import { VisAxis, VisLine, VisXYContainer } from "@unovis/vue";
import { computed, ref } from "vue";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { type ChartConfig, ChartContainer, ChartCrosshair, ChartTooltip, ChartTooltipContent } from "@/ui/chart";

type Day = { date: Date; desktop: number; mobile: number };
type Views = { date: Date; views: number; fill: string };

const visits = [
  { desktop: 222, mobile: 150 },
  { desktop: 97, mobile: 180 },
  { desktop: 167, mobile: 120 },
  { desktop: 242, mobile: 260 },
  { desktop: 373, mobile: 290 },
  { desktop: 301, mobile: 340 },
  { desktop: 245, mobile: 180 },
  { desktop: 409, mobile: 320 },
  { desktop: 59, mobile: 110 },
  { desktop: 261, mobile: 190 },
  { desktop: 327, mobile: 350 },
  { desktop: 292, mobile: 210 },
  { desktop: 342, mobile: 380 },
  { desktop: 137, mobile: 220 },
  { desktop: 120, mobile: 170 },
  { desktop: 138, mobile: 190 },
  { desktop: 446, mobile: 360 },
  { desktop: 364, mobile: 410 },
  { desktop: 243, mobile: 180 },
  { desktop: 89, mobile: 150 },
  { desktop: 137, mobile: 200 },
  { desktop: 224, mobile: 170 },
  { desktop: 138, mobile: 230 },
  { desktop: 387, mobile: 290 },
  { desktop: 215, mobile: 250 },
  { desktop: 75, mobile: 130 },
  { desktop: 383, mobile: 420 },
  { desktop: 122, mobile: 180 },
  { desktop: 315, mobile: 240 },
  { desktop: 454, mobile: 380 },
  { desktop: 165, mobile: 220 },
  { desktop: 293, mobile: 310 },
  { desktop: 247, mobile: 190 },
  { desktop: 385, mobile: 420 },
  { desktop: 481, mobile: 390 },
  { desktop: 498, mobile: 520 },
  { desktop: 388, mobile: 300 },
  { desktop: 149, mobile: 210 },
  { desktop: 227, mobile: 180 },
  { desktop: 293, mobile: 330 },
  { desktop: 335, mobile: 270 },
  { desktop: 197, mobile: 240 },
  { desktop: 197, mobile: 160 },
  { desktop: 448, mobile: 490 },
  { desktop: 473, mobile: 380 },
  { desktop: 338, mobile: 400 },
  { desktop: 499, mobile: 420 },
  { desktop: 315, mobile: 350 },
  { desktop: 235, mobile: 180 },
  { desktop: 177, mobile: 230 },
  { desktop: 82, mobile: 140 },
  { desktop: 81, mobile: 120 },
  { desktop: 252, mobile: 290 },
  { desktop: 294, mobile: 220 },
  { desktop: 201, mobile: 250 },
  { desktop: 213, mobile: 170 },
  { desktop: 420, mobile: 460 },
  { desktop: 233, mobile: 190 },
  { desktop: 78, mobile: 130 },
  { desktop: 340, mobile: 280 },
  { desktop: 178, mobile: 230 },
  { desktop: 178, mobile: 200 },
  { desktop: 470, mobile: 410 },
  { desktop: 103, mobile: 160 },
  { desktop: 439, mobile: 380 },
  { desktop: 88, mobile: 140 },
  { desktop: 294, mobile: 250 },
  { desktop: 323, mobile: 370 },
  { desktop: 385, mobile: 320 },
  { desktop: 438, mobile: 480 },
  { desktop: 155, mobile: 200 },
  { desktop: 92, mobile: 150 },
  { desktop: 492, mobile: 420 },
  { desktop: 81, mobile: 130 },
  { desktop: 426, mobile: 380 },
  { desktop: 307, mobile: 350 },
  { desktop: 371, mobile: 310 },
  { desktop: 475, mobile: 520 },
  { desktop: 107, mobile: 170 },
  { desktop: 341, mobile: 290 },
  { desktop: 408, mobile: 450 },
  { desktop: 169, mobile: 210 },
  { desktop: 317, mobile: 270 },
  { desktop: 480, mobile: 530 },
  { desktop: 132, mobile: 180 },
  { desktop: 141, mobile: 190 },
  { desktop: 434, mobile: 380 },
  { desktop: 448, mobile: 490 },
  { desktop: 149, mobile: 200 },
  { desktop: 103, mobile: 160 },
  { desktop: 446, mobile: 400 },
];

const data: Day[] = visits.map((visit, i) => ({ date: new Date(2024, 3, 1 + i), ...visit }));

const config = {
  views: { label: "Page Views" },
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig;

const keys = ["desktop", "mobile"] as const;
const total = {
  desktop: data.reduce((sum, d) => sum + d.desktop, 0),
  mobile: data.reduce((sum, d) => sum + d.mobile, 0),
};
const activeChart = ref<(typeof keys)[number]>("desktop");
const color = computed(() => `var(--color-${activeChart.value})`);
const views = computed<Views[]>(() =>
  data.map((d) => ({ date: d.date, views: d[activeChart.value], fill: color.value })),
);

const x = (d: Views) => d.date;
const y = (d: Views) => d.views;
const yDomain: [number, undefined] = [0, undefined];
const step = Math.ceil(data.length / 8);
const ticks = data.filter((_d, i) => i % step === 0).map((d) => d.date.getTime());
const shortDate = (value: unknown) =>
  new Date(Number(value)).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const longDate = (value: unknown) =>
  new Date(Number(value)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const hide = () => "";
</script>

<template>
  <Card class="w-full py-4 sm:py-0">
    <CardHeader class="flex flex-col items-stretch border-b p-0! sm:flex-row">
      <div class="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
        <CardTitle>Line Chart - Interactive</CardTitle>
        <CardDescription>Showing total visitors for the last 3 months</CardDescription>
      </div>
      <div class="flex">
        <button
          v-for="key in keys"
          :key="key"
          type="button"
          :aria-pressed="activeChart === key"
          class="flex flex-1 flex-col justify-center gap-1 border-t border-border px-6 py-4 text-start even:border-s outline-none focus-visible:focus-ring-inset aria-pressed:bg-muted/50 sm:border-t-0 sm:border-s sm:px-8 sm:py-6"
          @click="activeChart = key"
        >
          <span class="text-body-sm text-muted-foreground">{{ config[key].label }}</span>
          <span class="text-body-lg leading-none font-bold sm:text-headline-md">
            {{ total[key].toLocaleString() }}
          </span>
        </button>
      </div>
    </CardHeader>
    <CardContent class="px-2 sm:p-6">
      <ChartContainer :config="config" class="aspect-auto h-62.5 w-full">
        <VisXYContainer :data="views" :y-domain="yDomain">
          <VisLine :x="x" :y="y" :color="color" :line-width="2" />
          <VisAxis
            type="x"
            :x="x"
            :tick-values="ticks"
            :tick-format="shortDate"
            :tick-line="false"
            :domain-line="false"
            :grid-line="false"
            tick-text-hide-overlapping
          />
          <VisAxis type="y" :num-ticks="2" :tick-format="hide" :tick-size="0" :tick-padding="0" :domain-line="false" />
          <ChartCrosshair :x="x" :y="y" :color="color" />
        </VisXYContainer>
        <ChartTooltip>
          <ChartTooltipContent class="w-37.5" :label-formatter="longDate" />
        </ChartTooltip>
      </ChartContainer>
    </CardContent>
  </Card>
</template>
