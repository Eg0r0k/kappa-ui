<script setup lang="ts">
import { Ellipsis, FileText } from "@lucide/vue";
import { useMediaQuery } from "@vueuse/core";
import { ref } from "vue";

import { Button } from "@/ui/button";
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "@/ui/context-menu";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/ui/drawer";
import { DrawerMenu } from "@/ui/drawer-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/ui/dropdown-menu";

import FileMenuItems from "./FileMenuItems.vue";
import { contextParts, dropdownParts, sheetParts } from "./menu-parts";

const wide = useMediaQuery("(min-width: 768px)");
const starred = ref(false);
const sort = ref("name");
</script>

<template>
  <ContextMenu>
    <ContextMenuTrigger as-child :disabled="!wide">
      <div class="flex w-72 items-center gap-3 rounded-xl border border-border p-3">
        <FileText class="size-8 shrink-0 text-muted-foreground" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-title-sm">roadmap.key</p>
          <p class="text-body-sm text-muted-foreground">{{ wide ? "Right-click or press ⋯" : "Tap ⋯ for actions" }}</p>
        </div>
        <DropdownMenu v-if="wide">
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" color="neutral" size="icon-sm" aria-label="File actions"><Ellipsis /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-56">
            <FileMenuItems v-model:starred="starred" v-model:sort="sort" :parts="dropdownParts" />
          </DropdownMenuContent>
        </DropdownMenu>
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
      </div>
    </ContextMenuTrigger>
    <ContextMenuContent class="w-56">
      <FileMenuItems v-model:starred="starred" v-model:sort="sort" :parts="contextParts" />
    </ContextMenuContent>
  </ContextMenu>
</template>
