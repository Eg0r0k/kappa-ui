<script setup lang="ts">
import { Search } from "@lucide/vue";

import { InputGroup, InputGroupAddon, InputGroupInput, type InputGroupVariant } from "@/ui/input-group";

const variants: InputGroupVariant[] = ["outline", "soft", "filled", "ghost", "subtle"];
</script>

<template>
  <div class="flex w-full max-w-sm flex-col gap-4">
    <InputGroup v-for="variant in variants" :key="variant" :variant="variant">
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput :placeholder="variant" :aria-label="`Search, ${variant}`" />
    </InputGroup>
  </div>
</template>
