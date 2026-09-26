<script setup lang="ts">
import { Heart, Music, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume1, Volume2 } from '@lucide/vue'
import { onBeforeUnmount, ref, watch } from 'vue'

import { Button } from '@/ui/button'
import { Card, CardContent } from '@/ui/card'
import { Slider } from '@/ui/slider'

const track = { title: 'Midnight City', artist: 'M83', length: 243 }
const position = ref(71)
const volume = ref(60)
const playing = ref(false)
const liked = ref(true)

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`

let ticker: ReturnType<typeof setInterval> | undefined
watch(playing, (value) => {
  clearInterval(ticker)
  if (value) ticker = setInterval(() => (position.value = (position.value + 1) % track.length), 1000)
})
onBeforeUnmount(() => clearInterval(ticker))
</script>

<template>
  <Card>
    <CardContent class="flex flex-col gap-5">
      <div class="flex items-center gap-4">
        <div class="flex size-16 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Music class="size-7" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-title-md">{{ track.title }}</p>
          <p class="truncate text-body-md text-muted-foreground">{{ track.artist }}</p>
        </div>
        <Button
          variant="ghost"
          color="neutral"
          size="icon"
          :aria-label="liked ? 'Unlike' : 'Like'"
          :aria-pressed="liked"
          @click="liked = !liked"
        >
          <Heart :class="liked && 'fill-current text-destructive'" />
        </Button>
      </div>
      <div class="flex flex-col gap-2">
        <Slider v-model="position" variant="inset" :max="track.length" aria-label="Position" :aria-valuetext="clock(position)" />
        <div class="flex justify-between text-body-sm text-muted-foreground tabular-nums">
          <span>{{ clock(position) }}</span>
          <span>-{{ clock(track.length - position) }}</span>
        </div>
      </div>
      <div class="flex items-center justify-center gap-2">
        <Button variant="ghost" color="neutral" size="icon" aria-label="Shuffle"><Shuffle /></Button>
        <Button variant="ghost" color="neutral" size="icon" aria-label="Previous" @click="position = 0"><SkipBack /></Button>
        <Button size="icon-lg" class="rounded-full" :aria-label="playing ? 'Pause' : 'Play'" @click="playing = !playing">
          <Pause v-if="playing" />
          <Play v-else />
        </Button>
        <Button variant="ghost" color="neutral" size="icon" aria-label="Next"><SkipForward /></Button>
        <Button variant="ghost" color="neutral" size="icon" aria-label="Repeat"><Repeat /></Button>
      </div>
      <div class="flex items-center gap-3 text-muted-foreground">
        <Volume1 class="size-4 shrink-0" />
        <Slider v-model="volume" variant="inset" size="sm" aria-label="Volume" :aria-valuetext="`${volume}%`" />
        <Volume2 class="size-4 shrink-0" />
      </div>
    </CardContent>
  </Card>
</template>
