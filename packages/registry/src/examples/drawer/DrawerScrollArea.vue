<script setup lang="ts">
import { Button } from "@/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/ui/drawer";
import { ScrollArea } from "@/ui/scroll-area";

const paragraphs = Array.from({ length: 12 }, (_, index) => `Paragraph ${index + 1} of a long terms of service.`);
</script>

<template>
  <Drawer>
    <DrawerTrigger as-child>
      <Button variant="outline" color="neutral">Terms in a scroll area</Button>
    </DrawerTrigger>
    <DrawerContent class="h-[85dvh]">
      <DrawerHeader>
        <DrawerTitle>Terms of service</DrawerTitle>
        <DrawerDescription>The text scrolls in a ScrollArea, with its own scrollbar.</DrawerDescription>
      </DrawerHeader>
      <ScrollArea class="min-h-0 flex-1">
        <div class="flex flex-col gap-4 px-6 text-body-md">
          <p v-for="paragraph in paragraphs" :key="paragraph">
            {{ paragraph }} Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
            labore et dolore magna aliqua.
          </p>
        </div>
      </ScrollArea>
    </DrawerContent>
  </Drawer>
</template>
