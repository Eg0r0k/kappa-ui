<script setup lang="ts">
const props = withDefaults(defineProps<{ title?: string; description?: string }>(), {
  title: 'kappa-ui',
  description: 'A shadcn-style component registry for Vue.',
})
</script>

<template>
  <div class="flex h-full w-full flex-col justify-between bg-white p-[72px]" style="color: #0a0a0a">
    <span class="text-[32px] font-bold" style="letter-spacing: -0.02em">kappa-ui</span>
    <div class="flex flex-col gap-6">
      <span class="text-[72px] font-extrabold" style="line-height: 1.1; letter-spacing: -0.04em">{{
        props.title
      }}</span>
      <span class="text-[36px]" style="line-height: 1.4; color: #737373">{{ props.description }}</span>
    </div>
    <div class="h-2 w-40 rounded-full" style="background-color: #1f5ed9" />
  </div>
</template>
