<script setup lang="ts">
import ExampleGridCell from '~/components/ExampleGridCell.vue'

const props = defineProps<{ names: string }>()

const names = computed(() =>
  props.names
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean),
)
</script>

<template>
  <div data-slot="example-grid" class="not-prose my-6 grid gap-6 md:grid-cols-2 [&_[data-example]]:my-0">
    <ExampleGridCell v-for="name in names" :key="name" :name="name" />
  </div>
</template>
