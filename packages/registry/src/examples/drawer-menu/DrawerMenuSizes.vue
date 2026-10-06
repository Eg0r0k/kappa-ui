<script setup lang="ts">
import { Bell, Settings, User } from "@lucide/vue";

import { Button } from "@/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/ui/drawer";
import { DrawerMenu, DrawerMenuItem } from "@/ui/drawer-menu";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Drawer v-for="size in sizes" :key="size">
      <DrawerTrigger as-child>
        <Button variant="outline" color="neutral">{{ size }}</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Size {{ size }}</DrawerTitle>
        </DrawerHeader>
        <DrawerMenu :size="size">
          <DrawerMenuItem><User /> Profile</DrawerMenuItem>
          <DrawerMenuItem><Bell /> Notifications</DrawerMenuItem>
          <DrawerMenuItem><Settings /> Settings</DrawerMenuItem>
        </DrawerMenu>
      </DrawerContent>
    </Drawer>
  </div>
</template>
