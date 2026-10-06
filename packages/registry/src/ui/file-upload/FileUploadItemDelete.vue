<script setup lang="ts">
import { X } from "@lucide/vue";
import type { HTMLAttributes } from "vue";
import { computed } from "vue";

import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";

import {
  fileUploadRemoveOverlayVariants,
  fileUploadRemoveSize,
  injectFileUploadContext,
  injectFileUploadItemContext,
  injectFileUploadListContext,
} from ".";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();

const upload = injectFileUploadContext();
const list = injectFileUploadListContext(null);
const item = injectFileUploadItemContext();
const grid = computed(() => list?.layout.value === "grid");
</script>

<template>
  <Button
    type="button"
    data-slot="file-upload-item-delete"
    :variant="grid ? 'solid' : 'ghost'"
    color="neutral"
    :size="grid ? 'icon-xs' : fileUploadRemoveSize[upload.size.value]"
    touch-target="expand"
    :disabled="upload.disabled.value"
    :aria-label="`Remove ${item.file.value.name}`"
    :class="
      cn(grid ? fileUploadRemoveOverlayVariants({ size: upload.size.value }) : 'ms-auto shrink-0', props.class)
    "
    @click="upload.removeFile(item.file.value)"
  >
    <slot>
      <X />
    </slot>
  </Button>
</template>
