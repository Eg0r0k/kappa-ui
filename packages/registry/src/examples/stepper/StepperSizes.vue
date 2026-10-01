<script setup lang="ts">
import { Check, Settings, User } from "@lucide/vue";

import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/ui/stepper";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;

const steps = [
  { step: 1, title: "Account", description: "Create your account", icon: User },
  { step: 2, title: "Profile", description: "Set up your profile", icon: Settings },
  { step: 3, title: "Complete", description: "Finish setup", icon: Check },
];
</script>

<template>
  <div class="flex w-full flex-col gap-8">
    <Stepper v-for="size in sizes" :key="size" :size="size" :default-value="2" :linear="false">
      <StepperItem v-for="item in steps" :key="item.step" :step="item.step" class="flex-1">
        <StepperTrigger class="flex-row text-start">
          <StepperIndicator>
            <component :is="item.icon" />
          </StepperIndicator>
          <div class="flex flex-col">
            <StepperTitle>{{ item.title }}</StepperTitle>
            <StepperDescription>{{ item.description }}</StepperDescription>
          </div>
        </StepperTrigger>
        <StepperSeparator v-if="item.step < steps.length" />
      </StepperItem>
    </Stepper>
  </div>
</template>
