<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/ui/field";
import { Radio, RadioGroup } from "@/ui/radio-group";

const variants = ["default", "card", "list", "table"] as const;
const orientations = ["vertical", "horizontal"] as const;

const variant = ref<(typeof variants)[number]>("card");
const orientation = ref<(typeof orientations)[number]>("vertical");
const plan = ref("pro");

const plans = [
  { value: "free", label: "Free", description: "One project, community support." },
  { value: "pro", label: "Pro", description: "Unlimited projects, email support." },
  { value: "team", label: "Team", description: "Shared workspaces, priority support." },
];
</script>

<template>
  <div class="flex w-full max-w-2xl flex-col gap-6">
    <div class="flex flex-wrap gap-x-6 gap-y-2">
      <div class="flex gap-1" role="group" aria-label="Variant">
        <Button
          v-for="option in variants"
          :key="option"
          size="sm"
          color="neutral"
          :variant="variant === option ? 'soft' : 'ghost'"
          :aria-pressed="variant === option"
          @click="variant = option"
        >
          {{ option }}
        </Button>
      </div>
      <div class="flex gap-1" role="group" aria-label="Orientation">
        <Button
          v-for="option in orientations"
          :key="option"
          size="sm"
          color="neutral"
          :variant="orientation === option ? 'soft' : 'ghost'"
          :aria-pressed="orientation === option"
          @click="orientation = option"
        >
          {{ option }}
        </Button>
      </div>
    </div>
    <RadioGroup v-model="plan" :variant="variant" :orientation="orientation" aria-label="Plan">
      <Field v-for="option in plans" :key="option.value" orientation="horizontal">
        <Radio :value="option.value" />
        <FieldContent>
          <FieldLabel>{{ option.label }}</FieldLabel>
          <FieldDescription>{{ option.description }}</FieldDescription>
        </FieldContent>
      </Field>
    </RadioGroup>
  </div>
</template>
