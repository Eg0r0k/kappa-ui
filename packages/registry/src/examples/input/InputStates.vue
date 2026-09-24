<script setup lang="ts">
import { Field, FieldError, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";

const variants = [
  { value: "outline", name: "Outline" },
  { value: "soft", name: "Soft" },
  { value: "filled", name: "Filled" },
  { value: "ghost", name: "Ghost" },
  { value: "subtle", name: "Subtle" },
] as const;
</script>

<template>
  <div class="grid w-full max-w-md gap-6 sm:grid-cols-2">
    <template v-for="variant in variants" :key="variant.value">
      <Field disabled>
        <FieldLabel>{{ variant.name }}, disabled</FieldLabel>
        <Input :variant="variant.value" default-value="Read only for now" />
      </Field>
      <Field invalid>
        <FieldLabel>{{ variant.name }}, invalid</FieldLabel>
        <Input :variant="variant.value" default-value="ada@" />
        <FieldError errors="Enter a complete email address." />
      </Field>
    </template>
  </div>
</template>
