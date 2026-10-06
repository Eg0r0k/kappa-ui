<script setup lang="ts">
import { Flame, Heart } from "@lucide/vue";

import { Field, FieldLabel } from "@/ui/field";
import { Rating, RatingItem } from "@/ui/rating";
</script>

<template>
  <div class="flex flex-col gap-6">
    <Field class="w-fit">
      <FieldLabel>How much did you like it?</FieldLabel>
      <Rating v-slot="{ items }" color="destructive" :default-value="4">
        <RatingItem v-for="item in items" :key="item" :item="item"><Heart /></RatingItem>
      </Rating>
    </Field>
    <Field class="w-fit">
      <FieldLabel>Spice level</FieldLabel>
      <Rating
        v-slot="{ items }"
        color="warning"
        :length="3"
        :default-value="2"
        :labels="{ item: (value) => `${value} of 3 chillies` }"
      >
        <RatingItem v-for="item in items" :key="item" :item="item"><Flame /></RatingItem>
      </Rating>
    </Field>
  </div>
</template>
