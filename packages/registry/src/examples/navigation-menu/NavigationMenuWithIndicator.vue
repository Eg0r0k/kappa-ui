<script setup lang="ts">
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/ui/navigation-menu";

const sections = [
  { value: "platform", label: "Platform", links: ["Deployments", "Edge functions", "Storage"] },
  { value: "solutions", label: "Solutions", links: ["E-commerce", "Media", "Startups"] },
  { value: "resources", label: "Resources", links: ["Docs", "Templates", "Status"] },
];
</script>

<template>
  <NavigationMenu aria-label="Product">
    <NavigationMenuList>
      <NavigationMenuItem v-for="section in sections" :key="section.value" :value="section.value">
        <NavigationMenuTrigger>{{ section.label }}</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul class="grid w-48 gap-1">
            <li v-for="link in section.links" :key="link">
              <NavigationMenuLink href="#">{{ link }}</NavigationMenuLink>
            </li>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuIndicator />
    </NavigationMenuList>
  </NavigationMenu>
</template>
