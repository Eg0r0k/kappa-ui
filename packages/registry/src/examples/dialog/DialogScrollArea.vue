<script setup lang="ts">
import { Button } from "@/ui/button";
import { Dialog } from "@/ui/dialog";

const sections = Array.from({ length: 12 }, (_, index) => index + 1);
</script>

<template>
  <Dialog title="Terms of service" description="Last updated on 1 September 2026.">
    <Button variant="outline" color="neutral">Read the terms</Button>

    <template #body>
      <div class="flex flex-col gap-4 text-body-md">
        <section v-for="section in sections" :key="section" class="flex flex-col gap-1">
          <h3 class="text-title-sm">{{ section }}. Section {{ section }}</h3>
          <p class="text-muted-foreground">
            The service is provided as is. You keep the rights to what you upload, and you give us the licence we
            need to store it, back it up and show it to the people you share it with.
          </p>
        </section>
      </div>
    </template>

    <template #footer="{ close }">
      <Button variant="outline" color="neutral" @click="close">Decline</Button>
      <Button @click="close">Accept</Button>
    </template>
  </Dialog>
</template>
