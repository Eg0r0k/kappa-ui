<script setup lang="ts">
import { TrendingUp } from "@lucide/vue";
import { VisAxis, VisStackedBar, VisXYContainer, VisXYLabels } from "@unovis/vue";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { type ChartConfig, ChartContainer, ChartCrosshair, ChartTooltip, ChartTooltipContent } from "@/ui/chart";

type Month = { month: string; visitors: number };
type Row = Month & { index: number };

const data: Month[] = [
  { month: "January", visitors: 186 },
  { month: "February", visitors: 205 },
  { month: "March", visitors: -207 },
  { month: "April", visitors: 173 },
  { month: "May", visitors: -209 },
  { month: "June", visitors: 214 },
];

const config = {
  visitors: { label: "Visitors" },
} satisfies ChartConfig;

const rows: Row[] = data.map((row, index) => ({ ...row, index }));
const x = (d: Row) => d.index;
const y = (d: Month) => d.visitors;
const color = (d: Month) => (d.visitors > 0 ? "var(--chart-1)" : "var(--chart-2)");
const label = (d: Month) => `<tspan dy="${d.visitors > 0 ? -10 : 10}">${d.month}</tspan>`;
const extent = Math.max(...data.map((d) => Math.abs(d.visitors)));
const yDomain = [-extent, extent];
const padding = { top: 20, bottom: 20 };
const hide = () => "";
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>Bar Chart - Negative</CardTitle>
      <CardDescription>January - June 2024</CardDescription>
    </CardHeader>
    <CardContent>
      <ChartContainer :config="config" class="w-full [--vis-crosshair-line-stroke-width:0]">
        <VisXYContainer :data="rows" :y-domain="yDomain" :padding="padding">
          <VisStackedBar :x="x" :y="y" :color="color" :rounded-corners="0" :bar-padding="0.05" />
          <VisXYLabels
            :x="x"
            :y="y"
            :label="label"
            :color="color"
            background-color="none"
            :label-font-size="12"
            :clustering="false"
          />
          <VisAxis type="y" :num-ticks="2" :tick-format="hide" :tick-size="0" :tick-padding="0" :domain-line="false" />
          <ChartCrosshair :x="x" :y="y" :color="color" :circle-radius="0" />
        </VisXYContainer>
        <ChartTooltip>
          <ChartTooltipContent hide-label hide-indicator />
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
