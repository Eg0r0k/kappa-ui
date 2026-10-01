<script setup lang="ts">
import { Check, Circle, Dot } from "@lucide/vue";

import { Button } from "@/ui/button";
import { Stepper, StepperDescription, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from "@/ui/stepper";

const steps = [
  {
    step: 1,
    title: "Your details",
    description: "Provide your name and email address. We will use this information to create your account.",
  },
  {
    step: 2,
    title: "Company details",
    description: "A few details about your company will help us personalise your experience.",
  },
  {
    step: 3,
    title: "Invite your team",
    description:
      "Start collaborating with your team by inviting them to join your account. You can skip this step and invite them later.",
  },
];
</script>

<template>
  <Stepper orientation="vertical" class="mx-auto w-full max-w-md gap-10">
    <StepperItem
      v-for="item in steps"
      :key="item.step"
      v-slot="{ state }"
      :step="item.step"
      class="relative flex w-full items-start gap-6"
    >
      <StepperSeparator
        v-if="item.step < steps.length"
        class="absolute top-[38px] -bottom-10 left-[17px] group-data-[state=completed]:bg-primary"
      />
      <StepperTrigger as-child>
        <Button
          :variant="state === 'inactive' ? 'outline' : 'solid'"
          size="icon"
          class="z-10 rounded-full"
          :class="state === 'active' && 'ring-2 ring-ring ring-offset-2 ring-offset-background'"
        >
          <Check v-if="state === 'completed'" class="size-5" />
          <Circle v-else-if="state === 'active'" />
          <Dot v-else />
        </Button>
      </StepperTrigger>
      <div class="flex flex-col gap-1">
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
