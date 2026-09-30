<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { Checkbox, CheckboxGroup } from "@/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/ui/field";

const variants = ["default", "card", "list", "table"] as const;
const orientations = ["vertical", "horizontal"] as const;

const variant = ref<(typeof variants)[number]>("card");
const orientation = ref<(typeof orientations)[number]>("vertical");
const selected = ref(["email"]);

const channels = [
  { value: "email", label: "Email", description: "A daily summary to your inbox." },
  { value: "push", label: "Push", description: "Right away, on this device." },
  { value: "sms", label: "SMS", description: "Only for security alerts." },
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
    <CheckboxGroup v-model="selected" :variant="variant" :orientation="orientation" aria-label="Notification channels">
      <Field v-for="channel in channels" :key="channel.value" orientation="horizontal">
        <Checkbox :value="channel.value" />
        <FieldContent>
          <FieldLabel>{{ channel.label }}</FieldLabel>
          <FieldDescription>{{ channel.description }}</FieldDescription>
        </FieldContent>
      </Field>
    </CheckboxGroup>
  </div>
</template>
