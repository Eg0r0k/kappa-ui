<script setup lang="ts">
import { ref } from "vue";

import { FileUpload } from "@/ui/file-upload";

const photo = ref<File | null>(null);
</script>

<template>
  <FileUpload
    v-model="photo"
    accept="image/png,image/jpeg,image/webp"
    :max-size="2 * 1024 * 1024"
    label="Drop your image here"
    description="PNG, JPG or WebP, up to 2 MB"
    class="max-w-md"
  />
</template>
