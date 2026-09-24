<script setup lang="ts">
const props = withDefaults(defineProps<{ type?: 'note' | 'warning' }>(), { type: 'note' })
</script>

<template>
  <aside
    :class="[
      'not-prose my-6 rounded-lg border px-4 py-3 text-sm leading-6 [&_a]:text-primary [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_p+p]:mt-2',
      props.type === 'warning' ? 'border-destructive/40 bg-destructive/5' : 'bg-muted/40',
    ]"
  >
    <slot />
  </aside>
</template>
