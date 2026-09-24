<script setup lang="ts">
import { Field, FieldLabel, FieldLegend, FieldSet } from "@/ui/field";
import { Radio, RadioGroup } from "@/ui/radio-group";
</script>

<template>
  <div class="grid gap-8 sm:grid-cols-2">
    <FieldSet>
      <FieldLegend>One option</FieldLegend>
      <RadioGroup default-value="monthly">
        <Field orientation="horizontal">
          <Radio value="monthly" />
          <FieldLabel>Monthly</FieldLabel>
        </Field>
        <Field orientation="horizontal" disabled>
          <Radio value="yearly" />
          <FieldLabel>Yearly, not available</FieldLabel>
        </Field>
      </RadioGroup>
    </FieldSet>
    <FieldSet disabled>
      <FieldLegend>Whole group</FieldLegend>
      <RadioGroup default-value="monthly">
        <Field orientation="horizontal">
          <Radio value="monthly" />
          <FieldLabel>Monthly</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Radio value="yearly" />
          <FieldLabel>Yearly</FieldLabel>
        </Field>
      </RadioGroup>
    </FieldSet>
  </div>
</template>
