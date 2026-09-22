<script setup lang="ts">
import { computed } from 'vue'

import { inlineCode } from '~/lib/inline-code'

const props = defineProps<{ text: string }>()

const parts = computed(() => inlineCode(props.text))
</script>

<template>
  <template v-for="(part, index) in parts" :key="index">
    <code v-if="part.code" class="rounded bg-muted px-1 font-mono text-xs text-foreground">{{ part.text }}</code>
    <template v-else>{{ part.text }}</template>
  </template>
</template>
