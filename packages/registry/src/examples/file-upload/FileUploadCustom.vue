<script setup lang="ts">
import { FolderUp } from "@lucide/vue";
import { ref } from "vue";

import { Button } from "@/ui/button";
import {
  FileUpload,
  FileUploadClear,
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

const dataset = ref<File[]>([]);
</script>

<template>
  <FileUpload v-slot="{ files }" v-model="dataset" multiple accept=".csv,.json" class="max-w-md">
    <FileUploadDropzone>
      <FileUploadIcon><FolderUp /></FileUploadIcon>
      <FileUploadTitle>Drag and drop your dataset</FileUploadTitle>
      <FileUploadDescription>CSV or JSON files</FileUploadDescription>
      <FileUploadTrigger as-child>
        <Button variant="outline" color="neutral" size="sm">Browse files</Button>
      </FileUploadTrigger>
    </FileUploadDropzone>
    <FileUploadList>
      <FileUploadItem v-for="file in files" :key="fileKey(file)" :file="file">
        <FileUploadItemPreview />
        <FileUploadItemMetadata />
        <FileUploadItemDelete />
      </FileUploadItem>
    </FileUploadList>
    <div v-if="files.length > 1" class="flex justify-end">
      <FileUploadClear as-child>
        <Button variant="ghost" color="neutral" size="sm">Remove all</Button>
      </FileUploadClear>
    </div>
  </FileUpload>
</template>
