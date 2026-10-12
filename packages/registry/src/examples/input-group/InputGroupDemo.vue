<script setup lang="ts">
import { Search } from "@lucide/vue";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/ui/input-group";
import { Kbd } from "@/ui/kbd";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <InputGroup class="max-w-sm" v-bind="$attrs">
    <InputGroupInput placeholder="Search documentation" aria-label="Search documentation" />
    <InputGroupAddon>
      <Search />
    </InputGroupAddon>
    <InputGroupAddon align="inline-end">
      <Kbd>⌘K</Kbd>
    </InputGroupAddon>
  </InputGroup>
</template>
