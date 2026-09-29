<script setup lang="ts">
import { Bold, Italic, Link, Underline } from "@lucide/vue";

import { Button } from "@/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/tooltip";

const tools = [
  { label: "Bold", icon: Bold },
  { label: "Italic", icon: Italic },
  { label: "Underline", icon: Underline },
  { label: "Link", icon: Link },
];
</script>

<template>
  <div class="flex gap-1">
    <Tooltip v-for="tool in tools" :key="tool.label" role="label">
      <TooltipTrigger as-child>
        <Button variant="ghost" color="neutral" size="icon" :aria-label="tool.label">
          <component :is="tool.icon" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{{ tool.label }}</TooltipContent>
    </Tooltip>
  </div>
</template>
