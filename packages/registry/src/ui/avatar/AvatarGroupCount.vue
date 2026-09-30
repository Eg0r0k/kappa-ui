<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { type AvatarSize, avatarVariants } from ".";

interface Props extends PrimitiveProps {
  size?: AvatarSize;
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), { as: "span", size: "md" });
</script>

<template>
  <Primitive
    data-slot="avatar-group-count"
    :data-size="props.size"
    :as="props.as"
    :as-child="props.asChild"
    :class="cn(avatarVariants({ size: props.size }), 'bg-muted text-muted-foreground', props.class)"
  >
    <slot />
  </Primitive>
</template>
