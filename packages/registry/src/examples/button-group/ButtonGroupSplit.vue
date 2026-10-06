<script setup lang="ts">
import { ChevronDown } from "@lucide/vue";

import { Button } from "@/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/ui/button-group";
import { Menu, MenuItem } from "@/ui/menu";
</script>

<template>
  <ButtonGroup aria-label="Send">
    <Button>Send</Button>
    <ButtonGroupSeparator />
    <Button size="icon-md" aria-label="More send options">
      <ChevronDown />
      <Menu anchor="bottom end" self="top end" size="sm">
        <MenuItem>Schedule send</MenuItem>
        <MenuItem>Send without notification</MenuItem>
      </Menu>
    </Button>
  </ButtonGroup>
</template>
