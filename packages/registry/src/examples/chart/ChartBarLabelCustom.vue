<script setup lang="ts">
import { TrendingUp } from "@lucide/vue";
import { Direction, Orientation } from "@unovis/ts";
import { VisAxis, VisStackedBar, VisXYContainer, VisXYLabels } from "@unovis/vue";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { type ChartConfig, ChartContainer, chartColors } from "@/ui/chart";

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
  desktop: { label: "Desktop", color: "var(--chart-2)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
  label: { color: "var(--background)" },
} satisfies ChartConfig;

const category = (d: Month) => data.findIndex((row) => row.month === d.month);
const value = (d: Month) => d.desktop;
const color = chartColors(["desktop"]);
const start = () => 0;
const leftAligned = (text: string | number) => `<tspan x="0" dx="8" text-anchor="start">${text}</tspan>`;
const monthLabel = (d: Month) => leftAligned(d.month);
const valueLabel = (d: Month) => leftAligned(d.desktop);
const padding = { right: 32 };
const hide = () => "";
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>Bar Chart - Custom Label</CardTitle>
      <CardDescription>January - June 2024</CardDescription>
    </CardHeader>
    <CardContent>
      <ChartContainer :config="config" class="w-full">
        <VisXYContainer :data="data" :padding="padding" :y-direction="Direction.South">
          <VisStackedBar
            :x="category"
            :y="value"
            :color="color"
            :orientation="Orientation.Horizontal"
            :rounded-corners="4"
            :bar-padding="0.05"
          />
          <VisXYLabels
            :x="start"
            :y="category"
            :label="monthLabel"
            color="var(--color-label)"
            background-color="transparent"
            :label-font-size="12"
            :clustering="false"
          />
          <VisXYLabels
            :x="value"
            :y="category"
            :label="valueLabel"
            color="var(--foreground)"
            background-color="transparent"
            :label-font-size="12"
            :clustering="false"
          />
          <VisAxis type="x" :num-ticks="2" :tick-format="hide" :tick-size="0" :tick-padding="0" :domain-line="false" />
        </VisXYContainer>
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
