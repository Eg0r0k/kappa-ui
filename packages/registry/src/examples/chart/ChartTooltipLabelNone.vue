<script setup lang="ts">
import { VisAxis, VisStackedBar, VisXYContainer } from "@unovis/vue";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartCrosshair,
  ChartTooltip,
  ChartTooltipContent,
  chartColors,
} from "@/ui/chart";

type Day = { date: Date; running: number; swimming: number };

const data: Day[] = [
  { date: new Date(2024, 6, 15), running: 450, swimming: 300 },
  { date: new Date(2024, 6, 16), running: 380, swimming: 420 },
  { date: new Date(2024, 6, 17), running: 520, swimming: 120 },
  { date: new Date(2024, 6, 18), running: 140, swimming: 550 },
  { date: new Date(2024, 6, 19), running: 600, swimming: 350 },
  { date: new Date(2024, 6, 20), running: 480, swimming: 400 },
];

const config = {
  running: { label: "Running", color: "var(--chart-1)" },
  swimming: { label: "Swimming", color: "var(--chart-2)" },
} satisfies ChartConfig;

const keys = ["running", "swimming"];
const x = (d: Day) => d.date;
const y = [(d: Day) => d.running, (d: Day) => d.swimming];
const color = chartColors(keys);
const ticks = data.map((d) => d.date.getTime());
const weekday = (value: number) => new Date(value).toLocaleDateString("en-US", { weekday: "short" });
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>Tooltip - No Label</CardTitle>
      <CardDescription>Tooltip with no label.</CardDescription>
    </CardHeader>
    <CardContent>
      <ChartContainer :config="config" class="aspect-auto h-50 w-full">
        <VisXYContainer :data="data">
          <VisStackedBar :x="x" :y="y" :color="color" :rounded-corners="4" :bar-padding="0.4" />
          <VisAxis
            type="x"
            :x="x"
            :tick-values="ticks"
            :tick-format="weekday"
            :tick-line="false"
            :domain-line="false"
            :grid-line="false"
          />
          <ChartCrosshair :x="x" :color="color" :circle-radius="0" />
        </VisXYContainer>
        <ChartTooltip>
          <ChartTooltipContent hide-label indicator="line" />
        </ChartTooltip>
      </ChartContainer>
    </CardContent>
  </Card>
</template>
