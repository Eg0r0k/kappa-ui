<script setup lang="ts">
import { TrendingUp } from "@lucide/vue";
import { VisAxis, VisLine, VisScatter, VisXYContainer, VisXYLabels } from "@unovis/vue";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartCrosshair,
  ChartTooltip,
  ChartTooltipContent,
  chartColors,
} from "@/ui/chart";

type Month = { month: string; desktop: number; mobile: number };
type Row = Month & { index: number };

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
} satisfies ChartConfig;

const rows: Row[] = data.map((row, index) => ({ ...row, index }));
const x = (d: Row) => d.index;
const y = (d: Month) => d.desktop;
const color = chartColors(["desktop"]);
const label = (d: Month) => `<tspan dy="-16">${d.desktop}</tspan>`;
const yDomain: [number, undefined] = [0, undefined];
const padding = { top: 24, left: 12, right: 12 };
const ticks = data.map((_d, i) => i);
const monthOf = (i: unknown) => data[Number(i)]?.month.slice(0, 3) ?? "";
const hide = () => "";
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>Line Chart - Label</CardTitle>
      <CardDescription>January - June 2024</CardDescription>
    </CardHeader>
    <CardContent>
      <ChartContainer :config="config" class="w-full [--vis-crosshair-line-stroke-width:0]">
        <VisXYContainer :data="rows" :y-domain="yDomain" :padding="padding">
          <VisLine :x="x" :y="y" :color="color" :line-width="2" />
          <VisScatter :x="x" :y="y" :color="color" :size="8" />
          <VisXYLabels
            :x="x"
            :y="y"
            :label="label"
            color="var(--foreground)"
            background-color="none"
            :label-font-size="12"
            :clustering="false"
          />
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
          <ChartCrosshair :x="x" :y="y" :color="color" :circle-radius="6" />
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
        <div class="leading-none text-muted-foreground">Showing total visitors for the last 6 months</div>
      </div>
    </CardFooter>
  </Card>
</template>
