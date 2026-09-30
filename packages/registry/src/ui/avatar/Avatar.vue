<script setup lang="ts">
import { AvatarRoot, type AvatarRootProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { type AvatarSize, avatarVariants } from ".";

interface Props extends AvatarRootProps {
  size?: AvatarSize;
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), { size: "md" });
</script>

<template>
  <AvatarRoot
    data-slot="avatar"
    :data-size="props.size"
    :as="props.as"
    :as-child="props.asChild"
    :class="cn(avatarVariants({ size: props.size }), props.class)"
  >
    <slot />
  </AvatarRoot>
</template>
