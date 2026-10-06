<script setup lang="ts">
import { ref } from "vue";

import { FileUpload, type FileUploadRejection, formatFileSize } from "@/ui/file-upload";

const maxSize = 1024 * 1024;
const photos = ref<File[]>([]);
const problems = ref<string[]>([]);

const why: Record<FileUploadRejection["reason"], (file: File) => string> = {
  type: (file) => `${file.name} isn't an image.`,
  size: (file) => `${file.name} is ${formatFileSize(file.size)}; the limit is ${formatFileSize(maxSize)}.`,
  count: (file) => `${file.name} didn't fit: three photos at most.`,
  duplicate: (file) => `${file.name} is already in the list.`,
  directory: (file) => `${file.name} is a folder; drop the photos inside it instead.`,
};

const explain = (rejections: FileUploadRejection[]) => {
  problems.value = rejections.map(({ file, reason }) => why[reason](file));
};
</script>

<template>
  <div class="flex w-full max-w-md flex-col gap-3">
    <FileUpload
      v-model="photos"
      multiple
      layout="grid"
      accept="image/*"
      :max-size="maxSize"
      :max-files="3"
      label="Add up to three photos"
      description="Images only, 1 MB each"
      @reject="explain"
      @update:model-value="problems = []"
    />
    <div role="status" class="text-body-sm text-destructive">
      <ul v-if="problems.length > 0" class="ms-4 flex list-disc flex-col gap-1">
        <li v-for="problem in problems" :key="problem">{{ problem }}</li>
      </ul>
    </div>
  </div>
</template>
