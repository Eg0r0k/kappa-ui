<script setup lang="ts">
import { Check, Copy, Eye, EyeOff, Search, X } from "@lucide/vue";
import { ref } from "vue";

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/ui/input-group";

const link = "https://kappa-ui.pages.dev/r/input-group.json";
const copied = ref(false);
const password = ref("correct horse battery");
const visible = ref(false);
const query = ref("button group");

const copy = async () => {
  await navigator.clipboard?.writeText(link);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
};
</script>

<template>
  <div class="flex w-full max-w-sm flex-col gap-4">
    <InputGroup>
      <InputGroupInput :default-value="link" readonly aria-label="Registry link" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton size="icon-xs" :aria-label="copied ? 'Copied' : 'Copy link'" @click="copy">
          <Check v-if="copied" />
          <Copy v-else />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
    <InputGroup>
      <InputGroupInput v-model="password" :type="visible ? 'text' : 'password'" aria-label="Password" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          :aria-label="visible ? 'Hide password' : 'Show password'"
          :aria-pressed="visible"
          @click="visible = !visible"
        >
          <EyeOff v-if="visible" />
          <Eye v-else />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
    <InputGroup>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput v-model="query" aria-label="Search" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton v-if="query" size="icon-xs" aria-label="Clear" @click="query = ''">
          <X />
        </InputGroupButton>
        <InputGroupButton variant="soft" color="primary">Search</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  </div>
</template>
