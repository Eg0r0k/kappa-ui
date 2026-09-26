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

const actions = {
  stop: { title: "Stop sharing?", description: "People with the link lose access at once.", color: "destructive" },
  share: { title: "Share again?", description: "The old link starts working again.", color: "primary" },
} as const;

const shared = ref(true);
const action = ref<keyof typeof actions>("stop");
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="outline" color="neutral">Share</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Share project</DialogTitle>
        <DialogDescription>Invite people to work on this project.</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <p class="text-body-md text-muted-foreground" aria-live="polite">
          {{ shared ? "Anyone with the link can view the project." : "Sharing is off. Only members can view the project." }}
        </p>
      </DialogBody>
      <DialogFooter>
        <Dialog>
          <DialogTrigger as-child>
            <Button
              variant="outline"
              :color="shared ? 'destructive' : 'neutral'"
              @click="action = shared ? 'stop' : 'share'"
            >
              {{ shared ? "Stop sharing" : "Share again" }}
            </Button>
          </DialogTrigger>
          <DialogContent class="max-w-sm">
            <DialogHeader>
              <DialogTitle>{{ actions[action].title }}</DialogTitle>
              <DialogDescription>{{ actions[action].description }}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose as-child>
                <Button variant="outline" color="neutral">Cancel</Button>
              </DialogClose>
              <DialogClose as-child>
                <Button :color="actions[action].color" @click="shared = action === 'share'">Confirm</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <DialogClose as-child>
          <Button>Done</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
