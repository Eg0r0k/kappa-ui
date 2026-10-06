<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

import {
  fileUploadItemNameVariants,
  formatFileSize,
  injectFileUploadContext,
  injectFileUploadItemContext,
  injectFileUploadListContext,
} from ".";

const props = withDefaults(defineProps<PrimitiveProps & { class?: HTMLAttributes["class"] }>(), { as: "div" });

const upload = injectFileUploadContext();
const list = injectFileUploadListContext(null);
const item = injectFileUploadItemContext();
const grid = computed(() => list?.layout.value === "grid");
const size = computed(() => formatFileSize(item.file.value.size));
</script>

<template>
  <!-- an image tile shows only its picture; its name and size stay for screen readers -->
  <Primitive
    :as="props.as"
    :as-child="props.asChild"
    data-slot="file-upload-item-content"
    :class="
      cn(
        'flex min-w-0 flex-1 flex-col',
        grid && (item.url.value ? 'sr-only' : 'w-full flex-none text-center'),
        props.class,
      )
    "
  >
    <slot :file="item.file.value" :size="size">
      <span
        data-slot="file-upload-item-name"
        :class="cn(fileUploadItemNameVariants({ size: upload.size.value }), grid && 'text-body-sm')"
      >
        <bdi>{{ item.file.value.name }}</bdi>
      </span>
      <span
        data-slot="file-upload-item-size"
        :class="cn('block text-body-sm text-muted-foreground', grid && 'sr-only')"
      >
        <bdi>{{ size }}</bdi>
      </span>
    </slot>
  </Primitive>
</template>
