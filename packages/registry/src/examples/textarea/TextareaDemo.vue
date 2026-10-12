<script setup lang="ts">
import { Textarea } from "@/ui/textarea";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <Textarea placeholder="Type your message here." aria-label="Message" class="max-w-sm" v-bind="$attrs" />
</template>
