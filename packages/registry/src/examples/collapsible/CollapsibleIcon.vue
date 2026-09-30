<script setup lang="ts">
import { ChevronDown } from "@lucide/vue";

import { Button } from "@/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/ui/collapsible";
</script>

<template>
  <Collapsible class="flex w-full max-w-sm flex-col gap-2">
    <CollapsibleTrigger as-child>
      <Button
        variant="soft"
        color="neutral"
        class="justify-between [&>svg]:transition-transform [&>svg]:duration-short-4 [&>svg]:ease-standard [&[data-state=open]>svg]:rotate-180"
      >
        Show details
        <ChevronDown data-icon="inline-end" />
      </Button>
    </CollapsibleTrigger>
    <CollapsibleContent>
      <div class="rounded-md border p-4">The chevron turns half a round while this is open.</div>
    </CollapsibleContent>
  </Collapsible>
</template>
