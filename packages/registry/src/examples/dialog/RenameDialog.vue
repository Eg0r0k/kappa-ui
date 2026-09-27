<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle, useDialogContext } from "@/ui/dialog";
import { Field, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { Spinner } from "@/ui/spinner";

const props = defineProps<{ name: string }>();

const { close, dismiss, loading } = useDialogContext<string>();
const draft = ref(props.name);

const save = async () => {
  loading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1500));
  close(draft.value.trim() || props.name);
};
</script>

<template>
  <DialogContent class="max-w-sm">
    <form class="contents" @submit.prevent="save">
      <DialogHeader>
        <DialogTitle>Rename project</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Field>
          <FieldLabel>Name</FieldLabel>
          <Input v-model="draft" />
        </Field>
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="outline" color="neutral" :disabled="loading" @click="dismiss()">Cancel</Button>
        <Button type="submit" :disabled="loading">
          <Spinner v-if="loading" />
          {{ loading ? "Saving" : "Save" }}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</template>
