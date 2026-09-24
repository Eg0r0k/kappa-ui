<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import { Listbox, ListboxItem } from "@/ui/listbox";

const regions = ["Frankfurt", "Helsinki", "Virginia", "Oregon", "Singapore"];
const region = ref<string>();
const submitted = ref(false);
</script>

<template>
  <form class="flex w-64 flex-col items-start gap-4" @submit.prevent="submitted = true">
    <Field :invalid="submitted && !region" required class="w-full">
      <FieldLabel>Region</FieldLabel>
      <Listbox v-model="region">
        <ListboxItem v-for="item in regions" :key="item" :value="item">{{ item }}</ListboxItem>
      </Listbox>
      <FieldDescription>Where your data is stored. Click the chosen region again to clear it.</FieldDescription>
      <FieldError v-if="submitted && !region" errors="Choose a region to continue." />
    </Field>
    <Button type="submit" size="sm">Continue</Button>
  </form>
</template>
