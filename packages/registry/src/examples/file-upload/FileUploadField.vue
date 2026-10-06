<script setup lang="ts">
import { computed, ref } from "vue";

import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/ui/field";
import { FileUpload } from "@/ui/file-upload";

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
        <FileUpload
          v-model="resume"
          name="resume"
          accept=".pdf,.doc,.docx"
          :max-size="5 * 1024 * 1024"
          label="Drop your résumé, or click to browse"
          description="PDF or Word, up to 5 MB"
        />
        <FieldError v-if="invalid" errors="Attach your résumé to apply." />
        <FieldDescription v-else>We only share it with the hiring team.</FieldDescription>
      </Field>
      <Field disabled>
        <FieldLabel>Cover letter</FieldLabel>
        <FileUpload mode="button" size="sm" label="Attach a cover letter" />
        <FieldDescription>Not needed for this role.</FieldDescription>
      </Field>
    </FieldGroup>
    <Button type="submit" size="sm">Apply</Button>
    <p v-if="sent" role="status" class="text-body-sm text-muted-foreground">Sent {{ resume?.name }}.</p>
  </form>
</template>
