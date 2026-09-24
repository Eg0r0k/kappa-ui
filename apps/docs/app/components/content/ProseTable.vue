<script setup lang="ts">
import ScrollBox from '~/components/ScrollBox.vue'
</script>

<template>
  <div class="my-6">
    <ScrollBox>
      <table class="my-0">
        <slot />
      </table>
    </ScrollBox>
  </div>
</template>
