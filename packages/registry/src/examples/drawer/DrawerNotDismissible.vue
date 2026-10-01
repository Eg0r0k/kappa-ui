<script setup lang="ts">
import { Button } from "@/ui/button";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/ui/drawer";
</script>

<template>
  <Drawer :dismissible="false">
    <DrawerTrigger as-child>
      <Button variant="outline" color="neutral">Review the update</Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Update ready</DrawerTitle>
        <DrawerDescription>A swipe, Escape or a tap outside leaves this drawer where it is.</DrawerDescription>
      </DrawerHeader>
      <DrawerBody>
        <p class="text-body-md">Version 2.0 will restart the app.</p>
      </DrawerBody>
      <DrawerFooter>
        <DrawerClose as-child>
          <Button>Restart now</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
