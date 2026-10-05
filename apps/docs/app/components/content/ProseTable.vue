<script setup lang="ts">
import TableFrame from '~/components/TableFrame.vue'
import ScrollBox from '~/components/ScrollBox.vue'
</script>

<template>
  <TableFrame class="my-6">
    <ScrollBox>
      <table
        class="w-full text-left text-sm [&_a]:rounded-sm [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:focus-visible:focus-ring [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-xs [&_code]:whitespace-nowrap [&_code]:text-foreground [&_td]:px-4 [&_td]:py-3 [&_td:first-child_code]:bg-transparent [&_td:first-child_code]:px-0 [&_td:not(:first-child)]:text-muted-foreground [&_tbody_tr]:border-b [&_tbody_tr]:align-top [&_tbody_tr]:last:border-0 [&_th]:px-4 [&_th]:py-2 [&_th]:font-medium [&_thead]:border-b [&_thead]:text-xs [&_thead]:text-muted-foreground"
      >
        <slot />
      </table>
    </ScrollBox>
  </TableFrame>
</template>
