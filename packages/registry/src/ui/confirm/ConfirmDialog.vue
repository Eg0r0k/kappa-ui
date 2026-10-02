<script setup lang="ts">
import { useDialogContext } from "@kappa-ui/core/dialog";

import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  type AlertDialogSize,
  AlertDialogTitle,
} from "@/ui/alert-dialog";
import { Button, type ButtonColor } from "@/ui/button";
import { Spinner } from "@/ui/spinner";

const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    action?: string;
    cancel?: string;
    color?: ButtonColor | (string & {});
    size?: AlertDialogSize;
    onConfirm?: () => unknown;
  }>(),
  { action: "OK" },
);

const { close, loading } = useDialogContext();

const accept = async () => {
  loading.value = true;
  try {
    await props.onConfirm?.();
    close();
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <AlertDialogContent :size="props.size">
    <AlertDialogHeader>
      <AlertDialogTitle>{{ props.title }}</AlertDialogTitle>
      <AlertDialogDescription v-if="props.description">{{ props.description }}</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel v-if="props.cancel" :disabled="loading">{{ props.cancel }}</AlertDialogCancel>
      <Button data-slot="alert-dialog-action" :color="props.color" :disabled="loading" @click="accept">
        <Spinner v-if="loading" data-icon="inline-start" />
        {{ props.action }}
      </Button>
    </AlertDialogFooter>
  </AlertDialogContent>
</template>
