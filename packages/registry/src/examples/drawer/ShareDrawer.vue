<script setup lang="ts">
import { Button } from "@/ui/button";
import { DrawerBody, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, useDialogContext } from "@/ui/drawer";

const props = defineProps<{ file: string }>();

const { close } = useDialogContext<string>();

const targets = ["Messages", "Mail", "Notes", "Files"];
</script>

<template>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Share {{ props.file }}</DrawerTitle>
      <DrawerDescription>Pick where to send it, or swipe the sheet away.</DrawerDescription>
    </DrawerHeader>
    <DrawerBody>
      <div class="grid grid-cols-2 gap-2">
        <Button v-for="target in targets" :key="target" variant="outline" color="neutral" @click="close(target)">
          {{ target }}
        </Button>
      </div>
    </DrawerBody>
  </DrawerContent>
</template>
