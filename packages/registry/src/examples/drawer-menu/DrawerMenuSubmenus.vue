<script setup lang="ts">
import { FolderInput, Link, Mail, MessageSquare, Share2 } from "@lucide/vue";

import { Button } from "@/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/ui/drawer";
import {
  DrawerMenu,
  DrawerMenuItem,
  DrawerMenuSub,
  DrawerMenuSubContent,
  DrawerMenuSubTrigger,
} from "@/ui/drawer-menu";

const folders = ["Design", "Engineering", "Marketing"];
</script>

<template>
  <Drawer>
    <DrawerTrigger as-child>
      <Button variant="outline" color="neutral">Share and move</Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>roadmap.key</DrawerTitle>
      </DrawerHeader>
      <DrawerMenu>
        <DrawerMenuSub>
          <DrawerMenuSubTrigger><Share2 /> Share</DrawerMenuSubTrigger>
          <DrawerMenuSubContent>
            <DrawerMenuItem><Mail /> Mail</DrawerMenuItem>
            <DrawerMenuItem><MessageSquare /> Messages</DrawerMenuItem>
            <DrawerMenuItem><Link /> Copy link</DrawerMenuItem>
          </DrawerMenuSubContent>
        </DrawerMenuSub>
        <DrawerMenuSub>
          <DrawerMenuSubTrigger><FolderInput /> Move to</DrawerMenuSubTrigger>
          <DrawerMenuSubContent>
            <DrawerMenuItem>Home</DrawerMenuItem>
            <DrawerMenuSub>
              <DrawerMenuSubTrigger>Projects</DrawerMenuSubTrigger>
              <DrawerMenuSubContent>
                <DrawerMenuItem v-for="folder in folders" :key="folder">{{ folder }}</DrawerMenuItem>
              </DrawerMenuSubContent>
            </DrawerMenuSub>
          </DrawerMenuSubContent>
        </DrawerMenuSub>
      </DrawerMenu>
    </DrawerContent>
  </Drawer>
</template>
