<script setup lang="ts">
import { Plus, X } from "@lucide/vue";
import { useFieldArray, useForm, Field as VeeField } from "vee-validate";
import { useTemplateRef } from "vue";
import * as z from "zod";

import { focusFirstInvalid } from "@/lib/field-context";
import { toTypedSchema } from "@/lib/standard-schema";
import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLegend, FieldSet } from "@/ui/field";
import { Input } from "@/ui/input";

const Contacts = z.object({
  emails: z
    .array(z.object({ address: z.email("Enter a valid email address.") }))
    .min(1, "Add at least one email address.")
    .max(5, "You can add up to 5 email addresses."),
});

const { errors, handleSubmit } = useForm({
  validationSchema: toTypedSchema(Contacts),
  initialValues: { emails: [{ address: "" }] },
});

const { fields, push, remove } = useFieldArray<{ address: string }>("emails");

const form = useTemplateRef("form");

const submit = handleSubmit(
  () => {},
  () => focusFirstInvalid(form.value),
);
</script>

<template>
  <form ref="form" novalidate class="flex w-full max-w-sm flex-col items-start gap-4" @submit="submit">
    <FieldSet :invalid="!!errors.emails" class="w-full">
      <FieldLegend>Email addresses</FieldLegend>
      <FieldDescription>Add up to 5 addresses where we can reach you.</FieldDescription>
      <FieldGroup class="gap-3">
        <VeeField
          v-for="(entry, index) in fields"
          :key="entry.key"
          v-slot="{ value, errorMessage, handleChange, handleBlur }"
          :name="`emails[${index}].address`"
        >
          <Field :invalid="!!errorMessage">
            <div class="flex gap-2">
              <Input
                :model-value="value"
                type="email"
                :aria-label="`Email ${index + 1}`"
                placeholder="name@example.com"
                @update:model-value="(text) => handleChange(text, !!errorMessage)"
                @blur="handleBlur"
              />
              <Button
                v-if="fields.length > 1"
                type="button"
                variant="ghost"
                color="neutral"
                size="icon-md"
                :aria-label="`Remove email ${index + 1}`"
                @click="remove(index)"
              >
                <X />
              </Button>
            </div>
            <FieldError :errors="errorMessage" />
          </Field>
        </VeeField>
      </FieldGroup>
      <FieldError :errors="errors.emails" />
    </FieldSet>
    <div class="flex gap-2">
      <Button
        type="button"
        variant="outline"
        color="neutral"
        size="sm"
        :disabled="fields.length >= 5"
        @click="push({ address: '' })"
      >
        <Plus data-icon="inline-start" />
        Add address
      </Button>
      <Button type="submit" size="sm">Save</Button>
    </div>
  </form>
</template>
