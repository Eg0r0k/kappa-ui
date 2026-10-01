<script setup lang="ts">
import { Button } from "@/ui/button";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/ui/drawer";

const sides = ["top", "right", "bottom", "left"] as const;
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Drawer v-for="side in sides" :key="side" :side="side">
      <DrawerTrigger as-child>
        <Button variant="outline" color="neutral" class="capitalize">{{ side }}</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle class="capitalize">{{ side }} drawer</DrawerTitle>
          <DrawerDescription>Swipe it back towards the {{ side }} edge to close.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <p class="text-body-md">The same parts on every side. Left and right drawers have no handle by default.</p>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  </div>
</template>
