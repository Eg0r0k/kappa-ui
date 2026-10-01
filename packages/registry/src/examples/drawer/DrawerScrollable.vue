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

const paragraphs = Array.from({ length: 12 }, (_, index) => `Paragraph ${index + 1} of a long terms of service.`);
</script>

<template>
  <Drawer>
    <DrawerTrigger as-child>
      <Button variant="outline" color="neutral">Terms of service</Button>
    </DrawerTrigger>
    <DrawerContent class="h-[85dvh]">
      <DrawerHeader>
        <DrawerTitle>Terms of service</DrawerTitle>
        <DrawerDescription>Scroll to read. A drag from the top of the text closes the drawer.</DrawerDescription>
      </DrawerHeader>
      <DrawerBody class="flex flex-col gap-4 text-body-md">
        <p v-for="paragraph in paragraphs" :key="paragraph">
          {{ paragraph }} Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
          labore et dolore magna aliqua.
        </p>
      </DrawerBody>
    </DrawerContent>
  </Drawer>
</template>
