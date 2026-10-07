<script setup lang="ts">
import { Link, Mail, MessageSquare, Share2 } from "@lucide/vue";

import { Button } from "@/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/ui/drawer";
import {
  DrawerMenu,
  DrawerMenuItem,
  DrawerMenuSub,
  DrawerMenuSubContent,
  DrawerMenuSubTrigger,
} from "@/ui/drawer-menu";

const motions = [
  { label: "Zoom (keyframes)", class: "kappa-menu-zoom" },
  { label: "Fade (transition)", class: "kappa-menu-fade" },
];
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Drawer v-for="motion in motions" :key="motion.class">
      <DrawerTrigger as-child>
        <Button variant="outline" color="neutral">{{ motion.label }}</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{{ motion.label }}</DrawerTitle>
        </DrawerHeader>
        <DrawerMenu :class="motion.class">
          <DrawerMenuItem>Open</DrawerMenuItem>
          <DrawerMenuSub>
            <DrawerMenuSubTrigger><Share2 /> Share</DrawerMenuSubTrigger>
            <DrawerMenuSubContent>
              <DrawerMenuItem><Mail /> Mail</DrawerMenuItem>
              <DrawerMenuItem><MessageSquare /> Messages</DrawerMenuItem>
              <DrawerMenuItem><Link /> Copy link</DrawerMenuItem>
            </DrawerMenuSubContent>
          </DrawerMenuSub>
        </DrawerMenu>
      </DrawerContent>
    </Drawer>
  </div>
</template>

<style>
@keyframes kappa-menu-zoom-in {
  from {
    scale: 0.94;
    opacity: 0;
  }
}

@keyframes kappa-menu-zoom-out {
  to {
    scale: 1.04;
    opacity: 0;
  }
}

.kappa-menu-zoom [data-motion] {
  animation-duration: 220ms;
  animation-timing-function: cubic-bezier(0.2, 0, 0, 1);
  transform-origin: top center;
}

.kappa-menu-zoom [data-motion="from-end"],
.kappa-menu-zoom [data-motion="from-start"] {
  animation-name: kappa-menu-zoom-in;
}

.kappa-menu-zoom [data-motion="to-start"],
.kappa-menu-zoom [data-motion="to-end"] {
  animation-name: kappa-menu-zoom-out;
}

.kappa-menu-fade [data-drawer-menu-panel] {
  animation: none;
  transition:
    opacity 250ms cubic-bezier(0.2, 0, 0, 1),
    filter 250ms cubic-bezier(0.2, 0, 0, 1);
}

.kappa-menu-fade [data-drawer-menu-panel][data-state="inactive"] {
  opacity: 0;
  filter: blur(4px);
}

@starting-style {
  .kappa-menu-fade [data-drawer-menu-panel][data-state="active"] {
    opacity: 0;
    filter: blur(4px);
  }
}
</style>
