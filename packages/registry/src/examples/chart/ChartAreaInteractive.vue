<script setup lang="ts">
import { VisArea, VisAxis, VisXYContainer } from "@unovis/vue";
import { useId } from "reka-ui";
import { computed, ref } from "vue";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartCrosshair,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
  chartColors,
} from "@/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

type Day = { date: Date; desktop: number; mobile: number };

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
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig;

const ranges = { "90d": 90, "30d": 30, "7d": 7 };
const timeRange = ref<keyof typeof ranges>("90d");
const filtered = computed(() => {
  const start = new Date(2024, 5, 30 - ranges[timeRange.value]);
  return data.filter((d) => d.date >= start);
});

const keys = ["mobile", "desktop"];
const x = (d: Day) => d.date;
const y = [(d: Day) => d.mobile, (d: Day) => d.desktop];
const color = chartColors(keys);
const id = useId();
const gradient = (key: string) => `gradient-${id}-${key}`;
const svgDefs = keys
  .map(
    (key) => `
      <linearGradient id="${gradient(key)}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stop-color="var(--color-${key})" stop-opacity="0.8" />
        <stop offset="95%" stop-color="var(--color-${key})" stop-opacity="0.1" />
      </linearGradient>`,
  )
  .join("");
const fill = (_data: unknown, i: number) => `url(#${gradient(keys[i]!)})`;
const ticks = computed(() => {
  const step = Math.ceil(filtered.value.length / 8);
  return filtered.value.filter((_d, i) => i % step === 0).map((d) => d.date.getTime());
});
const shortDate = (value: unknown) =>
  new Date(Number(value)).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const hide = () => "";
</script>

<template>
  <Card class="w-full pt-0">
    <CardHeader class="flex items-center gap-2 border-b py-5">
      <div class="grid flex-1 gap-1">
        <CardTitle>Area Chart - Interactive</CardTitle>
        <CardDescription>Showing total visitors for the last 3 months</CardDescription>
      </div>
      <Select v-model="timeRange">
        <SelectTrigger class="hidden w-40 sm:ms-auto sm:flex" aria-label="Select a value">
          <SelectValue placeholder="Last 3 months" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="90d">Last 3 months</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="7d">Last 7 days</SelectItem>
        </SelectContent>
      </Select>
    </CardHeader>
    <CardContent class="px-2 pt-4 sm:px-6 sm:pt-6">
      <ChartContainer
        :config="config"
        class="aspect-auto h-62.5 w-full [--vis-area-fill-opacity:0.6] [--vis-crosshair-line-stroke-width:0]"
      >
        <VisXYContainer :data="filtered" :svg-defs="svgDefs">
          <VisArea :x="x" :y="y" :color="fill" :line-color="color" :line-width="1" line />
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
          <ChartCrosshair :x="x" :y-stacked="y" :color="color" />
        </VisXYContainer>
        <ChartTooltip>
          <ChartTooltipContent :label-formatter="shortDate" />
        </ChartTooltip>
        <ChartLegend />
      </ChartContainer>
    </CardContent>
  </Card>
</template>
