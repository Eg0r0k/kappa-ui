<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";

import { Button } from "@/ui/button";
import { Spinner } from "@/ui/spinner";

const saving = ref(false);
const saves = ref(0);
let timer: ReturnType<typeof setTimeout> | undefined;

const save = () => {
  saves.value += 1;
  saving.value = true;
  timer = setTimeout(() => (saving.value = false), 2000);
};

onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <div class="flex flex-wrap items-center gap-3">
      <Button :disabled="saving" @click="save">
        <Spinner v-if="saving" />
        {{ saving ? "Saving" : "Save" }}
      </Button>
      <Button variant="outline" color="neutral" :disabled="saving" class="min-w-32" @click="save">
        <Spinner v-if="saving" />
        {{ saving ? "Saving" : "Width held" }}
      </Button>
    </div>
    <p class="text-sm text-muted-foreground">Saves: {{ saves }}</p>
  </div>
</template>
