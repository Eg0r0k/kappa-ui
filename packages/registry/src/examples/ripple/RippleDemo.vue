<script setup lang="ts">
import vRipple from "@/lib/ripple";
import { Button } from "@/ui/button";
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <Button v-ripple>Press near an edge</Button>
    <Button v-ripple variant="outline" size="xl">More travel</Button>
    <Button v-ripple="{ color: 'red', opacity: 0.3 }" variant="ghost">Tinted</Button>
    <Button v-ripple="false" variant="outline">Off</Button>
  </div>
</template>
