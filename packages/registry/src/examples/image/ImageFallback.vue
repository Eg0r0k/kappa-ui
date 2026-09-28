<script setup lang="ts">
import { ImageOff } from "@lucide/vue";

import { Image, ImageError } from "@/ui/image";

const missing =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Kappa_ui_missing_photo.jpg/330px-Kappa_ui_missing_photo.jpg";
</script>

<template>
  <div class="grid w-full max-w-sm grid-cols-2 gap-4">
    <Image :src="missing" :ratio="4 / 3" alt="A photo that no longer exists" class="rounded-md bg-muted">
      <ImageError />
    </Image>
    <Image :src="null" :ratio="4 / 3" alt="Product photo" class="rounded-md bg-muted">
      <ImageError class="flex flex-col items-center justify-center gap-2 text-body-sm">
        <ImageOff class="size-5" />
        No photo yet
      </ImageError>
    </Image>
  </div>
</template>
