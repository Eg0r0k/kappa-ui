<script setup lang="ts">
import { Form, Field as FormischField, getErrors, useForm } from "@formisch/vue";
import * as v from "valibot";
import { type ComponentPublicInstance, ref } from "vue";

import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/ui/field";
import { FileUpload, formatFileSize } from "@/ui/file-upload";

const Listing = v.object({
  cover: v.pipe(
    v.file("Choose a cover photo."),
    v.mimeType(["image/jpeg", "image/png", "image/webp"], "Use a JPG, PNG or WebP image."),
    v.maxSize(2 * 1024 * 1024, "Keep the cover under 2 MB."),
  ),
  floorPlans: v.pipe(
    v.array(
      v.pipe(
        v.file(),
        v.mimeType(["application/pdf"], "Floor plans must be PDFs."),
        v.maxSize(5 * 1024 * 1024, "Keep each plan under 5 MB."),
      ),
    ),
    v.minLength(1, "Add at least one floor plan."),
    v.maxLength(3, "Three floor plans at most."),
  ),
});

const form = useForm({ schema: Listing, initialInput: { floorPlans: [] } });
const published = ref("");

// Formisch focuses the first invalid field on submit, so hand it the trigger, the element that takes focus
const trigger = (control: Element | ComponentPublicInstance | null) =>
  control && "triggerEl" in control ? (control.triggerEl as HTMLElement | null) : null;

const publish = (output: v.InferOutput<typeof Listing>) => {
  published.value = `Published with ${output.cover.name} and ${output.floorPlans.length} floor plan(s).`;
};
</script>

<template>
  <Form :of="form" class="flex w-full max-w-md flex-col items-start gap-4" @submit="publish">
    <FieldGroup class="w-full">
      <FormischField v-slot="field" :of="form" :path="['cover']">
        <Field :invalid="field.errors !== null">
          <FieldLabel>Cover photo</FieldLabel>
          <FileUpload
            v-model="field.input"
            :ref="(control) => field.props.ref(trigger(control))"
            :name="field.props.name"
            accept="image/*"
            label="Drop the cover photo here"
            description="JPG, PNG or WebP, up to 2 MB"
          />
          <FieldError :errors="field.errors" />
        </Field>
      </FormischField>
      <FormischField v-slot="field" :of="form" :path="['floorPlans']">
        <Field :invalid="field.errors !== null">
          <FieldLabel>Floor plans</FieldLabel>
          <FileUpload
            v-model="field.input"
            :ref="(control) => field.props.ref(trigger(control))"
            :name="field.props.name"
            multiple
            mode="button"
            size="sm"
            label="Add floor plans"
          >
            <template #file-size="{ file, index }">
              <span v-if="getErrors(form, { path: ['floorPlans', index] })" class="text-destructive">
                {{ getErrors(form, { path: ["floorPlans", index] })?.[0] }}
              </span>
              <template v-else>{{ formatFileSize(file.size) }}</template>
            </template>
          </FileUpload>
          <FieldError :errors="field.errors" />
          <FieldDescription>PDFs up to 5 MB each, three at most.</FieldDescription>
        </Field>
      </FormischField>
    </FieldGroup>
    <Button type="submit" size="sm">Publish listing</Button>
    <p v-if="published" role="status" class="text-body-sm text-muted-foreground">{{ published }}</p>
  </Form>
</template>
