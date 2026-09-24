<script setup lang="ts">
import { Field, FieldLabel } from "@/ui/field";
import { Textarea } from "@/ui/textarea";
</script>

<template>
  <div class="grid w-full max-w-2xl gap-6 sm:grid-cols-3">
    <Field v-for="rows in [1, 3, 6]" :key="rows">
      <FieldLabel>{{ rows }} {{ rows === 1 ? "row" : "rows" }}</FieldLabel>
      <Textarea :rows="rows" placeholder="Notes" />
    </Field>
  </div>
</template>
