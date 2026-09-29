<script setup lang="ts">
import { Button } from "@/ui/button";
import { Tooltip, TooltipArrow, TooltipContent, TooltipTrigger } from "@/ui/tooltip";

const sides = ["top", "right", "bottom", "left"] as const;
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Tooltip v-for="side in sides" :key="side">
      <TooltipTrigger as-child>
        <Button variant="outline" class="capitalize">{{ side }}</Button>
      </TooltipTrigger>
      <TooltipContent :side="side">
        Opens on the {{ side }}
        <TooltipArrow />
      </TooltipContent>
    </Tooltip>
  </div>
</template>
