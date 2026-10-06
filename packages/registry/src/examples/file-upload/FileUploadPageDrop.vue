<script setup lang="ts">
import { Paperclip } from "@lucide/vue";
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from "vue";

import { Button } from "@/ui/button";
import {
  FileUpload,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
  fileKey,
} from "@/ui/file-upload";
import { Textarea } from "@/ui/textarea";

const attachments = ref<File[]>([]);
const upload = useTemplateRef<{ addFiles: (files: FileList | File[]) => void }>("upload");
const dragging = ref(false);
let depth = 0;

const carriesFiles = (event: DragEvent) => event.dataTransfer?.types.includes("Files") ?? false;

const onDragEnter = (event: DragEvent) => {
  if (!carriesFiles(event)) return;
  depth += 1;
  dragging.value = true;
};
const onDragLeave = (event: DragEvent) => {
  if (!carriesFiles(event)) return;
  depth = Math.max(0, depth - 1);
  dragging.value = depth > 0;
};
// without this the browser opens a file dropped anywhere on the page
const onDragOver = (event: DragEvent) => {
  if (carriesFiles(event)) event.preventDefault();
};
const onDrop = (event: DragEvent) => {
  depth = 0;
  dragging.value = false;
  if (!carriesFiles(event)) return;
  event.preventDefault();
  upload.value?.addFiles(event.dataTransfer!.files);
};

const listeners = { dragenter: onDragEnter, dragleave: onDragLeave, dragover: onDragOver, drop: onDrop };

onMounted(() => {
  for (const [type, listener] of Object.entries(listeners)) window.addEventListener(type, listener as EventListener);
});
onBeforeUnmount(() => {
  for (const [type, listener] of Object.entries(listeners)) window.removeEventListener(type, listener as EventListener);
});
</script>

<template>
  <div class="flex w-full max-w-md flex-col gap-3">
    <Textarea aria-label="Message" placeholder="Write a reply, or drop files anywhere on the page." :rows="3" />
    <FileUpload ref="upload" v-slot="{ files }" v-model="attachments" multiple size="sm">
      <FileUploadTrigger as-child>
        <Button variant="soft" color="neutral" size="sm" class="self-start">
          <Paperclip data-icon="inline-start" />
          Attach
        </Button>
      </FileUploadTrigger>
      <FileUploadList>
        <FileUploadItem v-for="file in files" :key="fileKey(file)" :file="file">
          <FileUploadItemPreview />
          <FileUploadItemMetadata />
          <FileUploadItemDelete />
        </FileUploadItem>
      </FileUploadList>
    </FileUpload>
    <div
      v-if="dragging"
      aria-hidden="true"
      class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-scrim p-6"
    >
      <div
        class="rounded-2xl border-2 border-dashed border-primary bg-background px-8 py-6 text-title-md text-foreground"
      >
        Drop to attach
      </div>
    </div>
  </div>
</template>
