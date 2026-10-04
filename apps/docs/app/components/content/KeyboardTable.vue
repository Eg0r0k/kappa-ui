<script setup lang="ts">
import TableFrame from '~/components/TableFrame.vue'
import ScrollBox from '~/components/ScrollBox.vue'
import InlineText from '~/components/content/InlineText.vue'

const props = defineProps<{ rows: { keys: string; description: string }[] }>()
</script>

<template>
  <TableFrame class="my-6">
    <ScrollBox>
      <table class="w-full text-left text-sm">
        <thead class="border-b text-xs text-muted-foreground">
          <tr>
            <th class="px-4 py-2 font-medium">Key</th>
            <th class="px-4 py-2 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in props.rows" :key="row.keys" class="border-b align-top last:border-0">
            <td class="px-4 py-3 whitespace-nowrap">
              <kbd class="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">{{ row.keys }}</kbd>
            </td>
            <td class="min-w-64 px-4 py-3 text-muted-foreground"><InlineText :text="row.description" /></td>
          </tr>
        </tbody>
      </table>
    </ScrollBox>
  </TableFrame>
</template>
