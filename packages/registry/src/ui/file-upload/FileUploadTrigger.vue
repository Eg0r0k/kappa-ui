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
    data-slot="file-upload-trigger"
    :id="upload.triggerId.value"
    :aria-describedby="upload.describedBy.value"
    :aria-invalid="upload.invalid.value ? 'true' : undefined"
    :disabled="upload.disabled.value || undefined"
    :class="cn(fileUploadTrigger, props.class)"
    @click="upload.open"
  >
    <slot />
  </Primitive>
</template>
