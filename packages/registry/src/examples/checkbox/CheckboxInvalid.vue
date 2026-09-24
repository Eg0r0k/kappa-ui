<script setup lang="ts">
import { ref } from "vue";

import { Checkbox } from "@/ui/checkbox";
import { Field, FieldContent, FieldError, FieldLabel } from "@/ui/field";

const accepted = ref(false);
</script>

<template>
  <Field orientation="horizontal" :invalid="!accepted" required class="max-w-sm">
    <Checkbox v-model="accepted" />
    <FieldContent>
      <FieldLabel>Accept terms and conditions</FieldLabel>
      <FieldError v-if="!accepted" errors="Accept the terms to create an account." />
    </FieldContent>
  </Field>
</template>
