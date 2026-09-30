<script setup lang="ts">
import { GripVertical } from "@lucide/vue";
import {
  SplitterResizeHandle,
  type SplitterResizeHandleEmits,
  type SplitterResizeHandleProps,
  useForwardPropsEmits,
} from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { type SplitterHandleVariants, splitterGripClass, splitterHandleVariants } from ".";

const props = withDefaults(
  defineProps<
    SplitterResizeHandleProps & {
      variant?: NonNullable<SplitterHandleVariants["variant"]>;
      grip?: boolean;
      class?: HTMLAttributes["class"];
    }
  >(),
  { variant: "line" },
);
const emits = defineEmits<SplitterResizeHandleEmits>();

const delegated = computed(() => {
  const { class: _, variant: __, grip: ___, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <SplitterResizeHandle
    v-bind="forwarded"
    data-slot="splitter-handle"
    :data-variant="props.variant"
    :class="cn(splitterHandleVariants({ variant: props.variant }), props.class)"
  >
    <span v-if="props.grip" data-slot="splitter-grip" :class="splitterGripClass">
      <slot><GripVertical /></slot>
    </span>
  </SplitterResizeHandle>
</template>
