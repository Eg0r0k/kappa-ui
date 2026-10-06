<script setup lang="ts">
import { Upload } from "@lucide/vue";
import { computed, ref } from "vue";

import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/ui/field";
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

const resume = ref<File | null>(null);
const submitted = ref(false);
const sent = ref(false);
const invalid = computed(() => submitted.value && !resume.value);

const apply = () => {
  submitted.value = true;
  sent.value = Boolean(resume.value);
};
</script>

<template>
  <form novalidate class="flex w-full max-w-md flex-col items-start gap-4" @submit.prevent="apply">
    <FieldGroup class="w-full">
      <Field :invalid="invalid" required>
        <FieldLabel>Résumé</FieldLabel>
        <FileUpload v-slot="{ files }" v-model="resume" name="resume" accept=".pdf,.doc,.docx" :max-size="5 * 1024 * 1024">
          <FileUploadDropzone as-child>
            <FileUploadTrigger>
              <FileUploadIcon><Upload /></FileUploadIcon>
              <FileUploadTitle>Drop your résumé, or click to browse</FileUploadTitle>
              <FileUploadDescription>PDF or Word, up to 5 MB</FileUploadDescription>
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
        <FieldError v-if="invalid" errors="Attach your résumé to apply." />
        <FieldDescription v-else>We only share it with the hiring team.</FieldDescription>
      </Field>
      <Field disabled>
        <FieldLabel>Cover letter</FieldLabel>
        <FileUpload size="sm">
          <FileUploadTrigger as-child>
            <Button variant="outline" color="neutral" size="sm" class="self-start">
              <Upload data-icon="inline-start" />
              Attach a cover letter
            </Button>
          </FileUploadTrigger>
        </FileUpload>
        <FieldDescription>Not needed for this role.</FieldDescription>
      </Field>
    </FieldGroup>
    <Button type="submit" size="sm">Apply</Button>
    <p v-if="sent" role="status" class="text-body-sm text-muted-foreground">Sent {{ resume?.name }}.</p>
  </form>
</template>
