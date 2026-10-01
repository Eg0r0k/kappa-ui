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
  <Drawer>
    <div class="relative h-56 overflow-hidden rounded-xl bg-muted ring-1 ring-surface-border">
      <div class="flex h-full flex-col items-center justify-center gap-3 pb-12 text-center">
        <p class="text-body-md text-muted-foreground">A page with a sheet tucked under its bottom edge.</p>
        <DrawerTrigger as-child>
          <Button variant="outline" color="neutral">Or press here</Button>
        </DrawerTrigger>
      </div>
      <DrawerSwipeArea
        class="absolute inset-x-0 bottom-0 flex h-12 cursor-grab items-center justify-center rounded-t-xl bg-popover text-body-sm text-muted-foreground ring-1 ring-surface-border"
      >
        Swipe up from here
      </DrawerSwipeArea>
    </div>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Nearby</DrawerTitle>
        <DrawerDescription>Opened by a swipe that started on the strip, or by the button.</DrawerDescription>
      </DrawerHeader>
      <DrawerBody>
        <p class="text-body-md">
          The strip is a DrawerSwipeArea positioned inside the page; the panel still slides in from the screen edge.
        </p>
      </DrawerBody>
    </DrawerContent>
  </Drawer>
</template>
