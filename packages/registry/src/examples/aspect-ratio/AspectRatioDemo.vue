<script setup lang="ts">
import { AspectRatio } from "@/ui/aspect-ratio";

const commons = "https://upload.wikimedia.org/wikipedia/commons/thumb";

const photos = [
  {
    ratio: 16 / 9,
    label: "16 / 9",
    src: `${commons}/e/e8/Parc_national_de_la_Jacques-Cartier%2C_Quebec%2C_Canada_22.jpg/500px-Parc_national_de_la_Jacques-Cartier%2C_Quebec%2C_Canada_22.jpg`,
    alt: "A river running over stones below a forested mountain",
  },
  {
    ratio: 1,
    label: "1 / 1",
    src: `${commons}/2/29/Coccinella_in_Parc_du_Bois-de-Coulonge_uncut_version.jpg/500px-Coccinella_in_Parc_du_Bois-de-Coulonge_uncut_version.jpg`,
    alt: "A ladybird opening its wings on a flower bud",
  },
  {
    ratio: 3 / 4,
    label: "3 / 4",
    src: `${commons}/9/94/Igreja_de_Nossa_Senhora_do_Monte_do_Carmo%2C_Rio_de_Janeiro%2C_Brasil.jpg/500px-Igreja_de_Nossa_Senhora_do_Monte_do_Carmo%2C_Rio_de_Janeiro%2C_Brasil.jpg`,
    alt: "The gilded nave of a baroque church",
  },
];
</script>

<template>
  <div class="grid w-full max-w-lg grid-cols-3 items-start gap-4">
    <figure v-for="photo in photos" :key="photo.label" class="flex flex-col gap-2">
      <AspectRatio :ratio="photo.ratio" class="overflow-hidden rounded-lg bg-muted">
        <img :src="photo.src" :alt="photo.alt" loading="lazy" decoding="async" class="size-full object-cover" />
      </AspectRatio>
      <figcaption class="text-body-sm text-muted-foreground">{{ photo.label }}</figcaption>
    </figure>
  </div>
</template>
