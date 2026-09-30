<script setup lang="ts">
import { User } from "@lucide/vue";

import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";

const ada =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Ada_Lovelace_portrait.jpg/120px-Ada_Lovelace_portrait.jpg";
</script>

<template>
  <div class="flex items-center gap-4">
    <Avatar>
      <AvatarImage :src="ada" alt="Ada Lovelace" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>KP</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback><User aria-hidden="true" /></AvatarFallback>
    </Avatar>
  </div>
</template>
