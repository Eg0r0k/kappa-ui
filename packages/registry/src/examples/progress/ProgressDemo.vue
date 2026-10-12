<script setup lang="ts">
import { Progress } from "@/ui/progress";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <Progress :model-value="60" class="max-w-sm" v-bind="$attrs" />
</template>
