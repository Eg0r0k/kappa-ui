<script setup lang="ts">
import { shallowRef } from "vue";

import { Field, FieldDescription, FieldError } from "@/ui/field";
import { InputFloating } from "@/ui/input-floating";

const username = shallowRef("ada lovelace");
const allowed = (value: string) => /^[a-z0-9-]+$/i.test(value);
</script>

<template>
  <div class="flex w-full max-w-xs flex-col gap-5">
    <InputFloating label="Full name" autocomplete="name" />
    <Field required>
      <InputFloating label="Email" type="email" autocomplete="email" default-value="ada@example.com" />
      <FieldDescription>Receipts go here.</FieldDescription>
    </Field>
    <Field :invalid="!allowed(username)">
      <InputFloating v-model="username" label="Username" />
      <FieldError v-if="!allowed(username)" errors="Letters, digits and hyphens only." />
    </Field>
  </div>
</template>
