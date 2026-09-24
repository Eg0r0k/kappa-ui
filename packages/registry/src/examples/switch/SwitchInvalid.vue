<script setup lang="ts">
import { ref } from "vue";

import { Field, FieldContent, FieldError, FieldLabel } from "@/ui/field";
import { Switch } from "@/ui/switch";

const agreed = ref(false);
</script>

<template>
  <Field orientation="horizontal" :invalid="!agreed" required class="max-w-sm">
    <Switch v-model="agreed" />
    <FieldContent>
      <FieldLabel>Share my location</FieldLabel>
      <FieldError v-if="!agreed" errors="Delivery needs your location." />
    </FieldContent>
  </Field>
</template>
