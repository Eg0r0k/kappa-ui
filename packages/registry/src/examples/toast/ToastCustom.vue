<script setup lang="ts">
import { Button } from "@/ui/button";
import { ToastAction, ToastClose, ToastDescription, ToastTitle, Toaster, useToast } from "@/ui/toast";

const toast = useToast();

const invite = () =>
  toast.add({
    group: "invites",
    title: "Grace Hopper",
    description: "invited you to Compiler notes",
    duration: 10_000,
    data: { initials: "GH" },
  });
</script>

<template>
  <Button variant="outline" color="neutral" @click="invite">Show invitation</Button>
  <Toaster group="invites" position="bottom-start">
    <template #toast="{ toast: item }">
      <div class="flex items-start gap-3">
        <span
          class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-label-md text-primary"
          aria-hidden="true"
        >
          {{ item.data?.initials }}
        </span>
        <div class="flex min-w-0 flex-1 flex-col gap-2">
          <div class="flex flex-col gap-0.5">
            <ToastTitle>{{ item.title }}</ToastTitle>
            <ToastDescription>{{ item.description }}</ToastDescription>
          </div>
          <div class="flex gap-2">
            <ToastAction alt-text="Open the invitation from your inbox" variant="solid" color="primary">
              Accept
            </ToastAction>
            <ToastAction alt-text="Decline it from your inbox">Decline</ToastAction>
          </div>
        </div>
        <ToastClose class="-mt-1.5 -mb-1 -me-1.5" />
      </div>
    </template>
  </Toaster>
</template>
