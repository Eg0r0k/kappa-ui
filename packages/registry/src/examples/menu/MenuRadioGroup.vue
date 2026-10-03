<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { Menu, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuSeparator } from "@/ui/menu";

const position = ref("bottom");
</script>

<template>
  <Button variant="outline" color="neutral">
    Panel position
    <Menu class="w-56">
      <MenuLabel>Panel position</MenuLabel>
      <MenuSeparator />
      <MenuRadioGroup v-model="position">
        <MenuRadioItem value="top">Top</MenuRadioItem>
        <MenuRadioItem value="bottom">Bottom</MenuRadioItem>
        <MenuRadioItem value="right">Right</MenuRadioItem>
      </MenuRadioGroup>
    </Menu>
  </Button>
</template>
