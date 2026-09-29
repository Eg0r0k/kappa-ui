<script setup lang="ts">
import { Button } from "@/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/tooltip";
</script>

<template>
  <Tooltip>
    <TooltipTrigger as-child>
      <Button variant="outline">Hover</Button>
    </TooltipTrigger>
    <TooltipContent>Add to library</TooltipContent>
  </Tooltip>
</template>
