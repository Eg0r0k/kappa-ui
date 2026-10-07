<script setup lang="ts">
import { ImagePlus, Paperclip, X } from "@lucide/vue";
import { ref } from "vue";

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

const photo = ref<File | null>(null);
const attachments = ref<File[]>([]);
</script>

<template>
  <div class="flex w-full max-w-md flex-col gap-8">
    <div class="flex items-center gap-4">
      <FileUpload v-slot="{ files, urlOf, removeFile }" v-model="photo" size="xl" accept="image/*" class="w-auto">
        <div class="relative w-fit">
          <FileUploadTrigger as-child>
            <Button variant="outline" color="neutral" size="icon-xl" aria-label="Team photo" class="overflow-hidden">
              <img v-if="files[0] && urlOf(files[0])" :src="urlOf(files[0])" alt="" class="size-full object-cover" />
              <ImagePlus v-else />
            </Button>
          </FileUploadTrigger>
          <Button
            v-if="files[0]"
            type="button"
            variant="solid"
            color="neutral"
            size="icon-xs"
            touch-target="expand"
            :aria-label="`Remove ${files[0].name}`"
            class="absolute -end-1.5 -top-1.5 z-10 rounded-full ring-2 ring-background"
            @click="removeFile(files[0])"
          >
            <X />
          </Button>
        </div>
      </FileUpload>
      <div class="flex flex-col">
        <span class="text-label-lg">Team photo</span>
        <span class="text-body-sm text-muted-foreground">Square images look best.</span>
      </div>
    </div>
    <FileUpload v-slot="{ files }" v-model="attachments" multiple size="sm">
      <FileUploadTrigger as-child>
        <Button variant="outline" color="neutral" size="sm" class="self-start">
          <Paperclip data-icon="inline-start" />
          Attach files
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
  </div>
</template>
