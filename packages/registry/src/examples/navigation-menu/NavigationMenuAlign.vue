<script setup lang="ts">
import { ref } from "vue";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/ui/navigation-menu";
import { ToggleGroup, ToggleGroupItem } from "@/ui/toggle-group";

const aligns = ["start", "center", "end"] as const;
const align = ref<(typeof aligns)[number]>("start");
const dir = ref<"ltr" | "rtl">("ltr");

const setAlign = (value: unknown) => {
  align.value = aligns.find((candidate) => candidate === value) ?? align.value;
};
const setDir = (value: unknown) => {
  if (value === "ltr" || value === "rtl") dir.value = value;
};
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div class="flex flex-wrap justify-center gap-2">
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        aria-label="Align"
        :model-value="align"
        @update:model-value="setAlign"
      >
        <ToggleGroupItem v-for="value in aligns" :key="value" :value="value">{{ value }}</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        aria-label="Direction"
        :model-value="dir"
        @update:model-value="setDir"
      >
        <ToggleGroupItem value="ltr">ltr</ToggleGroupItem>
        <ToggleGroupItem value="rtl">rtl</ToggleGroupItem>
      </ToggleGroup>
    </div>
    <NavigationMenu :align="align" :dir="dir" aria-label="Account">
      <NavigationMenuList>
        <NavigationMenuItem value="orders">
          <NavigationMenuTrigger>{{ dir === "rtl" ? "الطلبات" : "Orders" }}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul class="grid w-56 gap-1">
              <li>
                <NavigationMenuLink href="#">{{
                  dir === "rtl" ? "الطلبات الحالية" : "Open orders"
                }}</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">{{ dir === "rtl" ? "المرتجعات" : "Returns" }}</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">{{ dir === "rtl" ? "الفواتير" : "Invoices" }}</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#">{{ dir === "rtl" ? "المساعدة" : "Help" }}</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  </div>
</template>
