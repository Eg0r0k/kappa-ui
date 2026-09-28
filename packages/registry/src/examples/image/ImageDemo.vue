<script setup lang="ts">
import { Image } from "@/ui/image";

const base =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Parc_national_de_la_Jacques-Cartier%2C_Quebec%2C_Canada_22.jpg";
const file = "Parc_national_de_la_Jacques-Cartier%2C_Quebec%2C_Canada_22.jpg";
const at = (width: number) => `${base}/${width}px-${file}`;
</script>

<template>
  <Image
    :src="at(500)"
    :srcset="`${at(330)} 330w, ${at(500)} 500w, ${at(960)} 960w`"
    sizes="(min-width: 640px) 28rem, 100vw"
    :width="960"
    :height="640"
    alt="A river running over stones below a forested mountain"
    class="max-w-md rounded-lg"
  />
</template>
