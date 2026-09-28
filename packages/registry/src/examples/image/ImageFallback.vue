<script setup lang="ts">
import { ImageOff } from "@lucide/vue";

import { Image, ImageError } from "@/ui/image";
</script>

<template>
  <div class="grid w-full max-w-sm grid-cols-2 gap-4">
    <Image src="/missing-photo.jpg" :ratio="4 / 3" alt="A photo that no longer exists" class="rounded-md">
      <ImageError />
    </Image>
    <Image :ratio="4 / 3" alt="Product photo" class="rounded-md">
      <ImageError class="flex flex-col items-center justify-center gap-2 text-body-sm">
        <ImageOff class="size-5" />
        No photo yet
      </ImageError>
    </Image>
  </div>
</template>
