<script setup lang="ts">
import { TrendingUp } from "@lucide/vue";
import { VisAxis, VisStackedBar, VisXYContainer } from "@unovis/vue";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartCrosshair,
  ChartLegend,
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
const y = [(d: Month) => d.desktop, (d: Month) => d.mobile];
const color = chartColors(["desktop", "mobile"]);
const ticks = data.map((_d, i) => i);
const monthOf = (i: unknown) => data[Number(i)]?.month.slice(0, 3) ?? "";
const hide = () => "";
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>Bar Chart - Stacked + Legend</CardTitle>
      <CardDescription>January - June 2024</CardDescription>
    </CardHeader>
    <CardContent>
      <ChartContainer :config="config" class="w-full">
        <VisXYContainer :data="data">
          <VisStackedBar :x="x" :y="y" :color="color" :rounded-corners="4" :bar-padding="0.05" />
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
          <ChartCrosshair :x="x" :y-stacked="y" :color="color" :circle-radius="0" />
        </VisXYContainer>
        <ChartTooltip>
          <ChartTooltipContent hide-label />
        </ChartTooltip>
        <ChartLegend />
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
