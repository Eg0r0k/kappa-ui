<script setup lang="ts">
import { FieldArray, Form, Field as FormischField, insert, remove, useForm } from "@formisch/vue";
import { Plus, X } from "@lucide/vue";
import * as v from "valibot";
import type { ComponentPublicInstance } from "vue";

import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLegend, FieldSet } from "@/ui/field";
import { Input } from "@/ui/input";

const Contacts = v.object({
  emails: v.pipe(
    v.array(
      v.object({
        address: v.pipe(v.string(), v.email("Enter a valid email address.")),
      }),
    ),
    v.minLength(1, "Add at least one email address."),
    v.maxLength(5, "You can add up to 5 email addresses."),
  ),
});

const element = (control: Element | ComponentPublicInstance | null) =>
  control && "$el" in control ? control.$el : control;

const form = useForm({ schema: Contacts, initialInput: { emails: [{ address: "" }] } });
</script>

<template>
  <Form :of="form" class="flex w-full max-w-sm flex-col items-start gap-4" @submit="() => {}">
    <FieldArray v-slot="array" :of="form" :path="['emails']">
      <FieldSet class="w-full">
        <FieldLegend>Email addresses</FieldLegend>
        <FieldDescription>Add up to 5 addresses where we can reach you.</FieldDescription>
        <FieldGroup class="gap-3">
          <FormischField
            v-for="(item, index) in array.items"
            :key="item"
            v-slot="field"
            :of="form"
            :path="['emails', index, 'address']"
          >
            <Field :invalid="field.errors !== null">
              <div class="flex gap-2">
                <Input
                  v-model="field.input"
                  v-bind="field.props"
                  :ref="(control) => field.props.ref(element(control))"
                  type="email"
                  :aria-label="`Email ${index + 1}`"
                  placeholder="name@example.com"
                />
                <Button
                  v-if="array.items.length > 1"
                  type="button"
                  variant="ghost"
                  color="neutral"
                  size="icon"
                  :aria-label="`Remove email ${index + 1}`"
                  @click="remove(form, { path: ['emails'], at: index })"
                >
                  <X />
                </Button>
              </div>
              <FieldError :errors="field.errors" />
            </Field>
          </FormischField>
        </FieldGroup>
        <FieldError :errors="array.errors" />
      </FieldSet>
      <div class="flex gap-2">
        <Button
          type="button"
          variant="outline"
          color="neutral"
          size="sm"
          :disabled="array.items.length >= 5"
          @click="insert(form, { path: ['emails'], initialInput: { address: '' } })"
        >
          <Plus data-icon="inline-start" />
          Add address
        </Button>
        <Button type="submit" size="sm">Save</Button>
      </div>
    </FieldArray>
  </Form>
</template>
