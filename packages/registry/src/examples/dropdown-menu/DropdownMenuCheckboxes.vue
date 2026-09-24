<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";

const statusBar = ref(true);
const activityBar = ref(false);
const panel = ref(false);
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" color="neutral">View</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-56" align="start">
      <DropdownMenuLabel>Appearance</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuCheckboxItem v-model="statusBar">Status bar</DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem v-model="activityBar" disabled>Activity bar</DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem v-model="panel">Panel</DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
