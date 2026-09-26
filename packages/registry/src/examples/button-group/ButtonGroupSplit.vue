<script setup lang="ts">
import { ChevronDown } from "@lucide/vue";

import { Button } from "@/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/ui/button-group";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
</script>

<template>
  <ButtonGroup aria-label="Send">
    <Button>Send</Button>
    <ButtonGroupSeparator />
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button size="icon" aria-label="More send options"><ChevronDown /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" size="sm">
        <DropdownMenuItem>Schedule send</DropdownMenuItem>
        <DropdownMenuItem>Send without notification</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </ButtonGroup>
</template>
