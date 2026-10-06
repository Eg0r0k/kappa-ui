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

const current = ref("Changelog");
const pages = ["Docs", "Changelog", "Blog"];
</script>

<template>
  <NavigationMenu variant="link" aria-label="Site">
    <NavigationMenuList class="gap-0">
      <NavigationMenuItem v-for="page in pages" :key="page">
        <NavigationMenuLink href="#" :active="current === page" @click.prevent="current = page">
          {{ page }}
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem value="community">
        <NavigationMenuTrigger>Community</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul class="grid w-48 gap-1">
            <li><NavigationMenuLink href="#">Discussions</NavigationMenuLink></li>
            <li><NavigationMenuLink href="#">Discord</NavigationMenuLink></li>
            <li><NavigationMenuLink href="#" disabled>Meetups (soon)</NavigationMenuLink></li>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
</template>
