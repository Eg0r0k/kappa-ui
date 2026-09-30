<script setup lang="ts">
import { PinInput, PinInputGroup, PinInputSlot } from "@/ui/pin-input";
</script>

<template>
  <PinInput mask placeholder="○" type="number" aria-label="PIN">
    <PinInputGroup>
      <PinInputSlot v-for="index in [0, 1, 2, 3]" :key="index" :index="index" />
    </PinInputGroup>
  </PinInput>
</template>
