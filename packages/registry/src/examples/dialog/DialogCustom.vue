<script setup lang="ts">
import { Trash2 } from "@lucide/vue";

import { Button } from "@/ui/button";
import {
  Dialog,
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
      <Button variant="outline" color="destructive">Delete project</Button>
    </DialogTrigger>
    <DialogContent class="max-w-sm" :show-close-button="false">
      <DialogHeader class="items-center pt-2 text-center">
        <span class="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <Trash2 class="size-6" />
        </span>
        <DialogTitle>Delete this project?</DialogTitle>
        <DialogDescription>The project and its 42 files are removed for everyone. This cannot be undone.</DialogDescription>
      </DialogHeader>
      <DialogFooter class="sm:justify-center">
        <DialogClose as-child>
          <Button variant="outline" color="neutral">Keep it</Button>
        </DialogClose>
        <DialogClose as-child>
          <Button color="destructive">Delete</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
