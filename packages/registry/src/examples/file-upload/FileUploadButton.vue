<script setup lang="ts">
import { ImagePlus, Paperclip } from "@lucide/vue";
import { ref } from "vue";

import { FileUpload } from "@/ui/file-upload";

const photo = ref<File | null>(null);
const attachments = ref<File[]>([]);
</script>

<template>
  <div class="flex w-full max-w-md flex-col gap-8">
    <div class="flex items-center gap-4">
      <FileUpload
        v-model="photo"
        mode="button"
        layout="grid"
        size="xl"
        accept="image/*"
        :icon="ImagePlus"
        aria-label="Team photo"
        class="w-auto"
      />
      <div class="flex flex-col">
        <span class="text-label-lg">Team photo</span>
        <span class="text-body-sm text-muted-foreground">Square images look best.</span>
      </div>
    </div>
    <FileUpload v-model="attachments" mode="button" multiple size="sm" :icon="Paperclip" label="Attach files" />
  </div>
</template>
