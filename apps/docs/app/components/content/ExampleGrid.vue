<script setup lang="ts">
import ExampleGridCell from '~/components/ExampleGridCell.vue'
import { splitNames } from '~/lib/examples'

const props = defineProps<{ names: string }>()

const names = computed(() => splitNames(props.names))
</script>

<template>
  <div data-slot="example-grid" class="not-prose my-6">
    <div class="grid gap-6">
      <ExampleGridCell v-for="(name, index) in names" :key="name" :name="name" :eager="index < 2" />
    </div>
  </div>
</template>
