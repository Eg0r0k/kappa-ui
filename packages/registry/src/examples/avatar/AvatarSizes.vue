<script setup lang="ts">
import { Avatar, AvatarFallback } from "@/ui/avatar";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <div class="flex items-center gap-4">
    <Avatar v-for="size in sizes" :key="size" :size="size">
      <AvatarFallback>KP</AvatarFallback>
    </Avatar>
  </div>
</template>
