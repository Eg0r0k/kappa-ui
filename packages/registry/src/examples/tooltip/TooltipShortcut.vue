<script setup lang="ts">
import { Button } from "@/ui/button";
import { Kbd, KbdGroup } from "@/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/tooltip";
</script>

<template>
  <Tooltip>
    <TooltipTrigger as-child>
      <Button variant="outline">Save</Button>
    </TooltipTrigger>
    <TooltipContent class="flex items-center gap-2">
      Save changes
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>S</Kbd>
      </KbdGroup>
    </TooltipContent>
  </Tooltip>
</template>
