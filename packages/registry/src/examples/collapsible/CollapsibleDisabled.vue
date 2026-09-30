<script setup lang="ts">
import { Button } from "@/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/ui/collapsible";
</script>

<template>
  <Collapsible disabled class="flex w-full max-w-sm flex-col gap-2">
    <CollapsibleTrigger as-child>
      <Button variant="soft" color="neutral">Locked section</Button>
    </CollapsibleTrigger>
    <CollapsibleContent>
      <div class="rounded-md border p-4">Never shown while disabled.</div>
    </CollapsibleContent>
  </Collapsible>
</template>
