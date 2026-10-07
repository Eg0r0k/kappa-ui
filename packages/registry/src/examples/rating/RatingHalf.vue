<script setup lang="ts">
import { ref } from "vue";

import { Field, FieldLabel } from "@/ui/field";
import { Rating, RatingItem } from "@/ui/rating";

const halves = ref(3.5);
const quarters = ref(2.75);
</script>

<template>
  <div class="flex flex-col gap-6">
    <Field class="w-fit">
      <FieldLabel>Half steps</FieldLabel>
      <div class="flex items-center gap-3">
        <Rating v-model="halves" :step="0.5" hoverable v-slot="{ items }">
          <RatingItem v-for="item in items" :key="item" :item="item" />
        </Rating>
        <span class="text-body-md text-muted-foreground tabular-nums">{{ halves }}</span>
      </div>
    </Field>
    <Field class="w-fit">
      <FieldLabel>Quarter steps</FieldLabel>
      <div class="flex items-center gap-3">
        <Rating v-model="quarters" :step="0.25" hoverable v-slot="{ items }">
          <RatingItem v-for="item in items" :key="item" :item="item" />
        </Rating>
        <span class="text-body-md text-muted-foreground tabular-nums">{{ quarters }}</span>
      </div>
    </Field>
  </div>
</template>
