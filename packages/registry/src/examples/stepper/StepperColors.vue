<script setup lang="ts">
import { Stepper, StepperIndicator, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from "@/ui/stepper";

const colors = ["primary", "neutral", "success", "warning", "destructive", "info"] as const;

const steps = [
  { step: 1, title: "Cart" },
  { step: 2, title: "Shipping" },
  { step: 3, title: "Payment" },
];
</script>

<template>
  <div class="flex w-full max-w-md flex-col gap-6">
    <Stepper v-for="color in colors" :key="color" :color="color" size="sm" :default-value="2" :aria-label="color">
      <StepperItem v-for="item in steps" :key="item.step" :step="item.step" class="flex-1">
        <StepperTrigger class="flex-row">
          <StepperIndicator>{{ item.step }}</StepperIndicator>
          <StepperTitle>{{ item.title }}</StepperTitle>
        </StepperTrigger>
        <StepperSeparator v-if="item.step < steps.length" />
      </StepperItem>
    </Stepper>
  </div>
</template>
