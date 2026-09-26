<script setup lang="ts">
import { computed, ref } from "vue";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";

const email = ref("");
const touched = ref(false);

const error = computed(() => {
  if (!touched.value) return null;
  if (!email.value) return "Enter your email address.";
  if (!/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(email.value))
    return "Enter a complete email address, like ada@example.com.";
  return null;
});
</script>

<template>
  <Field :invalid="!!error" required class="max-w-xs">
    <FieldLabel>Email</FieldLabel>
    <Input v-model="email" type="email" autocomplete="email" @blur="touched = true" />
    <FieldDescription>Receipts go here.</FieldDescription>
    <FieldError :errors="error" />
  </Field>
</template>
