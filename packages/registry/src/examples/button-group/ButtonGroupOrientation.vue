<script setup lang="ts">
import { Minus, Plus } from "@lucide/vue";

import { Button } from "@/ui/button";
import { ButtonGroup } from "@/ui/button-group";
</script>

<template>
  <div class="flex items-start gap-6">
    <ButtonGroup orientation="vertical" aria-label="Zoom">
      <Button variant="outline" color="neutral" size="icon" aria-label="Zoom in"><Plus /></Button>
      <Button variant="outline" color="neutral" size="icon" aria-label="Zoom out"><Minus /></Button>
    </ButtonGroup>
    <ButtonGroup orientation="vertical" aria-label="Alignment">
      <Button variant="outline" color="neutral">Top</Button>
      <Button variant="outline" color="neutral">Middle</Button>
      <Button variant="outline" color="neutral">Bottom</Button>
    </ButtonGroup>
  </div>
</template>
