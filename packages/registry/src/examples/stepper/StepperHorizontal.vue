<script setup lang="ts">
import { Check, Circle, Dot } from "@lucide/vue";

import { Button } from "@/ui/button";
import { Stepper, StepperDescription, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from "@/ui/stepper";

const steps = [
  { step: 1, title: "Your details", description: "Provide your name and email" },
  { step: 2, title: "Company details", description: "A few details about your company" },
  { step: 3, title: "Invite your team", description: "Start collaborating with your team" },
];
</script>

<template>
  <Stepper class="w-full items-start">
    <StepperItem
      v-for="item in steps"
      :key="item.step"
      v-slot="{ state }"
      :step="item.step"
      class="relative flex w-full flex-col items-center justify-center"
    >
      <StepperSeparator
        v-if="item.step < steps.length"
        class="absolute top-[17px] right-[calc(-50%+10px)] left-[calc(50%+20px)] group-data-[state=completed]:bg-primary"
      />
      <StepperTrigger as-child>
        <Button
          :variant="state === 'inactive' ? 'outline' : 'solid'"
          size="icon-md"
          class="z-10 rounded-full"
          :class="state === 'active' && 'ring-2 ring-ring ring-offset-2 ring-offset-background'"
        >
          <Check v-if="state === 'completed'" class="size-5" />
          <Circle v-else-if="state === 'active'" />
          <Dot v-else />
        </Button>
      </StepperTrigger>
      <div class="mt-5 flex flex-col items-center text-center">
        <StepperTitle
          :class="state === 'active' && 'text-primary'"
          class="transition-colors duration-short-3 ease-standard lg:text-title-md"
        >
          {{ item.title }}
        </StepperTitle>
        <StepperDescription
          :class="state === 'active' && 'text-primary'"
          class="sr-only transition-colors duration-short-3 ease-standard md:not-sr-only lg:text-body-md"
        >
          {{ item.description }}
        </StepperDescription>
      </div>
    </StepperItem>
  </Stepper>
</template>
