<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/ui/drawer";

const open = ref(false);
</script>

<template>
  <div class="flex items-center gap-2">
    <Button variant="outline" color="neutral" @click="open = true">Open</Button>
    <span class="text-body-sm text-muted-foreground">{{ open ? "open" : "closed" }}</span>
  </div>
  <Drawer v-model:open="open">
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Controlled</DrawerTitle>
        <DrawerDescription>The parent owns the state and the drawer reports every change.</DrawerDescription>
      </DrawerHeader>
      <DrawerBody>
        <p class="text-body-md">Swipe down, press Escape or use the button.</p>
      </DrawerBody>
      <DrawerFooter>
        <Button variant="outline" color="neutral" @click="open = false">Close</Button>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
