<script setup lang="ts">
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

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
const brief = [new File(["# Launch plan\n"], "launch-plan.md", { type: "text/markdown", lastModified: 0 })];
</script>

<template>
  <div class="flex w-full max-w-md flex-col gap-6">
    <FileUpload v-for="size in sizes" :key="size" v-slot="{ files }" :size="size" :default-value="brief" multiple>
      <FileUploadDropzone as-child>
        <FileUploadTrigger>
          <FileUploadIcon><Upload /></FileUploadIcon>
          <FileUploadTitle>Upload, {{ size }}</FileUploadTitle>
          <FileUploadDescription>Any file</FileUploadDescription>
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
  </div>
</template>
