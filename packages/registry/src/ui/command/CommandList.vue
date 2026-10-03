<script setup lang="ts">
import { ListboxContent, type ListboxContentProps, useForwardProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<ListboxContentProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
const forwarded = useForwardProps(delegated);
</script>

<template>
  <ListboxContent
    v-bind="forwarded"
    data-slot="command-list"
    :class="cn('max-h-75 scroll-py-(--menu-pad) overflow-x-hidden overflow-y-auto p-(--menu-pad)', props.class)"
  >
    <div role="presentation" class="flex flex-col gap-0.5">
      <slot />
    </div>
  </ListboxContent>
</template>
