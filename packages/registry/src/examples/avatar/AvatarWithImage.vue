<script setup lang="ts">
import { Avatar } from "@/ui/avatar";
import { Image, ImageError, ImageLoading } from "@/ui/image";

const commons = "https://upload.wikimedia.org/wikipedia/commons/thumb";
const johnson = "Katherine_Johnson_1983.jpg";
const einstein = "Albert_Einstein_Head.jpg";
const at = (dir: string, file: string, width: 120 | 250, format = "") =>
  `${commons}/${dir}/${file}/${width}px-${file}${format}`;
</script>

<template>
  <div class="flex items-center gap-4">
    <Avatar size="xl">
      <Image
        :src="at('6/6d', johnson, 120)"
        :srcset="`${at('6/6d', johnson, 120)} 1x, ${at('6/6d', johnson, 250)} 2x`"
        :ratio="1"
        alt="Katherine Johnson"
      >
        <ImageLoading />
        <ImageError>KJ</ImageError>
      </Image>
    </Avatar>
    <Avatar size="xl">
      <Image
        :src="at('d/d3', einstein, 120)"
        :sources="[
          {
            srcset: `${at('d/d3', einstein, 120, '.webp')} 1x, ${at('d/d3', einstein, 250, '.webp')} 2x`,
            type: 'image/webp',
          },
        ]"
        :ratio="1"
        alt="Albert Einstein"
      >
        <ImageLoading />
        <ImageError>AE</ImageError>
      </Image>
    </Avatar>
    <Avatar size="xl">
      <Image :src="null" :ratio="1" alt="Kappa Person">
        <ImageError>KP</ImageError>
      </Image>
    </Avatar>
  </div>
</template>
