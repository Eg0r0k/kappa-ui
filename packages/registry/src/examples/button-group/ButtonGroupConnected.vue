<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { ButtonGroup } from "@/ui/button-group";

const views = ["Day", "Week", "Month", "Year"];
const view = ref("Week");
</script>

<template>
  <ButtonGroup aria-label="Calendar view" class="gap-0.5 *:rounded-[--spacing(4.5)] [--button-group-radius:var(--radius-sm)]">
    <Button
      v-for="option in views"
      :key="option"
      :variant="view === option ? 'solid' : 'soft'"
      :aria-pressed="view === option"
      class="transition-[border-radius,color,background-color] duration-medium-2 aria-pressed:[--button-group-radius:--spacing(4.5)]"
      @click="view = option"
    >
      {{ option }}
    </Button>
  </ButtonGroup>
</template>
