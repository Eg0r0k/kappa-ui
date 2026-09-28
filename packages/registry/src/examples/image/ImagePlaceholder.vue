<script setup lang="ts">
import { RotateCcw } from "@lucide/vue";
import { computed, ref } from "vue";

import { Button } from "@/ui/button";
import { Image, ImageLoading } from "@/ui/image";
import { Skeleton } from "@/ui/skeleton";

const base =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Coccinella_in_Parc_du_Bois-de-Coulonge_uncut_version.jpg";
const file = "Coccinella_in_Parc_du_Bois-de-Coulonge_uncut_version.jpg";
const attempt = ref(0);
const src = computed(() => `${base}/960px-${file}${attempt.value ? `?attempt=${attempt.value}` : ""}`);
const thumb = `${base}/250px-${file}`;
const alt = "A ladybird opening its wings on a flower bud";
</script>

<template>
  <div class="flex w-full max-w-lg flex-col items-start gap-4">
    <div class="grid w-full grid-cols-3 gap-4">
      <Image :src="src" :ratio="4 / 3" :alt="alt" class="rounded-md">
        <ImageLoading />
      </Image>
      <Image :src="src" :ratio="4 / 3" :alt="alt" class="rounded-md">
        <ImageLoading>
          <Skeleton class="size-full rounded-none" />
        </ImageLoading>
      </Image>
      <Image :src="src" :ratio="4 / 3" :alt="alt" class="rounded-md">
        <ImageLoading class="bg-transparent">
          <img :src="thumb" alt="" class="size-full scale-110 object-cover blur-lg" />
        </ImageLoading>
      </Image>
    </div>
    <Button variant="outline" size="sm" @click="attempt++">
      <RotateCcw data-icon="inline-start" />
      Reload
    </Button>
  </div>
</template>
