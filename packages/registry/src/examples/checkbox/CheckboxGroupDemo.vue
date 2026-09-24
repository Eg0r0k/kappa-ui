<script setup lang="ts">
import { ref } from "vue";

import { Checkbox, CheckboxGroup } from "@/ui/checkbox";
import { Field, FieldLabel, FieldLegend, FieldSet } from "@/ui/field";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const selected = ref(["Monday", "Wednesday"]);
</script>

<template>
  <FieldSet class="w-56">
    <FieldLegend>Office days</FieldLegend>
    <CheckboxGroup v-model="selected" name="days">
      <Field v-for="day in days" :key="day" orientation="horizontal">
        <Checkbox :value="day" />
        <FieldLabel>{{ day }}</FieldLabel>
      </Field>
    </CheckboxGroup>
    <p class="text-body-sm text-muted-foreground">{{ selected.length }} of {{ days.length }} selected</p>
  </FieldSet>
</template>
