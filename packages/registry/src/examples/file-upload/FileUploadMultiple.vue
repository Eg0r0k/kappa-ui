<script setup lang="ts">
import { ref } from "vue";

import { FileUpload } from "@/ui/file-upload";

const documents = ref<File[]>([]);
</script>

<template>
  <FileUpload
    v-model="documents"
    multiple
    accept=".pdf,.docx,image/*"
    :max-files="5"
    :max-size="10 * 1024 * 1024"
    label="Drop documents here, or click to browse"
    description="Up to 5 files: PDF, Word or images, 10 MB each"
    class="max-w-md"
  />
</template>
