<script setup lang="ts">
import { ref } from "vue";

import { Listbox, ListboxItem } from "@/ui/listbox";

const toppings = ["Mozzarella", "Basil", "Mushrooms", "Olives", "Pepperoni", "Jalapeños"];
const chosen = ref(["Mozzarella", "Basil"]);
</script>

<template>
  <div class="flex w-56 flex-col gap-2">
    <Listbox v-model="chosen" multiple aria-label="Toppings">
      <ListboxItem v-for="item in toppings" :key="item" :value="item">{{ item }}</ListboxItem>
    </Listbox>
    <p class="text-body-sm text-muted-foreground">{{ chosen.length }} of {{ toppings.length }} chosen</p>
  </div>
</template>
