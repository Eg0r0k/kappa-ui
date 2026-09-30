<script setup lang="ts">
import { HoverCardTrigger, type HoverCardTriggerProps } from "reka-ui";

import { useTriggerBehaviour } from "./trigger";

const props = defineProps<HoverCardTriggerProps>();

const { handlers } = useTriggerBehaviour();
</script>

<template>
  <HoverCardTrigger v-bind="{ ...props, ...handlers }">
    <slot />
  </HoverCardTrigger>
</template>
