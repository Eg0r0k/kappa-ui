<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

import {
  fileUploadItemVariants,
  injectFileUploadContext,
  injectFileUploadListContext,
  provideFileUploadItemContext,
} from ".";

const props = withDefaults(defineProps<PrimitiveProps & { file: File; class?: HTMLAttributes["class"] }>(), {
  as: "li",
});

const upload = injectFileUploadContext();
const list = injectFileUploadListContext(null);
const layout = computed(() => list?.layout.value ?? "list");
const url = computed(() => upload.urlOf(props.file));

provideFileUploadItemContext({ file: computed(() => props.file), url });
</script>

<template>
  <Primitive
    :as="props.as"
    :as-child="props.asChild"
    data-slot="file-upload-item"
    :data-image="url ? '' : undefined"
    :title="layout === 'grid' ? props.file.name : undefined"
    :class="cn('group/file-upload-item', fileUploadItemVariants({ layout, size: upload.size.value }), props.class)"
  >
    <slot :file="props.file" :url="url" />
  </Primitive>
</template>
