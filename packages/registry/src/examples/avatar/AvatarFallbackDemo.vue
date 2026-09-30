<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";

const curie =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Marie_Curie_c1920.jpg/120px-Marie_Curie_c1920.jpg";
const hopper = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Grace_Hopper.jpg/120px-Grace_Hopper.jpg";
const broken = "data:image/png;base64,AAAA";
</script>

<template>
  <div class="flex items-center gap-4">
    <Avatar size="lg">
      <AvatarImage :src="broken" alt="Kappa Person" />
      <AvatarFallback>KP</AvatarFallback>
    </Avatar>
    <Avatar size="lg">
      <AvatarImage :src="curie" alt="Marie Curie" />
      <AvatarFallback :delay-ms="600">MC</AvatarFallback>
    </Avatar>
    <Avatar size="lg" class="rounded-lg">
      <AvatarImage :src="hopper" alt="Grace Hopper" />
      <AvatarFallback>GH</AvatarFallback>
    </Avatar>
  </div>
</template>
