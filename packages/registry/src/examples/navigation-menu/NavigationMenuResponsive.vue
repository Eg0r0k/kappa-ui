<script setup lang="ts">
import { Menu as MenuIcon } from "@lucide/vue";
import { useMediaQuery } from "@vueuse/core";

import { Button } from "@/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/ui/drawer";
import {
  DrawerMenu,
  DrawerMenuItem,
  DrawerMenuSub,
  DrawerMenuSubContent,
  DrawerMenuSubTrigger,
} from "@/ui/drawer-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/ui/navigation-menu";

const wide = useMediaQuery("(min-width: 768px)");

const products = ["Analytics", "Automations", "Integrations"];
const company = ["About", "Careers", "Press"];
</script>

<template>
  <header class="flex w-full max-w-xl items-center justify-between gap-4 rounded-xl border border-border px-4 py-2">
    <span class="text-title-sm">Acme</span>
    <NavigationMenu v-if="wide" aria-label="Main">
      <NavigationMenuList>
        <NavigationMenuItem value="product">
          <NavigationMenuTrigger>Product</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul class="grid w-48 gap-1">
              <li v-for="item in products" :key="item">
                <NavigationMenuLink href="#">{{ item }}</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="company">
          <NavigationMenuTrigger>Company</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul class="grid w-40 gap-1">
              <li v-for="item in company" :key="item">
                <NavigationMenuLink href="#">{{ item }}</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#">Pricing</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
    <Drawer v-else>
      <DrawerTrigger as-child>
        <Button variant="ghost" color="neutral" size="icon-md" aria-label="Open menu"><MenuIcon /></Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Acme</DrawerTitle>
        </DrawerHeader>
        <DrawerMenu>
          <DrawerMenuSub>
            <DrawerMenuSubTrigger>Product</DrawerMenuSubTrigger>
            <DrawerMenuSubContent>
              <DrawerMenuItem v-for="item in products" :key="item">{{ item }}</DrawerMenuItem>
            </DrawerMenuSubContent>
          </DrawerMenuSub>
          <DrawerMenuSub>
            <DrawerMenuSubTrigger>Company</DrawerMenuSubTrigger>
            <DrawerMenuSubContent>
              <DrawerMenuItem v-for="item in company" :key="item">{{ item }}</DrawerMenuItem>
            </DrawerMenuSubContent>
          </DrawerMenuSub>
          <DrawerMenuItem>Pricing</DrawerMenuItem>
        </DrawerMenu>
      </DrawerContent>
    </Drawer>
  </header>
</template>
