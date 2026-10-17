<script setup lang="ts">
import { TrendingUp } from "@lucide/vue";
import { VisArea, VisAxis, VisXYContainer } from "@unovis/vue";
import { useId } from "reka-ui";

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

const x = (_d: Month, i: number) => i;
const y = [(d: Month) => d.mobile, (d: Month) => d.desktop];
const keys = ["mobile", "desktop"];
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
const ticks = data.map((_d, i) => i);
const monthOf = (i: unknown) => data[Number(i)]?.month.slice(0, 3) ?? "";
const hide = () => "";
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>Area Chart - Gradient</CardTitle>
      <CardDescription>Showing total visitors for the last 6 months</CardDescription>
    </CardHeader>
    <CardContent>
      <ChartContainer
        :config="config"
        class="w-full [--vis-area-fill-opacity:0.4] [--vis-crosshair-line-stroke-width:0]"
      >
        <VisXYContainer :data="data" :svg-defs="svgDefs">
          <VisArea :x="x" :y="y" :color="fill" :line-color="color" :line-width="1" line />
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
          <ChartTooltipContent label-key="month" />
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
