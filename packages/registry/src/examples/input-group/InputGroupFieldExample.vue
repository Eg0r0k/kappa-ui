<script setup lang="ts">
import { CircleCheck } from "@lucide/vue";
import { computed, ref, watch } from "vue";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/ui/input-group";
import { Spinner } from "@/ui/spinner";

const taken = ["admin", "delta", "root"];

const name = ref("delta");
const checking = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

watch(
  name,
  () => {
    checking.value = true;
    clearTimeout(timer);
    timer = setTimeout(() => (checking.value = false), 600);
  },
  { immediate: true },
);

const invalid = computed(() => !checking.value && taken.includes(name.value.trim().toLowerCase()));
</script>

<template>
  <Field :invalid="invalid" class="w-full max-w-sm">
    <FieldLabel>Username</FieldLabel>
    <InputGroup>
      <InputGroupAddon>
        <InputGroupText>delta-ui.dev/</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput v-model="name" autocomplete="off" />
      <InputGroupAddon align="inline-end">
        <Spinner v-if="checking" class="size-4" />
        <CircleCheck v-else-if="!invalid" class="text-success-text" />
      </InputGroupAddon>
    </InputGroup>
    <FieldError v-if="invalid">That name is taken.</FieldError>
    <FieldDescription v-else>Letters, numbers and dashes.</FieldDescription>
  </Field>
</template>
