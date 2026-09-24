<script setup lang="ts">
import { type HTMLAttributes, onBeforeUnmount } from "vue";

import { injectFieldContext } from "@/lib/field-context";
import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();

const field = injectFieldContext(null);
if (field) field.hasDescription.value = true;
onBeforeUnmount(() => {
  if (field) field.hasDescription.value = false;
});
</script>

<template>
  <p
    data-slot="field-description"
    :id="field?.descriptionId"
    :class="
      cn(
        'text-body-sm text-muted-foreground group-data-disabled/field:text-foreground/(--disabled-opacity) group-data-disabled/fieldset:text-foreground/(--disabled-opacity)',
        props.class,
      )
    "
  >
    <slot />
  </p>
</template>
