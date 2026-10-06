<script setup lang="ts">
import { Flame, Heart } from "@lucide/vue";

import { Field, FieldLabel } from "@/ui/field";
import { Rating } from "@/ui/rating";
</script>

<template>
  <div class="flex flex-col gap-6">
    <Field class="w-fit">
      <FieldLabel>How much did you like it?</FieldLabel>
      <Rating color="destructive" :default-value="4">
        <template #icon><Heart /></template>
      </Rating>
    </Field>
    <Field class="w-fit">
      <FieldLabel>Spice level</FieldLabel>
      <Rating color="warning" :length="3" :default-value="2" :labels="{ item: (value) => `${value} of 3 chillies` }">
        <template #icon><Flame /></template>
      </Rating>
    </Field>
  </div>
</template>
