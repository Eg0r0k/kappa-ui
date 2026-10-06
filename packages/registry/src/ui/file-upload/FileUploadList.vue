<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

import {
  type FileUploadLayout,
  fileUploadListVariants,
  injectFileUploadContext,
  provideFileUploadListContext,
} from ".";

const props = withDefaults(
  defineProps<PrimitiveProps & { layout?: FileUploadLayout; class?: HTMLAttributes["class"] }>(),
  { as: "ul", layout: "list" },
);

const upload = injectFileUploadContext();
provideFileUploadListContext({ layout: computed(() => props.layout) });
</script>

<template>
  <Primitive
    v-if="upload.files.value.length > 0"
    :as="props.as"
    :as-child="props.asChild"
    role="list"
    data-slot="file-upload-list"
    :data-layout="props.layout"
    :class="cn(fileUploadListVariants({ layout: props.layout, size: upload.size.value }), props.class)"
  >
    <slot />
  </Primitive>
</template>
