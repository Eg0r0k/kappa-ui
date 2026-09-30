<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/ui/collapsible";

const open = ref(true);
</script>

<template>
  <div class="flex w-full max-w-sm flex-col gap-3">
    <Button variant="outline" color="neutral" class="self-start" @click="open = !open">
      {{ open ? "Hide" : "Show" }} from outside
    </Button>
    <Collapsible v-model:open="open" class="flex flex-col gap-2">
      <CollapsibleTrigger as-child>
        <Button variant="soft" color="neutral">Toggle inside</Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div class="rounded-md border p-4">Both buttons drive the same <code>open</code> ref.</div>
      </CollapsibleContent>
    </Collapsible>
  </div>
</template>
