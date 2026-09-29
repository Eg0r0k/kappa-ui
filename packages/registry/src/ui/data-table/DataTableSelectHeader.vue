<script setup lang="ts">
import { computed } from "vue";

import { Checkbox } from "@/ui/checkbox";
import { injectDataTableContext } from ".";

const { selectAll } = injectDataTableContext();
const state = computed(() => selectAll.header.value);
</script>

<template>
  <span v-if="!selectAll.single.value" data-slot="data-table-select-header" class="flex items-center justify-center">
    <Checkbox
      :model-value="state === 'checked' ? true : state === 'indeterminate' ? 'indeterminate' : false"
      aria-label="Select all rows on this page"
      size="sm"
      @update:model-value="selectAll.toggleHeader()"
    />
  </span>
</template>
