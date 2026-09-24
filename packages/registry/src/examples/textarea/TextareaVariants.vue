<script setup lang="ts">
import { Field, FieldLabel } from "@/ui/field";
import { Textarea } from "@/ui/textarea";

const variants = ["outline", "soft", "filled", "ghost", "subtle"] as const;
</script>

<template>
  <div class="grid w-full max-w-2xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <Field v-for="variant in variants" :key="variant">
      <FieldLabel class="capitalize">{{ variant }}</FieldLabel>
      <Textarea :variant="variant" placeholder="What changed?" />
    </Field>
  </div>
</template>
