<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from "vue";

import { Button } from "@/ui/button";
import { ScrollArea, type ScrollAreaApi } from "@/ui/scroll-area";

type Message = { id: number; text: string };

const message = (id: number): Message => ({ id, text: `Message ${id}` });

const messages = ref(Array.from({ length: 30 }, (_, index) => message(index + 171)));
const area = shallowRef<ScrollAreaApi | null>(null);

const virtualize = {
  estimateSize: 32,
  getItemKey: (index: number) => messages.value[index]?.id ?? index,
  anchorTo: "end",
  followOnAppend: "smooth",
} as const;

const firstId = computed(() => messages.value[0]?.id ?? 1);

const loadOlder = () => {
  const first = firstId.value;
  messages.value = [...Array.from({ length: 10 }, (_, index) => message(first - 10 + index)), ...messages.value];
};

const receive = () => {
  const last = messages.value[messages.value.length - 1]?.id ?? 0;
  messages.value = [...messages.value, message(last + 1)];
};

onMounted(() => area.value?.setScrollPositionSilently("vertical", Number.MAX_SAFE_INTEGER));
</script>

<template>
  <div class="grid w-full max-w-sm gap-3">
    <div class="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" color="neutral" :disabled="firstId <= 1" @click="loadOlder">
        Load older
      </Button>
      <Button size="sm" variant="outline" color="neutral" @click="receive">New message</Button>
    </div>
    <ScrollArea
      ref="area"
      :virtualize="virtualize"
      :items="messages"
      class="h-64 rounded-lg border border-border"
      v-slot="{ item }"
    >
      <div class="px-4 text-body-md leading-8">{{ item.text }}</div>
    </ScrollArea>
  </div>
</template>
