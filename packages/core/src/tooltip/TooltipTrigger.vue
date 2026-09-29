<script setup lang="ts">
import { TooltipTrigger, type TooltipTriggerProps } from "reka-ui";

import { useTriggerBehaviour } from "./trigger";

const props = defineProps<TooltipTriggerProps>();

const { reference, handlers } = useTriggerBehaviour();
</script>

<template>
  <TooltipTrigger v-bind="{ ...props, ...handlers }" :reference="props.reference ?? reference">
    <slot />
  </TooltipTrigger>
</template>
