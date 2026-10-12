<script setup lang="ts">
import { Input } from "@/ui/input";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <Input type="email" placeholder="Email" aria-label="Email" class="max-w-xs" v-bind="$attrs" />
</template>
