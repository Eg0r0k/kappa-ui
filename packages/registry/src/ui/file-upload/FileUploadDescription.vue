<script setup lang="ts">
import { Primitive, type PrimitiveProps, useId } from "reka-ui";
import { type HTMLAttributes, onBeforeUnmount } from "vue";

import { cn } from "@/lib/utils";

import { fileUploadDescriptionVariants, injectFileUploadContext } from ".";

const props = withDefaults(defineProps<PrimitiveProps & { class?: HTMLAttributes["class"] }>(), { as: "span" });

const upload = injectFileUploadContext();
const id = useId(undefined, "file-upload-description");
onBeforeUnmount(upload.registerDescription(id));
</script>

<template>
  <!-- the trigger reads it through aria-describedby, so it stays out of the trigger's name -->
  <Primitive
    :id="id"
    :as="props.as"
    :as-child="props.asChild"
    data-slot="file-upload-description"
    aria-hidden="true"
    :class="cn(fileUploadDescriptionVariants({ size: upload.size.value }), props.class)"
  >
    <slot />
  </Primitive>
</template>
