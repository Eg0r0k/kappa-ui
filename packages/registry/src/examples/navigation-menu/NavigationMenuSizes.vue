<script setup lang="ts">
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/ui/navigation-menu";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <div class="flex flex-col items-start gap-3">
    <NavigationMenu v-for="size in sizes" :key="size" :size="size" :aria-label="`Size ${size}`">
      <NavigationMenuList>
        <NavigationMenuItem value="products">
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul class="grid w-56 gap-1">
              <li><NavigationMenuLink href="#">Analytics</NavigationMenuLink></li>
              <li><NavigationMenuLink href="#">Automations</NavigationMenuLink></li>
              <li><NavigationMenuLink href="#">Reports</NavigationMenuLink></li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#">Pricing</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#">Blog</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  </div>
</template>
