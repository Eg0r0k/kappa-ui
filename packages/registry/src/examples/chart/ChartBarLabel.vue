<script setup lang="ts">
import { TrendingUp } from "@lucide/vue";
import { VisAxis, VisStackedBar, VisXYContainer, VisXYLabels } from "@unovis/vue";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartCrosshair,
  ChartTooltip,
  ChartTooltipContent,
  chartColors,
} from "@/ui/chart";

type Month = { month: string; desktop: number };

const data: Month[] = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];

const config = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
} satisfies ChartConfig;

const x = (d: Month) => data.findIndex((row) => row.month === d.month);
const y = (d: Month) => d.desktop;
const color = chartColors(["desktop"]);
const label = (d: Month) => `<tspan dy="-16">${d.desktop}</tspan>`;
const padding = { top: 24 };
const ticks = data.map((_d, i) => i);
const monthOf = (i: unknown) => data[Number(i)]?.month.slice(0, 3) ?? "";
const hide = () => "";
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>Bar Chart - Label</CardTitle>
      <CardDescription>January - June 2024</CardDescription>
    </CardHeader>
    <CardContent>
      <ChartContainer :config="config" class="w-full">
        <VisXYContainer :data="data" :padding="padding">
          <VisStackedBar :x="x" :y="y" :color="color" :rounded-corners="8" :bar-padding="0.05" />
          <VisXYLabels
            :x="x"
            :y="y"
            :label="label"
            color="var(--foreground)"
            background-color="transparent"
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
          <ChartCrosshair :x="x" :y="y" :color="color" :circle-radius="0" />
        </VisXYContainer>
        <ChartTooltip>
          <ChartTooltipContent hide-label />
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
