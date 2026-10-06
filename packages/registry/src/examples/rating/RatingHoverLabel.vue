<script setup lang="ts">
import { computed, ref } from "vue";

import { Field, FieldLabel } from "@/ui/field";
import { Rating } from "@/ui/rating";

const words = ["Terrible", "Poor", "Okay", "Good", "Excellent"];

const stars = ref(0);
const hovered = ref(0);
const word = computed(() => words[(hovered.value || stars.value) - 1] ?? "Pick a rating");
</script>

<template>
  <Field class="w-fit">
    <FieldLabel>How was the delivery?</FieldLabel>
    <div class="flex items-center gap-3">
      <Rating
        v-model="stars"
        hoverable
        color="warning"
        :labels="{ item: (value) => words[value - 1] ?? `${value}` }"
        @hover="hovered = $event"
      />
      <span class="w-24 text-body-md text-muted-foreground">{{ word }}</span>
    </div>
  </Field>
</template>
