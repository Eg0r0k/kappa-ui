<script setup lang="ts">
import { Search } from "@lucide/vue";

import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/ui/input-group";
import { Kbd } from "@/ui/kbd";
</script>

<template>
  <Empty class="w-full max-w-xl">
    <EmptyHeader>
      <EmptyTitle>404, page not found</EmptyTitle>
      <EmptyDescription>The page you are looking for does not exist. Try searching for what you need.</EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <InputGroup class="w-full">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search pages" aria-label="Search pages" />
        <InputGroupAddon align="inline-end">
          <Kbd>/</Kbd>
        </InputGroupAddon>
      </InputGroup>
      <EmptyDescription>Need help? <a href="#">Contact support</a></EmptyDescription>
    </EmptyContent>
  </Empty>
</template>
