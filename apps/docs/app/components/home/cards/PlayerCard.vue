<script setup lang="ts">
import { Heart, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume1, Volume2, VolumeX } from '@lucide/vue'
import { computed, reactive, ref } from 'vue'

import ShowcaseCard from '~/components/home/ShowcaseCard.vue'
import { Button } from '@/ui/button'
import { CardContent } from '@/ui/card'
import { Image } from '@/ui/image'
import { Slider } from '@/ui/slider'
import { Toggle } from '@/ui/toggle'
import { vTooltip } from '@/ui/tooltip'

const commons = 'https://upload.wikimedia.org/wikipedia/commons/thumb'
const thumb = (dir: string, file: string, width: number) => `${commons}/${dir}/${file}/${width}px-${file}`

const tracks = reactive([
  {
    title: 'Gilded Hours',
    artist: 'Nova Lane',
    duration: 214,
    liked: true,
    cover: thumb('9/94', 'Igreja_de_Nossa_Senhora_do_Monte_do_Carmo%2C_Rio_de_Janeiro%2C_Brasil.jpg', 330),
    alt: 'The gilded nave of a baroque church',
  },
  {
    title: 'Ladybird',
    artist: 'The Quiet Hours',
    duration: 178,
    liked: false,
    cover: thumb('2/29', 'Coccinella_in_Parc_du_Bois-de-Coulonge_uncut_version.jpg', 250),
    alt: 'A ladybird opening its wings on a flower bud',
  },
])

const current = ref(0)
const position = ref(84)
const playing = ref(false)
const shuffle = ref(false)
const repeat = ref(true)
const volume = ref(64)

const track = computed(() => tracks[current.value]!)

const volumeIcon = computed(() => {
  if (volume.value === 0) return VolumeX
  if (volume.value < 50) return Volume1
  return Volume2
})

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

const skip = (step: number) => {
  current.value = (current.value + step + tracks.length) % tracks.length
  position.value = 0
}

const previous = () => {
  if (position.value > 3) position.value = 0
  else skip(-1)
}
</script>

<template>
  <ShowcaseCard>
    <CardContent class="flex flex-col gap-4">
      <div class="flex items-center gap-3">
        <Image
          :src="track.cover"
          :alt="track.alt"
          :ratio="1"
          loading="eager"
          class="w-20 shrink-0 rounded-md bg-muted"
        />
        <div class="flex min-w-0 flex-1 flex-col">
          <h3 class="text-label-sm text-muted-foreground">Now playing</h3>
          <p class="truncate text-title-sm">{{ track.title }}</p>
          <p class="truncate text-body-sm text-muted-foreground">{{ track.artist }}</p>
        </div>
        <Toggle
          v-model="track.liked"
          size="icon-sm"
          active-variant="ghost"
          active-color="destructive"
          aria-label="Like"
          class="data-[state=on]:*:fill-current"
        >
          <Heart />
        </Toggle>
      </div>
      <div class="flex flex-col gap-1.5">
        <Slider
          v-model="position"
          :max="track.duration"
          size="sm"
          aria-label="Seek"
          :aria-valuetext="`${clock(position)} of ${clock(track.duration)}`"
        />
        <div class="flex justify-between text-label-sm text-muted-foreground tabular-nums">
          <span>{{ clock(position) }}</span>
          <span>{{ clock(track.duration) }}</span>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <Toggle v-model="shuffle" size="icon-sm" active-color="primary" aria-label="Shuffle">
          <Shuffle />
        </Toggle>
        <Button
          v-tooltip.label="'Previous'"
          variant="ghost"
          color="neutral"
          size="icon-md"
          class="rounded-full"
          aria-label="Previous"
          @click="previous"
        >
          <SkipBack class="fill-current" />
        </Button>
        <Button
          v-tooltip.label="playing ? 'Pause' : 'Play'"
          size="icon-xl"
          class="rounded-full"
          :aria-label="playing ? 'Pause' : 'Play'"
          @click="playing = !playing"
        >
          <Pause v-if="playing" class="fill-current" />
          <Play v-else class="fill-current" />
        </Button>
        <Button
          v-tooltip.label="'Next'"
          variant="ghost"
          color="neutral"
          size="icon-md"
          class="rounded-full"
          aria-label="Next"
          @click="skip(1)"
        >
          <SkipForward class="fill-current" />
        </Button>
        <Toggle v-model="repeat" size="icon-sm" active-color="primary" aria-label="Repeat">
          <Repeat />
        </Toggle>
      </div>
      <div class="flex items-center gap-3">
        <component :is="volumeIcon" class="size-4 shrink-0 text-muted-foreground" />
        <Slider v-model="volume" size="xs" aria-label="Volume" :aria-valuetext="`${volume}%`" />
      </div>
    </CardContent>
  </ShowcaseCard>
</template>
