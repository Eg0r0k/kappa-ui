<script setup lang="ts">
import { Button } from "@/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/tooltip";
</script>

<template>
  <Tooltip>
    <TooltipTrigger as-child>
      <Button aria-disabled="true">Publish</Button>
    </TooltipTrigger>
    <TooltipContent>Add a title before publishing</TooltipContent>
  </Tooltip>
</template>
