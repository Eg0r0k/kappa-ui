<script setup lang="ts">
import {
  Combobox,
  ComboboxAnchor,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxViewport,
} from "@/ui/combobox";
import { Field, FieldLabel } from "@/ui/field";

const variants = ["outline", "soft", "filled", "ghost", "subtle"] as const;
const cities = ["Berlin", "Lisbon", "Tokyo"];
</script>

<template>
  <div class="grid w-full max-w-2xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <Field v-for="variant in variants" :key="variant">
      <FieldLabel class="capitalize">{{ variant }}</FieldLabel>
      <Combobox default-value="Lisbon">
        <ComboboxAnchor :variant="variant">
          <ComboboxInput />
          <ComboboxTrigger />
        </ComboboxAnchor>
        <ComboboxList>
          <ComboboxViewport>
            <ComboboxItem v-for="city in cities" :key="city" :value="city">{{ city }}</ComboboxItem>
          </ComboboxViewport>
        </ComboboxList>
      </Combobox>
    </Field>
  </div>
</template>
