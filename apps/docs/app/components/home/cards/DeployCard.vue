<script setup lang="ts">
import { Check, GitBranch, GitCommitHorizontal, RotateCw } from '@lucide/vue'
import { computed, onBeforeUnmount, ref } from 'vue'

import ShowcaseCard from '~/components/home/ShowcaseCard.vue'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card'
import { Progress } from '@/ui/progress'
import { Spinner } from '@/ui/spinner'
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
} from '@/ui/stepper'

const steps = [
  { step: 1, title: 'Build', running: 'Compiling components…', done: 'Compiled 61 components' },
  { step: 2, title: 'Test', running: 'Running tests…', done: '214 tests passed' },
  { step: 3, title: 'Deploy', running: 'Uploading to the edge…', done: 'Live on kappa-ui.pages.dev' },
]
type Step = (typeof steps)[number]

const stepTime = 1200
const tick = 100
const total = steps.length * stepTime

const elapsed = ref(total)
const deployedAt = ref('2m ago')
let timer: ReturnType<typeof setInterval> | undefined

const running = computed(() => elapsed.value < total)
const current = computed(() => Math.floor(elapsed.value / stepTime) + 1)
const percent = computed(() => Math.round((elapsed.value / total) * 100))

const status = (item: Step, state: string) => {
  if (state === 'completed') return item.done
  if (state === 'active') return item.running
  return 'Queued'
}

const stop = () => {
  clearInterval(timer)
  timer = undefined
}

const advance = () => {
  elapsed.value = Math.min(elapsed.value + tick, total)
  if (running.value) return
  stop()
  deployedAt.value = 'just now'
}

const redeploy = () => {
  if (running.value) return
  elapsed.value = 0
  timer = setInterval(advance, tick)
}

onBeforeUnmount(stop)
</script>

<template>
  <ShowcaseCard>
    <CardHeader class="grid-cols-[minmax(0,1fr)_auto]">
      <CardTitle>Deploy</CardTitle>
      <CardDescription class="flex flex-wrap items-center gap-x-1.5">
        <span>kappa-ui</span>
        <span aria-hidden="true">·</span>
        <span class="inline-flex items-center gap-1"><GitBranch class="size-3.5" />main</span>
        <span aria-hidden="true">·</span>
        <span class="inline-flex items-center gap-1">
          <GitCommitHorizontal class="size-3.5" />
          <span class="font-mono">3f2c1a9</span>
        </span>
      </CardDescription>
      <Badge variant="soft" size="sm" :color="running ? 'info' : 'success'" class="col-start-2 row-span-2 row-start-1">
        <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />
        {{ running ? 'Building' : 'Ready' }}
      </Badge>
    </CardHeader>
    <CardContent class="flex flex-col gap-4">
      <Progress
        :model-value="percent"
        size="xs"
        :get-value-label="() => 'Deployment progress'"
        :class="{ 'text-success': !running }"
      />
      <Stepper
        :model-value="current"
        orientation="vertical"
        size="sm"
        :linear="false"
        aria-label="Pipeline"
        class="gap-0"
      >
        <StepperItem
          v-for="item in steps"
          :key="item.step"
          v-slot="{ state }"
          :step="item.step"
          class="items-stretch gap-3"
        >
          <div class="flex flex-col items-center gap-1">
            <StepperIndicator
              class="bg-muted text-muted-foreground group-data-[state=completed]:bg-success group-data-[state=completed]:text-success-foreground"
            >
              <Check v-if="state === 'completed'" />
              <Spinner v-else-if="state === 'active'" />
              <template v-else>{{ item.step }}</template>
            </StepperIndicator>
            <StepperSeparator v-if="item.step < steps.length" class="mb-1 group-data-[state=completed]:bg-success" />
          </div>
          <div class="flex min-w-0 flex-1 flex-col gap-0.5 pt-1" :class="{ 'pb-4': item.step < steps.length }">
            <StepperTitle>{{ item.title }}</StepperTitle>
            <StepperDescription class="truncate">{{ status(item, state) }}</StepperDescription>
          </div>
        </StepperItem>
      </Stepper>
    </CardContent>
    <CardFooter class="justify-between">
      <span class="text-body-sm text-muted-foreground">
        {{ running ? 'Triggered just now' : `Deployed ${deployedAt}` }}
      </span>
      <Button variant="outline" color="neutral" size="sm" :disabled="running" @click="redeploy">
        <RotateCw data-icon="inline-start" />
        Redeploy
      </Button>
    </CardFooter>
  </ShowcaseCard>
</template>
