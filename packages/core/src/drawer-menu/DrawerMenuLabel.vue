<script setup lang="ts">
import { Primitive } from "reka-ui";

import type { DrawerMenuLabelProps } from "./context";

const props = defineProps<DrawerMenuLabelProps>();
</script>

<template>
  <Primitive :as="props.as" :as-child="props.asChild">
    <slot />
  </Primitive>
</template>
