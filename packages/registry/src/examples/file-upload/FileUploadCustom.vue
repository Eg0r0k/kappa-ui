<script setup lang="ts">
import { FolderUp } from "@lucide/vue";
import { ref } from "vue";

import { Button } from "@/ui/button";
import { FileUpload } from "@/ui/file-upload";

const files = ref<File[]>([]);
</script>

<template>
  <FileUpload
    v-model="files"
    multiple
    :interactive="false"
    :icon="FolderUp"
    label="Drag and drop your dataset"
    description="CSV or JSON files"
    accept=".csv,.json"
    class="max-w-md"
  >
    <template #actions="{ open, triggerAttrs }">
      <Button v-bind="triggerAttrs" type="button" variant="outline" color="neutral" size="sm" @click="open">
        Browse files
      </Button>
    </template>
    <template #files-bottom="{ files: picked, clear }">
      <div v-if="picked.length > 1" class="flex justify-end">
        <Button type="button" variant="ghost" color="neutral" size="sm" @click="clear">Remove all</Button>
      </div>
    </template>
  </FileUpload>
</template>
