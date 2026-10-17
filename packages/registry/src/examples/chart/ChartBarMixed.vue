<script setup lang="ts">
import { TrendingUp } from "@lucide/vue";
import { Direction, Orientation } from "@unovis/ts";
import { VisAxis, VisStackedBar, VisXYContainer } from "@unovis/vue";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { type ChartConfig, ChartContainer } from "@/ui/chart";

type Browser = { browser: "chrome" | "safari" | "firefox" | "edge" | "other"; visitors: number; fill: string };

const data: Browser[] = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
];

const config = {
  visitors: { label: "Visitors" },
  chrome: { label: "Chrome", color: "var(--chart-1)" },
  safari: { label: "Safari", color: "var(--chart-2)" },
  firefox: { label: "Firefox", color: "var(--chart-3)" },
  edge: { label: "Edge", color: "var(--chart-4)" },
  other: { label: "Other", color: "var(--chart-5)" },
} satisfies ChartConfig;

const category = (_d: Browser, i: number) => i;
const value = (d: Browser) => d.visitors;
const color = (d: Browser) => d.fill;
const ticks = data.map((_d, i) => i);
const browserOf = (i: unknown) => {
  const browser = data[Number(i)]?.browser;
  return browser ? config[browser].label : "";
};
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>Bar Chart - Mixed</CardTitle>
      <CardDescription>January - June 2024</CardDescription>
    </CardHeader>
    <CardContent>
      <ChartContainer :config="config" class="w-full">
        <VisXYContainer :data="data" :y-direction="Direction.South">
          <VisStackedBar
            :x="category"
            :y="value"
            :color="color"
            :orientation="Orientation.Horizontal"
            :rounded-corners="5"
          />
          <VisAxis
            type="y"
            :tick-values="ticks"
            :tick-format="browserOf"
            :tick-line="false"
            :domain-line="false"
            :grid-line="false"
          />
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
