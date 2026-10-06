<script setup lang="ts">
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/ui/navigation-menu";

const sections = [
  { value: "shop", label: "Shop", links: ["New arrivals", "Bestsellers", "Gift cards"] },
  { value: "help", label: "Help", links: ["Shipping", "Returns", "Size guide"] },
];
</script>

<template>
  <NavigationMenu :unmount-on-hide="false" aria-label="Store">
    <NavigationMenuList>
      <NavigationMenuItem v-for="section in sections" :key="section.value" :value="section.value">
        <NavigationMenuTrigger>{{ section.label }}</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul class="grid w-44 gap-1">
            <li v-for="link in section.links" :key="link">
              <NavigationMenuLink href="#">{{ link }}</NavigationMenuLink>
            </li>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
</template>
