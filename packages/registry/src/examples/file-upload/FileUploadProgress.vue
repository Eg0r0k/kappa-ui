<script setup lang="ts">
import { Upload } from "@lucide/vue";
import { onBeforeUnmount, reactive, ref, watch } from "vue";

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
import { Progress } from "@/ui/progress";

const files = ref<File[]>([]);
const progress = reactive(new Map<File, number>());
const timers = new Map<File, number>();

// stands in for an XHR or fetch upload reporting its progress
const upload = (file: File) => {
  progress.set(file, 0);
  const timer = window.setInterval(() => {
    const next = Math.min(100, (progress.get(file) ?? 0) + 4 + Math.random() * 12);
    progress.set(file, next);
    if (next < 100) return;
    window.clearInterval(timer);
    timers.delete(file);
  }, 250);
  timers.set(file, timer);
};

// a file that leaves the list is a cancelled upload
watch(files, (current) => {
  for (const file of current) if (!progress.has(file)) upload(file);
  for (const file of progress.keys()) {
    if (current.includes(file)) continue;
    window.clearInterval(timers.get(file));
    timers.delete(file);
    progress.delete(file);
  }
});

onBeforeUnmount(() => timers.forEach((timer) => window.clearInterval(timer)));
</script>

<template>
  <FileUpload v-slot="{ files: picked }" v-model="files" multiple class="max-w-md">
    <FileUploadDropzone as-child>
      <FileUploadTrigger>
        <FileUploadIcon><Upload /></FileUploadIcon>
        <FileUploadTitle>Drop files to upload them right away</FileUploadTitle>
        <FileUploadDescription>Remove a file to cancel its upload</FileUploadDescription>
      </FileUploadTrigger>
    </FileUploadDropzone>
    <FileUploadList>
      <FileUploadItem v-for="file in picked" :key="fileKey(file)" :file="file">
        <FileUploadItemPreview />
        <FileUploadItemMetadata v-slot="{ size }">
          <span class="block truncate text-body-md"
            ><bdi>{{ file.name }}</bdi></span
          >
          <div
            v-if="(progress.get(file) ?? 0) < 100"
            class="flex items-center gap-2 pt-1 text-body-sm text-muted-foreground"
          >
            <Progress
              :model-value="progress.get(file) ?? 0"
              size="xs"
              :aria-label="`Uploading ${file.name}`"
              class="flex-1"
            />
            <span class="w-9 text-end tabular-nums">{{ Math.round(progress.get(file) ?? 0) }}%</span>
          </div>
          <span v-else class="block text-body-sm text-muted-foreground">{{ size }}, uploaded</span>
        </FileUploadItemMetadata>
        <FileUploadItemDelete />
      </FileUploadItem>
    </FileUploadList>
  </FileUpload>
</template>
