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

const picture = (name: string, from: string, to: string) =>
  new File(
    [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><linearGradient id="g" x2="1" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient><rect width="4" height="3" fill="url(#g)"/></svg>`,
    ],
    name,
    { type: "image/svg+xml", lastModified: 0 },
  );

const files = [
  picture("sunset.svg", "#f97316", "#7c3aed"),
  picture("forest.svg", "#166534", "#a3e635"),
  new File([new Uint8Array(184_320)], "itinerary.pdf", { type: "application/pdf", lastModified: 0 }),
];

const layouts = ["list", "grid"] as const;
</script>

<template>
  <div class="grid w-full max-w-3xl gap-6 md:grid-cols-2">
    <template v-for="layout in layouts" :key="layout">
      <FileUpload v-slot="{ files: picked }" :default-value="files" multiple size="sm">
        <FileUploadDropzone as-child>
          <FileUploadTrigger>
            <FileUploadIcon><Upload /></FileUploadIcon>
            <FileUploadTitle>{{ layout }}, after the zone</FileUploadTitle>
            <FileUploadDescription>Photos and PDFs</FileUploadDescription>
          </FileUploadTrigger>
        </FileUploadDropzone>
        <FileUploadList :layout="layout">
          <FileUploadItem v-for="file in picked" :key="fileKey(file)" :file="file">
            <FileUploadItemPreview />
            <FileUploadItemMetadata />
            <FileUploadItemDelete />
          </FileUploadItem>
        </FileUploadList>
      </FileUpload>
      <FileUpload v-slot="{ files: picked }" :default-value="files" multiple size="sm">
        <FileUploadDropzone>
          <FileUploadTrigger class="flex flex-col items-center gap-2 rounded-lg">
            <FileUploadIcon><Upload /></FileUploadIcon>
            <FileUploadTitle>{{ layout }}, in the zone</FileUploadTitle>
            <FileUploadDescription>Photos and PDFs</FileUploadDescription>
          </FileUploadTrigger>
          <FileUploadList :layout="layout">
            <FileUploadItem v-for="file in picked" :key="fileKey(file)" :file="file">
              <FileUploadItemPreview />
              <FileUploadItemMetadata />
              <FileUploadItemDelete />
            </FileUploadItem>
          </FileUploadList>
        </FileUploadDropzone>
      </FileUpload>
    </template>
  </div>
</template>
