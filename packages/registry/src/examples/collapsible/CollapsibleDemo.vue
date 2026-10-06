<script setup lang="ts">
import { ChevronsUpDown } from "@lucide/vue";

import { Button } from "@/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/ui/collapsible";
</script>

<template>
  <Collapsible class="flex w-full max-w-sm flex-col gap-2">
    <div class="flex items-center justify-between gap-4 px-4">
      <h4 class="text-title-sm">@kappa starred 3 repositories</h4>
      <CollapsibleTrigger as-child>
        <Button variant="ghost" color="neutral" size="icon-md" aria-label="Toggle">
          <ChevronsUpDown />
        </Button>
      </CollapsibleTrigger>
    </div>
    <div class="rounded-md border px-4 py-2 font-mono text-body-sm">unovue/reka-ui</div>
    <CollapsibleContent class="flex flex-col gap-2">
      <div class="rounded-md border px-4 py-2 font-mono text-body-sm">unovue/shadcn-vue</div>
      <div class="rounded-md border px-4 py-2 font-mono text-body-sm">material-components/material-web</div>
    </CollapsibleContent>
  </Collapsible>
</template>
