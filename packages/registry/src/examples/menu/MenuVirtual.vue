<script setup lang="ts">
import { ChevronDown } from "@lucide/vue";
import { ref } from "vue";

import { Button } from "@/ui/button";
import { Menu, MenuItem } from "@/ui/menu";
import { ScrollArea } from "@/ui/scroll-area";

const countries = Array.from({ length: 5000 }, (_, index) => `Region ${index + 1}`);
const chosen = ref("Region 1");
</script>

<template>
  <Button variant="outline" color="neutral" class="w-48 justify-between">
    {{ chosen }}
    <ChevronDown data-icon="inline-end" />
    <Menu fit class="p-0">
      <ScrollArea :items="countries" :virtualize="{ estimateSize: 36 }" class="h-64">
        <template #default="{ item }">
          <div class="px-1">
            <MenuItem @select="chosen = item">{{ item }}</MenuItem>
          </div>
        </template>
      </ScrollArea>
    </Menu>
  </Button>
</template>
