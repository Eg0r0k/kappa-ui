<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxViewport,
} from "@/ui/combobox";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";

const countries = ["Brazil", "Canada", "Finland", "Germany", "Japan", "Portugal", "Spain"];
const country = ref<string>();
const submitted = ref(false);
</script>

<template>
  <form class="flex w-64 flex-col items-start gap-4" @submit.prevent="submitted = true">
    <Field :invalid="submitted && !country" required class="w-full">
      <FieldLabel>Country</FieldLabel>
      <Combobox v-model="country" name="country">
        <ComboboxAnchor>
          <ComboboxInput placeholder="Start typing" />
          <ComboboxTrigger />
        </ComboboxAnchor>
        <ComboboxList>
          <ComboboxViewport>
            <ComboboxEmpty>No country found.</ComboboxEmpty>
            <ComboboxItem v-for="item in countries" :key="item" :value="item">{{ item }}</ComboboxItem>
          </ComboboxViewport>
        </ComboboxList>
      </Combobox>
      <FieldDescription>Where the invoice is sent.</FieldDescription>
      <FieldError v-if="submitted && !country" errors="Choose a country to continue." />
    </Field>
    <Button type="submit" size="sm">Continue</Button>
  </form>
</template>
