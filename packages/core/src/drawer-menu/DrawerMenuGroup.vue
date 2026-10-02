<script setup lang="ts">
import { Primitive } from "reka-ui";

import type { DrawerMenuGroupProps } from "./context";

const props = defineProps<DrawerMenuGroupProps>();
</script>

<template>
  <Primitive :as="props.as" :as-child="props.asChild" role="group">
    <slot />
  </Primitive>
</template>
