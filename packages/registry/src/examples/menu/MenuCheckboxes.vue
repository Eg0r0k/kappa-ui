<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { Menu, MenuCheckboxItem, MenuLabel, MenuSeparator } from "@/ui/menu";

const statusBar = ref(true);
const activityBar = ref(false);
const panel = ref(false);
</script>

<template>
  <Button variant="outline" color="neutral">
    View
    <Menu class="w-56">
      <MenuLabel>Appearance</MenuLabel>
      <MenuSeparator />
      <MenuCheckboxItem v-model="statusBar">Status bar</MenuCheckboxItem>
      <MenuCheckboxItem v-model="activityBar" disabled>Activity bar</MenuCheckboxItem>
      <MenuCheckboxItem v-model="panel">Panel</MenuCheckboxItem>
    </Menu>
  </Button>
</template>
