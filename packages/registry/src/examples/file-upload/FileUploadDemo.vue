<script setup lang="ts">
import { Upload } from "@lucide/vue";
import { ref } from "vue";

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

const photo = ref<File | null>(null);
</script>

<template>
  <FileUpload
    v-slot="{ files }"
    v-model="photo"
    accept="image/png,image/jpeg,image/webp"
    :max-size="2 * 1024 * 1024"
    class="max-w-md"
  >
    <FileUploadDropzone as-child>
      <FileUploadTrigger>
        <FileUploadIcon><Upload /></FileUploadIcon>
        <FileUploadTitle>Drop your image here</FileUploadTitle>
        <FileUploadDescription>PNG, JPG or WebP, up to 2 MB</FileUploadDescription>
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
</template>
