<script setup lang="ts">
import { Field, FieldDescription, FieldError } from "@/ui/field";
import { Input } from "@/ui/input";

const variants = ["outline", "soft", "filled", "ghost", "subtle"] as const;
</script>

<template>
  <div class="grid w-full max-w-3xl gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
    <div v-for="variant in variants" :key="variant" class="flex flex-col gap-5">
      <p class="text-label-lg capitalize text-muted-foreground">{{ variant }}</p>
      <Input :variant="variant" label="Full name" autocomplete="name" />
      <Field required>
        <Input :variant="variant" label="Email" type="email" autocomplete="email" default-value="ada@example.com" />
        <FieldDescription>Receipts go here.</FieldDescription>
      </Field>
      <Field invalid>
        <Input :variant="variant" label="Username" default-value="ada lovelace" />
        <FieldError errors="Letters, digits and hyphens only." />
      </Field>
      <Input :variant="variant" label="Start date" type="date" />
    </div>
  </div>
</template>
