<script setup lang="ts">
import { Form, Field as FormischField, type SubmitHandler, reset, useForm } from "@formisch/vue";
import * as v from "valibot";
import { type ComponentPublicInstance, ref } from "vue";

import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";

const BugReport = v.object({
  title: v.pipe(
    v.string(),
    v.minLength(5, "Bug title must be at least 5 characters."),
    v.maxLength(32, "Bug title must be at most 32 characters."),
  ),
  description: v.pipe(
    v.string(),
    v.minLength(20, "Description must be at least 20 characters."),
    v.maxLength(100, "Description must be at most 100 characters."),
  ),
});

const element = (control: Element | ComponentPublicInstance | null) =>
  control && "$el" in control ? control.$el : control;

const form = useForm({ schema: BugReport, initialInput: { title: "", description: "" } });
const sent = ref<v.InferOutput<typeof BugReport>>();

const submit: SubmitHandler<typeof BugReport> = (output) => {
  sent.value = output;
};
</script>

<template>
  <Card class="w-full max-w-md">
    <CardHeader>
      <CardTitle>Bug report</CardTitle>
      <CardDescription>Help us improve by reporting what went wrong.</CardDescription>
    </CardHeader>
    <CardContent>
      <Form id="bug-report" :of="form" @submit="submit">
        <FieldGroup>
          <FormischField v-slot="field" :of="form" :path="['title']">
            <Field :invalid="field.errors !== null">
              <FieldLabel>Bug title</FieldLabel>
              <Input
                v-model="field.input"
                v-bind="field.props"
                :ref="(control) => field.props.ref(element(control))"
                placeholder="Login button not working on mobile"
                autocomplete="off"
              />
              <FieldError :errors="field.errors" />
            </Field>
          </FormischField>
          <FormischField v-slot="field" :of="form" :path="['description']">
            <Field :invalid="field.errors !== null">
              <FieldLabel>Description</FieldLabel>
              <Textarea
                v-model="field.input"
                v-bind="field.props"
                :ref="(control) => field.props.ref(element(control))"
                autoresize
                :rows="3"
                placeholder="What happened, and on which device?"
              />
              <FieldDescription>Include the steps that lead to the bug.</FieldDescription>
              <FieldError :errors="field.errors" />
            </Field>
          </FormischField>
        </FieldGroup>
      </Form>
    </CardContent>
    <CardFooter class="justify-between gap-2">
      <p class="text-body-sm text-muted-foreground" aria-live="polite">{{ sent ? `Sent: ${sent.title}` : "" }}</p>
      <div class="flex gap-2">
        <Button type="button" variant="outline" color="neutral" @click="reset(form)">Reset</Button>
        <Button type="submit" form="bug-report">Submit</Button>
      </div>
    </CardFooter>
  </Card>
</template>
