<script setup lang="ts">
import { Listbox, ListboxItem } from "@/ui/listbox";
</script>

<template>
  <div class="flex flex-wrap gap-6">
    <Listbox default-value="standard" aria-label="Shipping" class="w-48">
      <ListboxItem value="standard">Standard</ListboxItem>
      <ListboxItem value="express">Express</ListboxItem>
      <ListboxItem value="same-day" disabled>Same day</ListboxItem>
    </Listbox>
    <Listbox default-value="standard" disabled aria-label="Shipping, disabled" class="w-48">
      <ListboxItem value="standard">Standard</ListboxItem>
      <ListboxItem value="express">Express</ListboxItem>
      <ListboxItem value="same-day">Same day</ListboxItem>
    </Listbox>
  </div>
</template>
