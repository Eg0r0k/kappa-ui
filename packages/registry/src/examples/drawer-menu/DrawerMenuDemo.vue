<script setup lang="ts">
import { Copy, FolderOpen, Pencil, Trash2 } from "@lucide/vue";

import { Button } from "@/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/ui/drawer";
import { DrawerMenu, DrawerMenuItem, DrawerMenuSeparator } from "@/ui/drawer-menu";
</script>

<template>
  <Drawer>
    <DrawerTrigger as-child>
      <Button variant="outline" color="neutral">report.pdf</Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>report.pdf</DrawerTitle>
        <DrawerDescription>2.4 MB, edited today</DrawerDescription>
      </DrawerHeader>
      <DrawerMenu>
        <DrawerMenuItem><FolderOpen /> Open</DrawerMenuItem>
        <DrawerMenuItem><Pencil /> Rename</DrawerMenuItem>
        <DrawerMenuItem><Copy /> Duplicate</DrawerMenuItem>
        <DrawerMenuSeparator />
        <DrawerMenuItem variant="destructive"><Trash2 /> Delete</DrawerMenuItem>
      </DrawerMenu>
    </DrawerContent>
  </Drawer>
</template>
