<script setup lang="ts">
import { ref } from "vue";

import { Field, FieldError, FieldLabel } from "@/ui/field";
import { Rating, RatingDisplay, RatingDisplayItem, RatingItem } from "@/ui/rating";

const service = ref(0);
</script>

<template>
  <div class="flex flex-col gap-6">
    <Field disabled class="w-fit">
      <FieldLabel>Disabled</FieldLabel>
      <Rating :default-value="3" v-slot="{ items }">
        <RatingItem v-for="item in items" :key="item" :item="item" />
      </Rating>
    </Field>
    <Field class="w-fit">
      <FieldLabel>Readonly</FieldLabel>
      <RatingDisplay :value="3.6" v-slot="{ items }">
        <RatingDisplayItem v-for="item in items" :key="item" :item="item" />
      </RatingDisplay>
    </Field>
    <Field required :invalid="!service" class="w-fit">
      <FieldLabel>Service</FieldLabel>
      <Rating v-model="service" v-slot="{ items }">
        <RatingItem v-for="item in items" :key="item" :item="item" />
      </Rating>
      <FieldError v-if="!service" errors="Rate the service to continue." />
    </Field>
  </div>
</template>
