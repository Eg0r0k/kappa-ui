<script setup lang="ts">
import { DialogClose, useDialogContext } from "@kappa-ui/core/dialog";
import { ref, watch } from "vue";

import {
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  type AlertDialogSize,
  AlertDialogTitle,
} from "@/ui/alert-dialog";
import { Button, type ButtonColor } from "@/ui/button";
import { Field, FieldError, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { Spinner } from "@/ui/spinner";

const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    label?: string;
    placeholder?: string;
    defaultValue?: string;
    type?: "text" | "email" | "password" | "search" | "tel" | "url";
    action?: string;
    cancel?: string;
    color?: ButtonColor | (string & {});
    size?: AlertDialogSize;
    validate?: (value: string) => string | undefined | Promise<string | undefined>;
    onConfirm?: (value: string) => unknown;
  }>(),
  { defaultValue: "", type: "text", action: "OK", cancel: "Cancel" },
);

const { close, loading } = useDialogContext<string>();
const value = ref(props.defaultValue);
const error = ref<string>();

watch(value, () => {
  error.value = undefined;
});

const submit = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    error.value = (await props.validate?.(value.value)) || undefined;
    if (error.value) return;
    await props.onConfirm?.(value.value);
    close(value.value);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <AlertDialogContent :size="props.size">
    <form class="contents" novalidate @submit.prevent="submit">
      <AlertDialogHeader>
        <AlertDialogTitle>{{ props.title }}</AlertDialogTitle>
        <AlertDialogDescription v-if="props.description">{{ props.description }}</AlertDialogDescription>
      </AlertDialogHeader>
      <Field :invalid="!!error" class="px-6">
        <FieldLabel :class="!props.label && 'sr-only'">{{ props.label ?? props.title }}</FieldLabel>
        <Input v-model="value" :type="props.type" :placeholder="props.placeholder" autocomplete="off" />
        <FieldError v-if="error" :errors="error" />
      </Field>
      <AlertDialogFooter>
        <DialogClose as-child>
          <Button data-slot="alert-dialog-cancel" type="button" variant="outline" color="neutral" :disabled="loading">
            {{ props.cancel }}
          </Button>
        </DialogClose>
        <Button data-slot="alert-dialog-action" type="submit" :color="props.color" :disabled="loading">
          <Spinner v-if="loading" data-icon="inline-start" />
          {{ props.action }}
        </Button>
      </AlertDialogFooter>
    </form>
  </AlertDialogContent>
</template>
