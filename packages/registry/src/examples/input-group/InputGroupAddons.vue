<script setup lang="ts">
import { AtSign, Mail } from "@lucide/vue";

import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/ui/input-group";
</script>

<template>
  <div class="flex w-full max-w-sm flex-col gap-4">
    <InputGroup>
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="example" aria-label="Website" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>.com</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
    <InputGroup>
      <InputGroupAddon>
        <InputGroupText>$</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput inputmode="decimal" placeholder="0.00" aria-label="Amount" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>USD</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
    <InputGroup>
      <InputGroupAddon>
        <AtSign />
      </InputGroupAddon>
      <InputGroupInput placeholder="username" aria-label="Username" />
      <InputGroupAddon align="inline-end">
        <Mail />
      </InputGroupAddon>
    </InputGroup>
  </div>
</template>
