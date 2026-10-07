<script setup lang="ts">
import { ref } from "vue";

import { Slider, SliderHandle, SliderRange, SliderThumb, SliderTrack } from "@/ui/slider";

const position = ref(35);
</script>

<template>
  <Slider v-model="position" color="destructive" aria-label="Playback position" class="w-full max-w-sm">
    <SliderTrack class="h-1 transition-[height] group-hover/slider:h-1.5">
      <SliderRange />
    </SliderTrack>
    <SliderThumb>
      <SliderHandle class="scale-0 group-hover/slider:scale-100 group-has-focus-visible/slider:scale-100" />
    </SliderThumb>
  </Slider>
</template>
