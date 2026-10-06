<script setup lang="ts">
import { File as FileIcon } from "@lucide/vue";
import { Primitive, type PrimitiveProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

import {
  fileUploadItemPreviewVariants,
  injectFileUploadContext,
  injectFileUploadItemContext,
  injectFileUploadListContext,
} from ".";

const props = withDefaults(defineProps<PrimitiveProps & { class?: HTMLAttributes["class"] }>(), { as: "div" });

const upload = injectFileUploadContext();
const list = injectFileUploadListContext(null);
const item = injectFileUploadItemContext();
const layout = computed(() => list?.layout.value ?? "list");
</script>

<template>
  <Primitive
    :as="props.as"
    :as-child="props.asChild"
    data-slot="file-upload-item-preview"
    :data-image="item.url.value ? '' : undefined"
    :class="cn(fileUploadItemPreviewVariants({ layout, size: upload.size.value }), props.class)"
  >
    <slot :file="item.file.value" :url="item.url.value">
      <img
        v-if="item.url.value"
        :src="item.url.value"
        alt=""
        class="size-full object-cover in-data-disabled:opacity-(--disabled-opacity)"
      />
      <FileIcon v-else />
    </slot>
  </Primitive>
</template>
