<script setup lang="ts">
import { TooltipProvider } from "reka-ui";

import { type TooltipProviderProps, provideTooltipSettings, tooltipDefaults } from "./context";

const props = withDefaults(defineProps<TooltipProviderProps>(), {
  delay: tooltipDefaults.delay,
  skipDelay: tooltipDefaults.skipDelay,
  restThreshold: tooltipDefaults.restThreshold,
  touch: tooltipDefaults.touch,
  touchDelay: tooltipDefaults.touchDelay,
  touchHideDelay: tooltipDefaults.touchHideDelay,
  hoverable: tooltipDefaults.hoverable,
  closeOnClick: tooltipDefaults.closeOnClick,
  disabled: tooltipDefaults.disabled,
});

provideTooltipSettings(props);
</script>

<template>
  <TooltipProvider :skip-delay-duration="props.skipDelay">
    <slot />
  </TooltipProvider>
</template>
