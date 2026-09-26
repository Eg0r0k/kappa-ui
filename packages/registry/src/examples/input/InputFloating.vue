<script setup lang="ts">
import { reactive } from "vue";

import { Field, FieldDescription, FieldError } from "@/ui/field";
import { Input } from "@/ui/input";

const variants = ["outline", "soft", "filled", "ghost", "subtle"] as const;

const columns = reactive(variants.map((variant) => ({ variant, username: "ada lovelace" })));
const allowed = (username: string) => /^[a-z0-9-]+$/i.test(username);
</script>

<template>
  <div class="grid w-full max-w-3xl gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
    <div v-for="column in columns" :key="column.variant" class="flex flex-col gap-5">
      <p class="text-label-lg capitalize text-muted-foreground">{{ column.variant }}</p>
      <Input :variant="column.variant" label="Full name" autocomplete="name" />
      <Field required>
        <Input :variant="column.variant" label="Email" type="email" autocomplete="email" default-value="ada@example.com" />
        <FieldDescription>Receipts go here.</FieldDescription>
      </Field>
      <Field :invalid="!allowed(column.username)">
        <Input v-model="column.username" :variant="column.variant" label="Username" />
        <FieldError v-if="!allowed(column.username)" errors="Letters, digits and hyphens only." />
      </Field>
      <Input :variant="column.variant" label="Start date" type="date" />
    </div>
  </div>
</template>
