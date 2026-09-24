<script setup lang="ts">
import { Field, FieldLabel } from "@/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

const variants = ["outline", "soft", "filled", "ghost", "subtle"] as const;
</script>

<template>
  <div class="grid w-full max-w-2xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <Field v-for="variant in variants" :key="variant">
      <FieldLabel class="capitalize">{{ variant }}</FieldLabel>
      <Select default-value="week">
        <SelectTrigger :variant="variant">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="day">Today</SelectItem>
          <SelectItem value="week">This week</SelectItem>
          <SelectItem value="month">This month</SelectItem>
        </SelectContent>
      </Select>
    </Field>
  </div>
</template>
