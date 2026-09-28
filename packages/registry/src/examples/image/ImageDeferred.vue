<script setup lang="ts">
import { ImageOff, RotateCcw } from "@lucide/vue";
import { onBeforeUnmount, ref } from "vue";

import { Button } from "@/ui/button";
import { Image, ImageError, ImageLoading } from "@/ui/image";

const url =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Coccinella_in_Parc_du_Bois-de-Coulonge_uncut_version.jpg/500px-Coccinella_in_Parc_du_Bois-de-Coulonge_uncut_version.jpg";
const photo = ref<string | null | undefined>(url);
let attempt = 0;
let timer: ReturnType<typeof setTimeout> | undefined;

const fetchPhoto = (found: boolean) => {
  clearTimeout(timer);
  photo.value = undefined;
  timer = setTimeout(() => {
    attempt++;
    photo.value = found ? `${url}?attempt=${attempt}` : null;
  }, 3000);
};

onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
  <div class="flex w-full max-w-xs flex-col items-start gap-4">
    <Image :src="photo" :ratio="4 / 3" alt="A ladybird opening its wings on a flower bud" class="rounded-md bg-muted">
      <ImageLoading />
      <ImageError class="flex flex-col items-center justify-center gap-2 text-body-sm">
        <ImageOff class="size-5" />
        No photo
      </ImageError>
    </Image>
    <div class="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" @click="fetchPhoto(true)">
        <RotateCcw data-icon="inline-start" />
        Fetch
      </Button>
      <Button variant="outline" size="sm" @click="fetchPhoto(false)">Fetch, no photo</Button>
    </div>
  </div>
</template>
