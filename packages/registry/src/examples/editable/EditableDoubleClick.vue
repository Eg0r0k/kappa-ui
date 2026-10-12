<script setup lang="ts">
import { Folder } from "@lucide/vue";
import { ref } from "vue";

import { Editable, EditableArea, EditableInput, EditablePreview } from "@/ui/editable";

const folders = ref(["Invoices", "Contracts", "Receipts"]);
</script>

<template>
  <div class="flex w-full max-w-xs flex-col gap-3">
    <p class="text-body-sm text-muted-foreground">Double-click a folder to rename it.</p>
    <ul class="flex flex-col gap-1 text-body-md">
      <li v-for="(folder, index) in folders" :key="index" class="flex items-center gap-2">
        <Folder class="size-4 text-muted-foreground" aria-hidden="true" />
        <Editable v-model="folders[index]" activation-mode="dblclick" submit-mode="both" select-on-focus>
          <EditableArea>
            <EditablePreview />
            <EditableInput :aria-label="`Rename ${folder}`" />
          </EditableArea>
        </Editable>
      </li>
    </ul>
  </div>
</template>
