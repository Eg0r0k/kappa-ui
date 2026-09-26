<script setup lang="ts">
import { ref } from "vue";

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

const attempts = ref(0);
</script>

<template>
  <Dialog @update:open="(open) => open && (attempts = 0)">
    <DialogTrigger as-child>
      <Button variant="outline" color="neutral">Start upload</Button>
    </DialogTrigger>
    <DialogContent
      :show-close-button="false"
      @escape-key-down.prevent="attempts += 1"
      @pointer-down-outside="attempts += 1"
      @interact-outside.prevent
    >
      <DialogHeader>
        <DialogTitle>Uploading 3 files</DialogTitle>
        <DialogDescription>Keep this window open until the upload finishes.</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <p class="text-body-md text-muted-foreground" aria-live="polite">
          {{ attempts ? `Escape and outside clicks are ignored (${attempts}).` : "Try Escape or clicking outside." }}
        </p>
      </DialogBody>
      <DialogFooter>
        <DialogClose as-child>
          <Button>Done</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
