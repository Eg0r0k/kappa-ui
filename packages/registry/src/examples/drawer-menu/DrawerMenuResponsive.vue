<script setup lang="ts">
import { Ellipsis, FileText } from "@lucide/vue";
import { useMediaQuery } from "@vueuse/core";
import { ref } from "vue";

import { Button } from "@/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/ui/drawer";
import { DrawerMenu } from "@/ui/drawer-menu";
import { Menu } from "@/ui/menu";

import FileMenuItems from "./FileMenuItems.vue";
import { menuParts, sheetParts } from "./menu-parts";

const wide = useMediaQuery("(min-width: 768px)");
const starred = ref(false);
const sort = ref("name");
</script>

<template>
  <div class="flex w-72 items-center gap-3 rounded-xl border border-border p-3">
    <FileText class="size-8 shrink-0 text-muted-foreground" />
    <div class="min-w-0 flex-1">
      <p class="truncate text-title-sm">roadmap.key</p>
      <p class="text-body-sm text-muted-foreground">{{ wide ? "Right-click or press ⋯" : "Tap ⋯ for actions" }}</p>
    </div>
    <Button v-if="wide" variant="ghost" color="neutral" size="icon-sm" aria-label="File actions">
      <Ellipsis />
      <Menu anchor="bottom end" self="top end" class="w-56">
        <FileMenuItems v-model:starred="starred" v-model:sort="sort" :parts="menuParts" />
      </Menu>
    </Button>
    <Drawer v-else>
      <DrawerTrigger as-child>
        <Button variant="ghost" color="neutral" size="icon-sm" aria-label="File actions"><Ellipsis /></Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>roadmap.key</DrawerTitle>
        </DrawerHeader>
        <DrawerMenu>
          <FileMenuItems v-model:starred="starred" v-model:sort="sort" :parts="sheetParts" />
        </DrawerMenu>
      </DrawerContent>
    </Drawer>
    <Menu v-if="wide" context-menu class="w-56">
      <FileMenuItems v-model:starred="starred" v-model:sort="sort" :parts="menuParts" />
    </Menu>
  </div>
</template>
