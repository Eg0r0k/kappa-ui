<script setup lang="ts">
import { Button } from "@/ui/button";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <Button v-bind="$attrs">Button</Button>
</template>
