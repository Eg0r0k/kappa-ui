<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/ui/drawer";

const snapPoints = [0.35, 0.6, 0.95];
const activeSnapPoint = ref<number | string | null>(snapPoints[0]!);

const places = [
  ["Riverside Market", "Open until 20:00 · 0.4 km"],
  ["Old Mill Bakery", "Open until 18:00 · 0.7 km"],
  ["Harbour Books", "Open until 19:00 · 1.1 km"],
  ["Pine Street Cafe", "Open until 22:00 · 1.3 km"],
  ["Station Pharmacy", "Open 24 hours · 1.6 km"],
  ["Linden Park", "Always open · 2.0 km"],
  ["North Pier", "Always open · 2.4 km"],
  ["Hilltop Observatory", "Open until 23:00 · 3.1 km"],
];
</script>

<template>
  <div class="flex items-center gap-2">
    <Drawer v-model:active-snap-point="activeSnapPoint" :snap-points="snapPoints" :fade-from-index="1">
      <DrawerTrigger as-child>
        <Button variant="outline" color="neutral">Nearby places</Button>
      </DrawerTrigger>
      <DrawerContent class="h-[95dvh]">
        <DrawerHeader>
          <DrawerTitle>Nearby places</DrawerTitle>
          <DrawerDescription>Drag the sheet, or tap the handle to step through its three heights.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody class="flex flex-col gap-4">
          <div class="flex flex-wrap gap-2">
            <Button
              v-for="point in snapPoints"
              :key="point"
              size="sm"
              :variant="point === activeSnapPoint ? 'solid' : 'outline'"
              color="neutral"
              @click="activeSnapPoint = point"
            >
              {{ Math.round(point * 100) }}%
            </Button>
          </div>
          <ul class="flex flex-col divide-y divide-border">
            <li v-for="[name, detail] in places" :key="name" class="flex flex-col py-3">
              <span class="text-body-md font-medium">{{ name }}</span>
              <span class="text-body-sm text-muted-foreground">{{ detail }}</span>
            </li>
          </ul>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
    <span class="text-body-sm text-muted-foreground">at {{ Math.round(Number(activeSnapPoint) * 100) }}%</span>
  </div>
</template>
