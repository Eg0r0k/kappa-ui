<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

import { fileUploadTrigger, injectFileUploadContext } from ".";

const props = withDefaults(defineProps<PrimitiveProps & { class?: HTMLAttributes["class"] }>(), { as: "button" });

const upload = injectFileUploadContext();
</script>

<template>
  <Primitive
    :as="props.as"
    :as-child="props.asChild"
    type="button"
    data-slot="file-upload-clear"
    :disabled="upload.disabled.value || upload.files.value.length === 0 || undefined"
    :class="cn(fileUploadTrigger, props.class)"
    @click="upload.clear"
  >
    <slot />
  </Primitive>
</template>
