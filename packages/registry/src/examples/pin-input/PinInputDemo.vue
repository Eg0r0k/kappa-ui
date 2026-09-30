<script setup lang="ts">
import { ref } from "vue";

import { PinInput, PinInputGroup, PinInputSeparator, PinInputSlot } from "@/ui/pin-input";

const code = ref<string[]>([]);
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <PinInput v-model="code" aria-label="One-time code">
      <PinInputGroup>
        <PinInputSlot v-for="index in [0, 1, 2]" :key="index" :index="index" />
      </PinInputGroup>
      <PinInputSeparator />
      <PinInputGroup>
        <PinInputSlot v-for="index in [3, 4, 5]" :key="index" :index="index" />
      </PinInputGroup>
    </PinInput>
    <p class="text-body-sm text-muted-foreground">
      {{ code.join("").length === 6 ? `Code ${code.join("")}` : "Enter the six digits we sent you." }}
    </p>
  </div>
</template>
