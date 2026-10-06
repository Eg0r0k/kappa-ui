<script setup lang="ts">
import { ref } from "vue";

import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { Rating, RatingItem } from "@/ui/rating";

const stars = ref(3);
</script>

<template>
  <Field class="w-fit">
    <FieldLabel>Rate your stay</FieldLabel>
    <div class="flex items-center gap-3">
      <Rating v-model="stars" v-slot="{ items }">
        <RatingItem v-for="item in items" :key="item" :item="item" />
      </Rating>
      <span class="text-body-md text-muted-foreground tabular-nums">{{ stars }} / 5</span>
    </div>
    <FieldDescription>Hosts see the stars, not your name.</FieldDescription>
  </Field>
</template>
