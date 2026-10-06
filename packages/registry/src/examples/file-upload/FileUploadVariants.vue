<script setup lang="ts">
import { FileUpload } from "@/ui/file-upload";

const variants = ["outline", "soft", "subtle"] as const;
</script>

<template>
  <div class="grid w-full max-w-2xl gap-4 sm:grid-cols-3">
    <FileUpload
      v-for="variant in variants"
      :key="variant"
      :variant="variant"
      :label="variant"
      description="Drop a file or click"
    />
  </div>
</template>
