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
      <CardTitle>Tooltip - Advanced</CardTitle>
      <CardDescription>Tooltip with custom formatter and total.</CardDescription>
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
          <ChartTooltipContent hide-label>
            <template #item="{ item, index, datum }">
              <div class="flex w-full flex-wrap items-center gap-2">
                <div
                  class="size-2.5 shrink-0 rounded-xs bg-(--chart-indicator)"
                  :style="{ '--chart-indicator': item.color }"
                />
                {{ item.label }}
                <div class="ms-auto flex items-baseline gap-0.5 font-medium text-foreground tabular-nums">
                  {{ item.value }}
                  <span class="font-normal text-muted-foreground">kcal</span>
                </div>
                <div
                  v-if="index === 1"
                  class="mt-1.5 flex basis-full items-center border-t pt-1.5 font-medium text-foreground"
                >
                  Total
                  <div class="ms-auto flex items-baseline gap-0.5 font-medium text-foreground tabular-nums">
                    {{ Number(datum.running) + Number(datum.swimming) }}
                    <span class="font-normal text-muted-foreground">kcal</span>
                  </div>
                </div>
              </div>
            </template>
          </ChartTooltipContent>
        </ChartTooltip>
      </ChartContainer>
    </CardContent>
  </Card>
</template>
