<script setup lang="ts">
import { Form, Field as FormischField, useForm } from "@formisch/vue";
import * as v from "valibot";

import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

const languages = [
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "fi", label: "Suomi" },
  { value: "uk", label: "Українська" },
];

const Settings = v.object({
  language: v.pipe(v.string("Choose a language."), v.nonEmpty("Choose a language.")),
});

const form = useForm({ schema: Settings, initialInput: { language: "" } });
</script>

<template>
  <Form :of="form" class="flex w-full max-w-xs flex-col items-start gap-4" @submit="() => {}">
    <FormischField v-slot="field" :of="form" :path="['language']">
      <Field :invalid="field.errors !== null" class="w-full">
        <FieldLabel>Spoken language</FieldLabel>
        <Select v-model="field.input" :name="field.props.name">
          <SelectTrigger>
            <SelectValue placeholder="Choose" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="language in languages" :key="language.value" :value="language.value">
              {{ language.label }}
            </SelectItem>
          </SelectContent>
        </Select>
        <FieldDescription>Used for emails and the interface.</FieldDescription>
        <FieldError :errors="field.errors" />
      </Field>
    </FormischField>
    <Button type="submit" size="sm">Save</Button>
  </Form>
</template>
