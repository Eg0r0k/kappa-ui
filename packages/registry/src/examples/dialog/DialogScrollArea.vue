<script setup lang="ts">
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
import { ScrollArea } from "@/ui/scroll-area";

const members = Array.from({ length: 40 }, (_, index) => `Member ${index + 1}`);
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="outline" color="neutral">Show members</Button>
    </DialogTrigger>
    <DialogContent class="h-screen">
      <DialogHeader>
        <DialogTitle>Members</DialogTitle>
        <DialogDescription>Everyone with access to this project.</DialogDescription>
      </DialogHeader>
      <ScrollArea class="min-h-0 flex-1">
        <ul class="flex flex-col gap-2 px-6 text-body-md">
          <li v-for="member in members" :key="member">{{ member }}</li>
        </ul>
      </ScrollArea>
      <DialogFooter>
        <DialogClose as-child>
          <Button>Done</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
