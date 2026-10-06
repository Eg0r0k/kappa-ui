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

const documents = ref<File[]>([]);
</script>

<template>
  <FileUpload
    v-slot="{ files }"
    v-model="documents"
    multiple
    accept=".pdf,.docx,image/*"
    :max-files="5"
    :max-size="10 * 1024 * 1024"
    class="max-w-md"
  >
    <FileUploadDropzone as-child>
      <FileUploadTrigger>
        <FileUploadIcon><Upload /></FileUploadIcon>
        <FileUploadTitle>Drop documents here, or click to browse</FileUploadTitle>
        <FileUploadDescription>Up to 5 files: PDF, Word or images, 10 MB each</FileUploadDescription>
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
