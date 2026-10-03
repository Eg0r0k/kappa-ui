<script setup lang="ts">
import { type DialogRootEmits, type DialogRootProps, useForwardPropsEmits } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/ui/dialog";
import type { MenuSize } from "@/ui/menu";
import Command from "./Command.vue";

const props = withDefaults(
  defineProps<
    DialogRootProps & {
      title?: string;
      description?: string;
      size?: MenuSize;
      showCloseButton?: boolean;
      class?: HTMLAttributes["class"];
    }
  >(),
  {
    title: "Command Palette",
    description: "Search for a command to run...",
    size: "md",
    showCloseButton: false,
  },
);
const emits = defineEmits<DialogRootEmits>();

const delegated = computed(() => {
  const { title: _, description: __, size: ___, showCloseButton: ____, class: _____, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <Dialog v-slot="slotProps" v-bind="forwarded">
    <DialogContent :show-close-button="props.showCloseButton" :class="cn('gap-0 overflow-hidden p-0', props.class)">
      <DialogTitle class="sr-only">{{ props.title }}</DialogTitle>
      <DialogDescription class="sr-only">{{ props.description }}</DialogDescription>
      <Command :size="props.size" class="rounded-none bg-transparent">
        <slot v-bind="slotProps" />
      </Command>
    </DialogContent>
  </Dialog>
</template>
