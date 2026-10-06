<script setup lang="ts">
import { Form, Field as FormischField, getErrors, useForm } from "@formisch/vue";
import * as v from "valibot";
import { type ComponentPublicInstance, ref } from "vue";

import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/ui/field";
import { Upload } from "@lucide/vue";
import {
  FileUpload,
  FileUploadDescription,
  FileUploadDropzone,
  FileUploadIcon,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTitle,
  FileUploadTrigger,
  fileKey,
} from "@/ui/file-upload";

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

// Formisch focuses the first invalid field on submit: hand it the element the trigger rendered
const element = (target: Element | ComponentPublicInstance | null) =>
  target && "$el" in target ? (target.$el as HTMLElement) : (target as HTMLElement | null);

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
          <FileUpload v-slot="{ files }" v-model="field.input" :name="field.props.name" accept="image/*">
            <FileUploadDropzone :ref="(target) => field.props.ref(element(target))" as-child>
              <FileUploadTrigger>
                <FileUploadIcon><Upload /></FileUploadIcon>
                <FileUploadTitle>Drop the cover photo here</FileUploadTitle>
                <FileUploadDescription>JPG, PNG or WebP, up to 2 MB</FileUploadDescription>
              </FileUploadTrigger>
            </FileUploadDropzone>
            <FileUploadList>
              <FileUploadItem v-for="file in files" :key="fileKey(file)" :file="file">
                <FileUploadItemPreview />
                <FileUploadItemMetadata />
                <FileUploadItemDelete />
              </FileUploadItem>
            </FileUploadList>
          </FileUpload>
          <FieldError :errors="field.errors" />
        </Field>
      </FormischField>
      <FormischField v-slot="field" :of="form" :path="['floorPlans']">
        <Field :invalid="field.errors !== null">
          <FieldLabel>Floor plans</FieldLabel>
          <FileUpload v-slot="{ files }" v-model="field.input" :name="field.props.name" multiple size="sm">
            <FileUploadTrigger :ref="(target) => field.props.ref(element(target))" as-child>
              <Button variant="outline" color="neutral" size="sm" class="self-start">
                <Upload data-icon="inline-start" />
                Add floor plans
              </Button>
            </FileUploadTrigger>
            <FileUploadList>
              <FileUploadItem v-for="(file, index) in files" :key="fileKey(file)" :file="file">
                <FileUploadItemPreview />
                <FileUploadItemMetadata v-slot="{ size }">
                  <span class="block truncate text-body-md"
                    ><bdi>{{ file.name }}</bdi></span
                  >
                  <span
                    v-if="getErrors(form, { path: ['floorPlans', index] })"
                    class="block text-body-sm text-destructive"
                  >
                    {{ getErrors(form, { path: ["floorPlans", index] })?.[0] }}
                  </span>
                  <span v-else class="block text-body-sm text-muted-foreground">{{ size }}</span>
                </FileUploadItemMetadata>
                <FileUploadItemDelete />
              </FileUploadItem>
            </FileUploadList>
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
