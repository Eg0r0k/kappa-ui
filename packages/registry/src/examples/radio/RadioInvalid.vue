<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/ui/field";
import { Radio, RadioGroup } from "@/ui/radio-group";

const size = ref<string>();
const submitted = ref(false);

const reset = () => {
  size.value = undefined;
  submitted.value = false;
};
</script>

<template>
  <form class="flex flex-col items-start gap-4" @submit.prevent="submitted = true" @reset.prevent="reset">
    <FieldSet :invalid="submitted && !size" required>
      <FieldLegend>T-shirt size</FieldLegend>
      <RadioGroup v-model="size" orientation="horizontal">
        <Field v-for="option in ['S', 'M', 'L']" :key="option" orientation="horizontal">
          <Radio :value="option" />
          <FieldLabel>{{ option }}</FieldLabel>
        </Field>
      </RadioGroup>
      <FieldError v-if="submitted && !size" errors="Choose a size to continue." />
    </FieldSet>
    <div class="flex gap-2">
      <Button type="submit" size="sm">Continue</Button>
      <Button type="reset" size="sm" variant="ghost" color="neutral">Reset</Button>
    </div>
  </form>
</template>
