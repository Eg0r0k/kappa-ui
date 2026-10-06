<script setup lang="ts">
import { Upload } from "@lucide/vue";

import {
  FileUpload,
  FileUploadDescription,
  FileUploadDropzone,
  FileUploadIcon,
  FileUploadTitle,
  FileUploadTrigger,
} from "@/ui/file-upload";

const variants = ["outline", "soft", "subtle"] as const;
</script>

<template>
  <div class="grid w-full max-w-2xl gap-4 sm:grid-cols-3">
    <FileUpload v-for="variant in variants" :key="variant">
      <FileUploadDropzone as-child :variant="variant">
        <FileUploadTrigger>
          <FileUploadIcon><Upload /></FileUploadIcon>
          <FileUploadTitle>{{ variant }}</FileUploadTitle>
          <FileUploadDescription>Drop a file or click</FileUploadDescription>
        </FileUploadTrigger>
      </FileUploadDropzone>
    </FileUpload>
  </div>
</template>
