<script setup lang="ts">
import { useForm } from "vee-validate";
import { ref, useTemplateRef } from "vue";
import * as z from "zod";

import { focusFirstInvalid } from "@/lib/field-context";
import { toTypedSchema } from "@/lib/standard-schema";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";

const BugReport = z.object({
  title: z
    .string()
    .min(5, "Bug title must be at least 5 characters.")
    .max(32, "Bug title must be at most 32 characters."),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters.")
    .max(100, "Description must be at most 100 characters."),
});

const { defineField, errors, handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(BugReport),
  initialValues: { title: "", description: "" },
});

// Check on blur first, then on every keystroke once the field is wrong.
const lazy = (state: { errors: string[] }) => ({ validateOnModelUpdate: state.errors.length > 0 });
const [title, titleAttrs] = defineField("title", lazy);
const [description, descriptionAttrs] = defineField("description", lazy);

const form = useTemplateRef("form");
const sent = ref<z.output<typeof BugReport>>();

const submit = handleSubmit(
  (report) => {
    sent.value = report;
  },
  () => focusFirstInvalid(form.value),
);
</script>

<template>
  <Card class="w-full max-w-md">
    <CardHeader>
      <CardTitle>Bug report</CardTitle>
      <CardDescription>Help us improve by reporting what went wrong.</CardDescription>
    </CardHeader>
    <CardContent>
      <form id="vee-bug-report" ref="form" novalidate @submit="submit">
        <FieldGroup>
          <Field :invalid="!!errors.title" required>
            <FieldLabel>Bug title</FieldLabel>
            <Input
              v-model="title"
              v-bind="titleAttrs"
              placeholder="Login button not working on mobile"
              autocomplete="off"
            />
            <FieldError :errors="errors.title" />
          </Field>
          <Field :invalid="!!errors.description" required>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              v-model="description"
              v-bind="descriptionAttrs"
              autoresize
              :rows="3"
              placeholder="What happened, and on which device?"
            />
            <FieldDescription>{{ description.length }}/100 characters. Include the steps.</FieldDescription>
            <FieldError :errors="errors.description" />
          </Field>
        </FieldGroup>
      </form>
    </CardContent>
    <CardFooter class="justify-between gap-2">
      <p class="text-body-sm text-muted-foreground" aria-live="polite">{{ sent ? `Sent: ${sent.title}` : "" }}</p>
      <div class="flex gap-2">
        <Button type="button" variant="outline" color="neutral" @click="resetForm()">Reset</Button>
        <Button type="submit" form="vee-bug-report">Submit</Button>
      </div>
    </CardFooter>
  </Card>
</template>
