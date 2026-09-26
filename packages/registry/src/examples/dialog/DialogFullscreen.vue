<script setup lang="ts">
import { Button } from "@/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/dialog";
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="outline" color="neutral">Open fullscreen</Button>
    </DialogTrigger>
    <DialogContent class="inset-0 size-full max-h-none max-w-none translate-none rounded-none border-0">
      <DialogHeader>
        <DialogTitle>Compose</DialogTitle>
        <DialogDescription>Write a new message.</DialogDescription>
      </DialogHeader>
      <DialogBody class="flex-1">
        <p class="text-body-md text-muted-foreground">The dialog fills the window, which suits editors and phones.</p>
      </DialogBody>
      <DialogFooter>
        <DialogClose as-child>
          <Button>Send</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
