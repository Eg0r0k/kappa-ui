<script setup lang="ts">
import { TrendingUp } from "@lucide/vue";
import { VisArea, VisAxis, VisXYContainer } from "@unovis/vue";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartCrosshair,
  ChartTooltip,
  ChartTooltipContent,
  chartColors,
} from "@/ui/chart";

type Month = { month: string; desktop: number; mobile: number; other: number };

const data: Month[] = [
  { month: "January", desktop: 186, mobile: 80, other: 45 },
  { month: "February", desktop: 305, mobile: 200, other: 100 },
  { month: "March", desktop: 237, mobile: 120, other: 150 },
  { month: "April", desktop: 73, mobile: 190, other: 50 },
  { month: "May", desktop: 209, mobile: 130, other: 100 },
  { month: "June", desktop: 214, mobile: 140, other: 160 },
];

const config = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
  other: { label: "Other", color: "var(--chart-3)" },
} satisfies ChartConfig;

const keys = ["other", "mobile", "desktop"] as const;
const total = (d: Month) => d.desktop + d.mobile + d.other;
const x = (_d: Month, i: number) => i;
const y = keys.map((key) => (d: Month) => d[key] / total(d));
const color = chartColors(keys);
const opacity = (_data: unknown, i: number) => (i === 0 ? 0.25 : 1);
const ticks = data.map((_d, i) => i);
const monthOf = (i: unknown) => data[Number(i)]?.month.slice(0, 3) ?? "";
const hide = () => "";
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>Area Chart - Stacked Expanded</CardTitle>
      <CardDescription>Showing total visitors for the last 6 months</CardDescription>
    </CardHeader>
    <CardContent>
      <ChartContainer
        :config="config"
        class="w-full [--vis-area-fill-opacity:0.4] [--vis-crosshair-line-stroke-width:0]"
      >
        <VisXYContainer :data="data">
          <VisArea :x="x" :y="y" :color="color" :opacity="opacity" :line-width="1" line />
          <VisAxis
            type="x"
            :x="x"
            :tick-values="ticks"
            :tick-format="monthOf"
            :tick-line="false"
            :domain-line="false"
            :grid-line="false"
          />
          <VisAxis type="y" :num-ticks="2" :tick-format="hide" :tick-size="0" :tick-padding="0" :domain-line="false" />
          <ChartCrosshair :x="x" :y-stacked="y" :color="color" />
        </VisXYContainer>
        <ChartTooltip>
          <ChartTooltipContent indicator="line" label-key="month" />
        </ChartTooltip>
      </ChartContainer>
    </CardContent>
    <CardFooter>
      <div class="grid gap-2 text-body-md">
        <div class="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month
          <TrendingUp class="size-4" />
        </div>
        <div class="leading-none text-muted-foreground">January - June 2024</div>
      </div>
    </CardFooter>
  </Card>
</template>
