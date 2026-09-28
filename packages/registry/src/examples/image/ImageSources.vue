<script setup lang="ts">
import { Image } from "@/ui/image";

const base =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Parc_national_de_la_Jacques-Cartier%2C_Quebec%2C_Canada_22.jpg";
const file = "Parc_national_de_la_Jacques-Cartier%2C_Quebec%2C_Canada_22.jpg";
</script>

<template>
  <Image
    :src="`${base}/500px-${file}`"
    :sources="[{ srcset: `${base}/500px-${file}.webp`, type: 'image/webp' }]"
    :width="960"
    :height="640"
    alt="A river running over stones below a forested mountain"
    class="w-full max-w-md rounded-lg"
  />
</template>
