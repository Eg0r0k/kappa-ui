<script setup lang="ts">
import TableFrame from '~/components/TableFrame.vue'
import ScrollBox from '~/components/ScrollBox.vue'
</script>

<template>
  <TableFrame class="my-6">
    <ScrollBox>
      <div class="prose max-w-none">
        <table class="my-0 [&_td]:px-4 [&_th]:px-4">
          <slot />
        </table>
      </div>
    </ScrollBox>
  </TableFrame>
</template>
