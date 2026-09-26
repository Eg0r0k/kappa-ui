<script setup lang="ts">
import { computed } from "vue";

import { cn } from "@/lib/utils";
import { Spinner } from "@/ui/spinner";
import { type Toast, toastAccents, toastIcons } from ".";
import ToastAction from "./ToastAction.vue";
import ToastClose from "./ToastClose.vue";
import ToastDescription from "./ToastDescription.vue";
import ToastTitle from "./ToastTitle.vue";

const props = defineProps<{ toast: Toast }>();

const accent = computed(() => toastAccents[props.toast.color ?? "neutral"]);
const icon = computed(() =>
  props.toast.icon === false ? undefined : (props.toast.icon ?? toastIcons[props.toast.color ?? "neutral"]),
);
</script>

<template>
  <div class="flex items-start gap-3">
    <Spinner v-if="props.toast.loading" :class="cn('mt-0.5 size-4', accent)" />
    <component
      :is="icon"
      v-else-if="icon"
      data-slot="toast-icon"
      aria-hidden="true"
      :class="cn('mt-0.5 size-4 shrink-0', accent)"
    />
    <div class="flex min-w-0 flex-1 flex-col gap-0.5">
      <ToastTitle v-if="props.toast.title">{{ props.toast.title }}</ToastTitle>
      <ToastDescription v-if="props.toast.description">{{ props.toast.description }}</ToastDescription>
    </div>
    <div v-if="props.toast.actions?.length" class="flex shrink-0 items-center gap-2 self-center">
      <ToastAction
        v-for="action in props.toast.actions"
        :key="action.label"
        :alt-text="action.altText ?? action.label"
        @click="action.onClick?.($event)"
      >
        {{ action.label }}
      </ToastAction>
    </div>
    <ToastClose v-if="props.toast.close !== false" class="-mt-1.5 -mb-1 -me-1.5" />
  </div>
</template>
