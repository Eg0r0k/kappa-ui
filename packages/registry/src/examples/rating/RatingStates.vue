<script setup lang="ts">
import { ref } from "vue";

import { Field, FieldError, FieldLabel } from "@/ui/field";
import { Rating } from "@/ui/rating";

const service = ref(0);
</script>

<template>
  <div class="flex flex-col gap-6">
    <Field disabled class="w-fit">
      <FieldLabel>Disabled</FieldLabel>
      <Rating :default-value="3" />
    </Field>
    <Field class="w-fit">
      <FieldLabel>Readonly</FieldLabel>
      <Rating readonly :model-value="3.6" />
    </Field>
    <Field required :invalid="!service" class="w-fit">
      <FieldLabel>Service</FieldLabel>
      <Rating v-model="service" />
      <FieldError v-if="!service" errors="Rate the service to continue." />
    </Field>
  </div>
</template>
