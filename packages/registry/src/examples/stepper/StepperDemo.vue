<script setup lang="ts">
import { BookUser, CreditCard, Truck } from "@lucide/vue";

import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/ui/stepper";

const steps = [
  { step: 1, title: "Address", description: "Add your address", icon: BookUser },
  { step: 2, title: "Shipping", description: "Set your preferred", icon: Truck },
  { step: 3, title: "Payment", description: "Add any payment", icon: CreditCard },
  { step: 4, title: "Checkout", description: "Confirm your order" },
];
</script>

<template>
  <Stepper class="w-full items-start">
    <StepperItem
      v-for="item in steps"
      :key="item.step"
      :step="item.step"
      class="relative flex w-full flex-col items-center justify-center"
    >
      <StepperTrigger>
        <StepperIndicator v-slot="{ step }" class="bg-muted">
          <component :is="item.icon" v-if="item.icon" />
          <template v-else>{{ step }}</template>
        </StepperIndicator>
      </StepperTrigger>
      <StepperSeparator
        v-if="item.step < steps.length"
        class="absolute top-[19px] right-[calc(-50%+10px)] left-[calc(50%+20px)] group-data-[state=completed]:bg-primary"
      />
      <div class="flex flex-col items-center">
        <StepperTitle>{{ item.title }}</StepperTitle>
        <StepperDescription>{{ item.description }}</StepperDescription>
      </div>
    </StepperItem>
  </Stepper>
</template>
