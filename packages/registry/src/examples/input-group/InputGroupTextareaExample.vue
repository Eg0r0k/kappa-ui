<script setup lang="ts">
import { ArrowUp, Paperclip } from "@lucide/vue";
import { computed, ref } from "vue";

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupTextarea } from "@/ui/input-group";

const message = ref("");
const left = computed(() => 280 - message.value.length);
</script>

<template>
  <InputGroup class="max-w-md">
    <InputGroupTextarea v-model="message" autoresize :rows="2" :maxrows="8" placeholder="Ask, search or chat…" aria-label="Message" />
    <InputGroupAddon align="block-end">
      <InputGroupButton size="icon-sm" aria-label="Attach a file">
        <Paperclip />
      </InputGroupButton>
      <InputGroupText class="ms-auto tabular-nums">{{ left }} left</InputGroupText>
      <InputGroupButton size="icon-sm" variant="solid" color="primary" aria-label="Send" :disabled="!message">
        <ArrowUp />
      </InputGroupButton>
    </InputGroupAddon>
  </InputGroup>
</template>
