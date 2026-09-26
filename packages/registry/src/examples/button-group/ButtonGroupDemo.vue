<script setup lang="ts">
import { Archive, Clock, Flag } from "@lucide/vue";

import { Button } from "@/ui/button";
import { ButtonGroup } from "@/ui/button-group";
</script>

<template>
  <ButtonGroup aria-label="Message actions">
    <Button variant="outline" color="neutral">
      <Archive data-icon="inline-start" />
      Archive
    </Button>
    <Button variant="outline" color="neutral">
      <Flag data-icon="inline-start" />
      Report
    </Button>
    <Button variant="outline" color="neutral">
      <Clock data-icon="inline-start" />
      Snooze
    </Button>
  </ButtonGroup>
</template>
