<script setup lang="ts">
import { Image } from "@/ui/image";

const src =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Igreja_de_Nossa_Senhora_do_Monte_do_Carmo%2C_Rio_de_Janeiro%2C_Brasil.jpg/330px-Igreja_de_Nossa_Senhora_do_Monte_do_Carmo%2C_Rio_de_Janeiro%2C_Brasil.jpg";

const fits = [
  { label: "cover", fit: "cover", position: undefined },
  { label: "contain", fit: "contain", position: undefined },
  { label: "cover, top", fit: "cover", position: "50% 0%" },
] as const;
</script>

<template>
  <div class="grid w-full max-w-lg grid-cols-3 items-start gap-4">
    <figure v-for="item in fits" :key="item.label" class="flex flex-col gap-2">
      <Image
        :src="src"
        :ratio="1"
        :fit="item.fit"
        :position="item.position"
        alt="The gilded nave of a baroque church"
        class="rounded-md bg-muted"
      />
      <figcaption class="text-body-sm text-muted-foreground">{{ item.label }}</figcaption>
    </figure>
  </div>
</template>
