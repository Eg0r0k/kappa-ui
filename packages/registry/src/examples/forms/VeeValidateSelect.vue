<script setup lang="ts">
import { useForm } from "vee-validate";
import { ref, useTemplateRef } from "vue";
import * as z from "zod";

import { focusFirstInvalid } from "@/lib/field-context";
import { toTypedSchema } from "@/lib/standard-schema";
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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

const languages = [
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "fi", label: "Suomi" },
  { value: "uk", label: "Українська" },
];

const countries = ["Brazil", "Canada", "Finland", "Germany", "Japan", "Portugal", "Spain"];

const Settings = z.object({
  language: z.string("Choose a language.").min(1, "Choose a language."),
  country: z.string("Choose a country."),
});

const { defineField, errors, handleSubmit } = useForm({
  validationSchema: toTypedSchema(Settings),
  initialValues: { language: "" },
});

// Both validate when the value changes. Neither binds blur: Select has no
// element to blur, and the Combobox input blurs while its list takes focus.
const [language] = defineField("language");
const [country] = defineField("country");

const form = useTemplateRef("form");
const saved = ref("");

const submit = handleSubmit(
  (settings) => {
    saved.value = `Saved: ${settings.language}, ${settings.country}`;
  },
  () => focusFirstInvalid(form.value),
);
</script>

<template>
  <form ref="form" novalidate class="flex w-full max-w-xs flex-col items-start gap-4" @submit="submit">
    <FieldGroup>
      <Field :invalid="!!errors.language" required>
        <FieldLabel>Spoken language</FieldLabel>
        <Select v-model="language" name="language">
          <SelectTrigger>
            <SelectValue placeholder="Choose" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="item in languages" :key="item.value" :value="item.value">
              {{ item.label }}
            </SelectItem>
          </SelectContent>
        </Select>
        <FieldDescription>Used for emails and the interface.</FieldDescription>
        <FieldError :errors="errors.language" />
      </Field>
      <Field :invalid="!!errors.country" required>
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
        <FieldError :errors="errors.country" />
      </Field>
    </FieldGroup>
    <div class="flex items-center gap-3">
      <Button type="submit" size="sm">Save</Button>
      <p class="text-body-sm text-muted-foreground" aria-live="polite">{{ saved }}</p>
    </div>
  </form>
</template>
