<script setup lang="ts">
import { ToastRoot } from "reka-ui";
import { computed, useTemplateRef } from "vue";

import { type ToastRecord, useToast } from "./manager";

const MAX_DELAY = 2_147_483_647;

const props = defineProps<{ toast: ToastRecord }>();

const manager = useToast();
const root = useTemplateRef<{ $el?: unknown }>("root");

const duration = computed(() => {
  const { duration, loading } = props.toast;
  if (loading) return MAX_DELAY;
  if (duration === undefined) return undefined;
  return duration > 0 ? Math.min(duration, MAX_DELAY) : MAX_DELAY;
});

let outsideEscape = false;

const onOpenChange = (open: boolean) => {
  if (open || outsideEscape) return;
  manager.remove(props.toast.id);
};

const onEscapeKeyDown = (event: KeyboardEvent) => {
  const element = root.value?.$el;
  if (element instanceof Element && event.target instanceof Node && element.contains(event.target)) return;
  outsideEscape = true;
  queueMicrotask(() => (outsideEscape = false));
};
</script>

<template>
  <ToastRoot
    ref="root"
    :open="props.toast.open"
    :duration="duration"
    :type="props.toast.background ? 'background' : 'foreground'"
    @update:open="onOpenChange"
    @escape-key-down="onEscapeKeyDown"
    @after-leave="manager.drop(props.toast.id)"
  >
    <template #default="slotProps">
      <slot v-bind="slotProps" />
    </template>
  </ToastRoot>
</template>
