<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

import { fileUploadIconVariants, injectFileUploadContext } from ".";

const props = withDefaults(defineProps<PrimitiveProps & { class?: HTMLAttributes["class"] }>(), { as: "span" });

const upload = injectFileUploadContext();
</script>

<template>
  <Primitive
    :as="props.as"
    :as-child="props.asChild"
    data-slot="file-upload-icon"
    aria-hidden="true"
    :class="cn(fileUploadIconVariants({ size: upload.size.value }), props.class)"
  >
    <slot />
  </Primitive>
</template>
