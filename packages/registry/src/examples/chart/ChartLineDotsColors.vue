<script setup lang="ts">
import { TrendingUp } from "@lucide/vue";
import { VisAxis, VisLine, VisScatter, VisXYContainer } from "@unovis/vue";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartCrosshair,
  ChartTooltip,
  ChartTooltipContent,
  chartColors,
} from "@/ui/chart";

type Browser = { browser: "chrome" | "safari" | "firefox" | "edge" | "other"; visitors: number; fill: string };

const data: Browser[] = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
];

const config = {
  visitors: { label: "Visitors", color: "var(--chart-2)" },
  chrome: { label: "Chrome", color: "var(--chart-1)" },
  safari: { label: "Safari", color: "var(--chart-2)" },
  firefox: { label: "Firefox", color: "var(--chart-3)" },
  edge: { label: "Edge", color: "var(--chart-4)" },
  other: { label: "Other", color: "var(--chart-5)" },
} satisfies ChartConfig;

const x = (_d: Browser, i: number) => i;
const y = (d: Browser) => d.visitors;
const color = chartColors(["visitors"]);
const fill = (d: Browser) => d.fill;
const yDomain: [number, undefined] = [0, undefined];
const padding = { top: 24, left: 24, right: 24 };
const hide = () => "";
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>Line Chart - Dots Colors</CardTitle>
      <CardDescription>January - June 2024</CardDescription>
    </CardHeader>
    <CardContent>
      <ChartContainer :config="config" class="w-full [--vis-crosshair-line-stroke-width:0]">
        <VisXYContainer :data="data" :y-domain="yDomain" :padding="padding">
          <VisLine :x="x" :y="y" :color="color" :line-width="2" />
          <VisScatter :x="x" :y="y" :color="fill" :stroke-color="fill" :stroke-width="1" :size="10" />
          <VisAxis type="y" :num-ticks="2" :tick-format="hide" :tick-size="0" :tick-padding="0" :domain-line="false" />
          <ChartCrosshair :x="x" :y="y" :color="fill" />
        </VisXYContainer>
        <ChartTooltip>
          <ChartTooltipContent indicator="line" name-key="browser" hide-label />
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
