<script setup lang="ts">
import { FileUpload } from "@/ui/file-upload";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
const brief = [new File(["# Launch plan\n"], "launch-plan.md", { type: "text/markdown", lastModified: 0 })];
</script>

<template>
  <div class="flex w-full max-w-md flex-col gap-6">
    <FileUpload
      v-for="size in sizes"
      :key="size"
      :size="size"
      :default-value="brief"
      multiple
      :label="`Upload, ${size}`"
      description="Any file"
    />
  </div>
</template>
