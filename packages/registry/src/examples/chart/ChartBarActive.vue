<script setup lang="ts">
import { TrendingUp } from "@lucide/vue";
import { VisAxis, VisStackedBar, VisXYContainer } from "@unovis/vue";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { type ChartConfig, ChartContainer, ChartCrosshair, ChartTooltip, ChartTooltipContent } from "@/ui/chart";

type Browser = { browser: "chrome" | "safari" | "firefox" | "edge" | "other"; visitors: number; fill: string };

const data: Browser[] = [
  { browser: "chrome", visitors: 187, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 275, fill: "var(--color-firefox)" },
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

const active = data[2]!.browser;

const x = (_d: Browser, i: number) => i;
const y = (d: Browser) => d.visitors;
const color = (d: Browser) => d.fill;
const barStyle = (d: Browser) =>
  d.browser === active
    ? { fillOpacity: 0.8, stroke: d.fill, strokeWidth: "2px", strokeDasharray: "4px", strokeDashoffset: "4px" }
    : {};
const ticks = data.map((_d, i) => i);
const browserOf = (i: unknown) => {
  const browser = data[Number(i)]?.browser;
  return browser ? config[browser].label : "";
};
const hide = () => "";
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>Bar Chart - Active</CardTitle>
      <CardDescription>January - June 2024</CardDescription>
    </CardHeader>
    <CardContent>
      <ChartContainer :config="config" class="w-full">
        <VisXYContainer :data="data">
          <VisStackedBar :x="x" :y="y" :color="color" :bar-style="barStyle" :rounded-corners="8" />
          <VisAxis
            type="x"
            :x="x"
            :tick-values="ticks"
            :tick-format="browserOf"
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
