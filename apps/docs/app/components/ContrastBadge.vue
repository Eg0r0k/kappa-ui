<script setup lang="ts">
import { type ContrastGrade, formatRatio } from '~/lib/contrast'
import { Badge } from '@/ui/badge'

const props = defineProps<{ ratio: number; grade: ContrastGrade; min: number }>()

const colors = { pass: 'success', large: 'warning', fail: 'destructive' } as const
const titles = {
  pass: 'Passes WCAG AA',
  large: 'Only for large text: below 4.5:1',
  fail: 'Fails WCAG AA',
} as const
</script>

<template>
  <Badge
    variant="soft"
    size="sm"
    :color="colors[props.grade]"
    class="tabular-nums"
    :title="`${titles[props.grade]} (needs ${props.min}:1)`"
  >
    {{ formatRatio(props.ratio) }}
  </Badge>
</template>
