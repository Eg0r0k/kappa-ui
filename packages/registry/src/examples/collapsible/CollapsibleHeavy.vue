<script setup lang="ts">
import { ChevronDown, File } from "@lucide/vue";

import { Button } from "@/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/ui/collapsible";

const rows = Array.from({ length: 300 }, (_, index) => `report-${String(index + 1).padStart(3, "0")}.csv`);
</script>

<template>
  <Collapsible class="flex w-full max-w-sm flex-col gap-2">
    <CollapsibleTrigger as-child>
      <Button
        variant="soft"
        color="neutral"
        class="justify-between [&>svg]:transition-transform [&>svg]:duration-short-4 [&>svg]:ease-standard [&[data-state=open]>svg]:rotate-180"
      >
        300 files
        <ChevronDown data-icon="inline-end" />
      </Button>
    </CollapsibleTrigger>
    <CollapsibleContent>
      <ul class="flex flex-col gap-1">
        <li v-for="row in rows" :key="row" class="flex items-center gap-2 rounded-md border px-3 py-1.5 text-body-sm">
          <File class="size-4 shrink-0 text-muted-foreground" />
          {{ row }}
        </li>
      </ul>
    </CollapsibleContent>
  </Collapsible>
</template>
