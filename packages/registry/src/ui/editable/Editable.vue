<script setup lang="ts">
import { EditableRoot, type EditableRootEmits, type EditableRootProps, useForwardPropsEmits } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = withDefaults(defineProps<EditableRootProps & { class?: HTMLAttributes["class"] }>(), {
  activationMode: "focus",
  submitMode: "blur",
  autoResize: true,
});
const emits = defineEmits<EditableRootEmits>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <EditableRoot
    v-slot="slotProps"
    v-bind="forwarded"
    data-slot="editable"
    :class="cn('flex min-w-0 items-center gap-1', props.class)"
  >
    <slot v-bind="slotProps" />
  </EditableRoot>
</template>
