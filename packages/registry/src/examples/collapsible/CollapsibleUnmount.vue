<script setup lang="ts">
import { Button } from "@/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/ui/collapsible";
</script>

<template>
  <Collapsible unmount-on-hide class="flex w-full max-w-sm flex-col gap-2">
    <CollapsibleTrigger as-child>
      <Button variant="soft" color="neutral">Monthly report</Button>
    </CollapsibleTrigger>
    <CollapsibleContent>
      <div class="rounded-md border p-4">A heavy chart would only be mounted while this is open.</div>
    </CollapsibleContent>
  </Collapsible>
</template>
