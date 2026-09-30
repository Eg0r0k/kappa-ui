<script setup lang="ts">
import { PinInput, PinInputGroup, PinInputSlot } from "@/ui/pin-input";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <div class="flex flex-col items-start gap-4">
    <div v-for="size in sizes" :key="size" class="flex items-center gap-4">
      <PinInput :size="size" :aria-label="`${size} code`">
        <PinInputGroup>
          <PinInputSlot v-for="index in [0, 1, 2, 3]" :key="index" :index="index" />
        </PinInputGroup>
      </PinInput>
      <span class="text-body-sm text-muted-foreground">{{ size }}</span>
    </div>
  </div>
</template>
