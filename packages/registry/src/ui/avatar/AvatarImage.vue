<script setup lang="ts">
import { AvatarImage, type AvatarImageEmits, type AvatarImageProps, useForwardPropsEmits } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<AvatarImageProps & { class?: HTMLAttributes["class"] }>();
const emits = defineEmits<AvatarImageEmits>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});

const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <AvatarImage
    data-slot="avatar-image"
    v-bind="forwarded"
    :class="cn('aspect-square size-full object-cover', props.class)"
  />
</template>
