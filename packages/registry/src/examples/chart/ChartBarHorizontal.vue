<script setup lang="ts">
import { TrendingUp } from "@lucide/vue";
import { Direction, Orientation } from "@unovis/ts";
import { VisAxis, VisStackedBar, VisXYContainer } from "@unovis/vue";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { type ChartConfig, ChartContainer, chartColors } from "@/ui/chart";

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

const category = (_d: Month, i: number) => i;
const value = (d: Month) => d.desktop;
const color = chartColors(["desktop"]);
const ticks = data.map((_d, i) => i);
const monthOf = (i: unknown) => data[Number(i)]?.month.slice(0, 3) ?? "";
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>Bar Chart - Horizontal</CardTitle>
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
            :bar-padding="0.05"
          />
          <VisAxis
            type="y"
            :tick-values="ticks"
            :tick-format="monthOf"
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
