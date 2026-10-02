<script setup lang="ts">
import { ChevronLeft } from "@lucide/vue";
import { DrawerMenuBack, DrawerMenuSeparator, DrawerMenuSubContent } from "@kappa-ui/core/drawer-menu";
import type { HTMLAttributes } from "vue";

import { drawerMenuBack, drawerMenuSeparator } from ".";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <DrawerMenuSubContent data-slot="drawer-menu-sub-content" :class="props.class">
    <DrawerMenuBack v-slot="{ label }" data-slot="drawer-menu-back" :class="drawerMenuBack">
      <ChevronLeft class="rtl:rotate-180" />
      {{ label }}
    </DrawerMenuBack>
    <DrawerMenuSeparator :class="drawerMenuSeparator" />
    <slot />
  </DrawerMenuSubContent>
</template>
