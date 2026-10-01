<script setup lang="ts">
import { Button } from "@/ui/button";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerSwipeArea,
  DrawerTitle,
  DrawerTrigger,
} from "@/ui/drawer";
</script>

<template>
  <Drawer side="left">
    <DrawerTrigger as-child>
      <Button variant="outline" color="neutral">Open the menu</Button>
    </DrawerTrigger>
    <DrawerSwipeArea />
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Menu</DrawerTitle>
        <DrawerDescription
          >On a touch screen, swipe in from the left edge of the page to open this drawer.</DrawerDescription
        >
      </DrawerHeader>
      <DrawerBody>
        <p class="text-body-md">
          The swipe area is a strip along the edge that exists only while the drawer is closed.
        </p>
      </DrawerBody>
    </DrawerContent>
  </Drawer>
</template>
