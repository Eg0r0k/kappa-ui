<script setup lang="ts">
import { Search } from "@lucide/vue";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/ui/input-group";
import { Kbd } from "@/ui/kbd";
</script>

<template>
  <InputGroup class="max-w-sm">
    <InputGroupInput placeholder="Search documentation" aria-label="Search documentation" />
    <InputGroupAddon>
      <Search />
    </InputGroupAddon>
    <InputGroupAddon align="inline-end">
      <Kbd>⌘K</Kbd>
    </InputGroupAddon>
  </InputGroup>
</template>
