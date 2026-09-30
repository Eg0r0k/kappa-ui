<script setup lang="ts">
import { PinInput, PinInputGroup, PinInputSlot } from "@/ui/pin-input";

const variants = ["outline", "soft", "filled", "ghost", "subtle"] as const;
</script>

<template>
  <div class="flex flex-col items-start gap-4">
    <div v-for="variant in variants" :key="variant" class="flex items-center gap-4">
      <PinInput :variant="variant" :aria-label="`${variant} code`">
        <PinInputGroup>
          <PinInputSlot v-for="index in [0, 1, 2, 3]" :key="index" :index="index" />
        </PinInputGroup>
      </PinInput>
      <span class="text-body-sm text-muted-foreground">{{ variant }}</span>
    </div>
  </div>
</template>
