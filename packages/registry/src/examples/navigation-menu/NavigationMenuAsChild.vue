<script setup lang="ts">
import { defineComponent, h, ref } from "vue";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/ui/navigation-menu";

const route = ref("/");

// Stands in for RouterLink or NuxtLink: a link that changes the route without reloading the page.
const AppLink = defineComponent({
  props: { to: { type: String, required: true } },
  setup(props, { slots }) {
    const navigate = (event: MouseEvent) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey) return;
      event.preventDefault();
      route.value = props.to;
    };
    return () => h("a", { href: `#${props.to}`, onClick: navigate }, slots.default?.());
  },
});

const settings = [
  { to: "/settings/profile", label: "Profile" },
  { to: "/settings/billing", label: "Billing" },
  { to: "/settings/team", label: "Team" },
];
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <NavigationMenu aria-label="App">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink as-child :active="route === '/'">
            <AppLink to="/">Home</AppLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem value="settings">
          <NavigationMenuTrigger>Settings</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul class="grid w-48 gap-1">
              <li v-for="link in settings" :key="link.to">
                <NavigationMenuLink as-child :active="route === link.to">
                  <AppLink :to="link.to">{{ link.label }}</AppLink>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
    <p class="text-body-sm text-muted-foreground">Route: {{ route }}</p>
  </div>
</template>
