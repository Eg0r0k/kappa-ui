<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { Dialog } from "@/ui/dialog";

const actions = {
  stop: { title: "Stop sharing?", description: "People with the link lose access at once.", color: "destructive" },
  share: { title: "Share again?", description: "The old link starts working again.", color: "primary" },
} as const;

const shared = ref(true);
const action = ref<keyof typeof actions>("stop");
</script>

<template>
  <Dialog title="Share project" description="Invite people to work on this project.">
    <Button variant="outline" color="neutral">Share</Button>

    <template #body>
      <p class="text-body-md text-muted-foreground" aria-live="polite">
        {{ shared ? "Anyone with the link can view the project." : "Sharing is off. Only members can view the project." }}
      </p>
    </template>

    <template #footer="{ close }">
      <Dialog :title="actions[action].title" :description="actions[action].description" class="max-w-sm">
        <Button variant="outline" :color="shared ? 'destructive' : 'neutral'" @click="action = shared ? 'stop' : 'share'">
          {{ shared ? "Stop sharing" : "Share again" }}
        </Button>

        <template #footer="{ close: closeInner }">
          <Button variant="outline" color="neutral" @click="closeInner">Cancel</Button>
          <Button
            :color="actions[action].color"
            @click="
              shared = action === 'share';
              closeInner();
            "
          >
            Confirm
          </Button>
        </template>
      </Dialog>
      <Button @click="close">Done</Button>
    </template>
  </Dialog>
</template>
