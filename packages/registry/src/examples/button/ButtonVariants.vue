<script setup lang="ts">
import { Button } from "@/ui/button";

const variants = ["default", "secondary", "destructive", "outline", "ghost", "link"] as const;
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <Button v-for="variant in variants" :key="variant" :variant="variant">
      {{ variant }}
    </Button>
  </div>
</template>
