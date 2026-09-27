<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import {
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  useDialogContext,
} from "@/ui/dialog";
import { Field, FieldLabel } from "@/ui/field";
import { Textarea } from "@/ui/textarea";

const { close } = useDialogContext<string>();
const draft = ref("");

const send = () => {
  const text = draft.value.trim();
  if (!text) return;
  draft.value = "";
  close(text);
};
</script>

<template>
  <DialogContent>
    <form class="contents" @submit.prevent="send">
      <DialogHeader>
        <DialogTitle>Send feedback</DialogTitle>
        <DialogDescription>Close the window and come back: the draft stays until you send it.</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <Field>
          <FieldLabel>Feedback</FieldLabel>
          <Textarea v-model="draft" :rows="4" />
        </Field>
      </DialogBody>
      <DialogFooter>
        <Button type="submit" :disabled="!draft.trim()">Send</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</template>
