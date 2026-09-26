<script setup lang="ts">
import { ArrowRight, Mail } from "@lucide/vue";

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, type InputGroupSize } from "@/ui/input-group";

const sizes: InputGroupSize[] = ["xs", "sm", "md", "lg", "xl"];
</script>

<template>
  <div class="flex w-full max-w-sm flex-col gap-4">
    <InputGroup v-for="size in sizes" :key="size" :size="size">
      <InputGroupAddon>
        <Mail />
      </InputGroupAddon>
      <InputGroupInput :placeholder="`Email, ${size}`" :aria-label="`Email, ${size}`" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton :size="size === 'xs' ? 'icon-xs' : 'icon-sm'" aria-label="Subscribe">
          <ArrowRight />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  </div>
</template>
