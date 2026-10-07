<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ text: string }>()

const parts = computed(() => props.text.split(/(\s+)/).filter(Boolean))
</script>

<template>
  <template v-for="(part, index) in parts" :key="index">
    <template v-if="part.trim() === ''">{{ part }}</template>
    <span v-else class="whitespace-nowrap">{{ part }}</span>
  </template>
</template>
