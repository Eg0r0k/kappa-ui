<script setup lang="ts">
import { Search } from "@lucide/vue";

import { Button } from "@/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/ui/button-group";
import { Input } from "@/ui/input";
</script>

<template>
  <div class="grid w-full max-w-sm gap-4">
    <ButtonGroup class="w-full">
      <ButtonGroupText>https://</ButtonGroupText>
      <Input placeholder="example.com" aria-label="Website" />
    </ButtonGroup>
    <ButtonGroup class="w-full">
      <Input placeholder="Search files" aria-label="Search files" />
      <Button variant="outline" color="neutral" size="icon" aria-label="Search"><Search /></Button>
    </ButtonGroup>
  </div>
</template>
