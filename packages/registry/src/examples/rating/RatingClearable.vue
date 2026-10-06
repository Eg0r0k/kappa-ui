<script setup lang="ts">
import { ref } from "vue";

import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { Rating, RatingItem } from "@/ui/rating";

const stars = ref(4);
</script>

<template>
  <Field class="w-fit">
    <FieldLabel>Recommend this course?</FieldLabel>
    <div class="flex items-center gap-3">
      <Rating v-model="stars" clearable v-slot="{ items }">
        <RatingItem v-for="item in items" :key="item" :item="item" />
      </Rating>
      <span class="text-body-md text-muted-foreground tabular-nums">{{ stars ? `${stars} / 5` : "Not rated" }}</span>
    </div>
    <FieldDescription>Click the current star, or press Space on it, to clear.</FieldDescription>
  </Field>
</template>
