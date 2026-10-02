<script setup lang="ts">
import { Primitive } from "reka-ui";

import type { DrawerMenuSeparatorProps } from "./context";

const props = defineProps<DrawerMenuSeparatorProps>();
</script>

<template>
  <Primitive :as="props.as" :as-child="props.asChild" role="separator" aria-orientation="horizontal">
    <slot />
  </Primitive>
</template>
