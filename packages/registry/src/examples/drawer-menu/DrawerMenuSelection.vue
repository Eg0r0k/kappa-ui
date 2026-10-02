<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/ui/drawer";
import {
  DrawerMenu,
  DrawerMenuCheckboxItem,
  DrawerMenuLabel,
  DrawerMenuRadioGroup,
  DrawerMenuRadioItem,
  DrawerMenuSeparator,
} from "@/ui/drawer-menu";

const hidden = ref(false);
const extensions = ref(true);
const sort = ref("name");
</script>

<template>
  <Drawer>
    <DrawerTrigger as-child>
      <Button variant="outline" color="neutral">View options</Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>View</DrawerTitle>
        <DrawerDescription>Sorted by {{ sort }}.</DrawerDescription>
      </DrawerHeader>
      <DrawerMenu>
        <DrawerMenuLabel>Show</DrawerMenuLabel>
        <DrawerMenuCheckboxItem v-model="hidden" @select.prevent>Hidden files</DrawerMenuCheckboxItem>
        <DrawerMenuCheckboxItem v-model="extensions" @select.prevent>File extensions</DrawerMenuCheckboxItem>
        <DrawerMenuSeparator />
        <DrawerMenuLabel>Sort by</DrawerMenuLabel>
        <DrawerMenuRadioGroup v-model="sort">
          <DrawerMenuRadioItem value="name" @select.prevent>Name</DrawerMenuRadioItem>
          <DrawerMenuRadioItem value="date" @select.prevent>Date modified</DrawerMenuRadioItem>
          <DrawerMenuRadioItem value="size" @select.prevent>Size</DrawerMenuRadioItem>
        </DrawerMenuRadioGroup>
      </DrawerMenu>
    </DrawerContent>
  </Drawer>
</template>
