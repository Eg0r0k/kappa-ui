<script setup lang="ts">
import { TrendingUp } from "@lucide/vue";
import { VisArea, VisAxis, VisXYContainer } from "@unovis/vue";

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
const color = chartColors(["mobile", "desktop"]);
const ticks = data.map((_d, i) => i);
const monthOf = (i: unknown) => data[Number(i)]?.month.slice(0, 3) ?? "";
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>Area Chart - Axes</CardTitle>
      <CardDescription>Showing total visitors for the last 6 months</CardDescription>
    </CardHeader>
    <CardContent>
      <ChartContainer :config="config" class="w-full [--vis-area-fill-opacity:0.4]">
        <VisXYContainer :data="data">
          <VisArea :x="x" :y="y" :color="color" line />
          <VisAxis
            type="x"
            :x="x"
            :tick-values="ticks"
            :tick-format="monthOf"
            :tick-line="false"
            :domain-line="false"
            :grid-line="false"
          />
          <VisAxis type="y" :num-ticks="3" :tick-line="false" :domain-line="false" />
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
