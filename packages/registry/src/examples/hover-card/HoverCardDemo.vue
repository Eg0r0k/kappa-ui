<script setup lang="ts">
import { CalendarDays } from "@lucide/vue";

import { Button } from "@/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/ui/hover-card";
import { Image, ImageError } from "@/ui/image";
</script>

<template>
  <HoverCard>
    <HoverCardTrigger as-child>
      <Button variant="link">@kappa-ui</Button>
    </HoverCardTrigger>
    <HoverCardContent class="w-80">
      <div class="flex gap-4">
        <Image :src="null" :ratio="1" alt="kappa-ui" class="size-12 shrink-0 rounded-full bg-muted">
          <ImageError class="text-label-md">K</ImageError>
        </Image>
        <div class="flex flex-col gap-1">
          <h4 class="text-title-sm">@kappa-ui</h4>
          <p class="text-body-md">Vue components you copy into your project, built on Reka UI and Tailwind.</p>
          <div class="flex items-center gap-2 pt-1 text-body-sm text-muted-foreground">
            <CalendarDays class="size-4" />
            Joined September 2026
          </div>
        </div>
      </div>
    </HoverCardContent>
  </HoverCard>
</template>
