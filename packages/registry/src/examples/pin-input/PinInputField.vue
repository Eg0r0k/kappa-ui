<script setup lang="ts">
import { computed, ref } from "vue";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import { PinInput, PinInputGroup, PinInputSlot } from "@/ui/pin-input";

const code = ref<string[]>([]);
const touched = ref(false);
const incomplete = computed(() => code.value.filter(Boolean).length < 4);
</script>

<template>
  <Field :invalid="touched && incomplete" required class="w-fit">
    <FieldLabel>Verification code</FieldLabel>
    <PinInput v-model="code" @complete="touched = true" @blur="touched = true">
      <PinInputGroup>
        <PinInputSlot v-for="index in [0, 1, 2, 3]" :key="index" :index="index" />
      </PinInputGroup>
    </PinInput>
    <FieldDescription>Four digits from the authenticator app.</FieldDescription>
    <FieldError v-if="touched && incomplete" errors="Enter all four digits." />
  </Field>
</template>
