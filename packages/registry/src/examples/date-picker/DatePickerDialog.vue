<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import type { DateValue } from "reka-ui";
import { ref, shallowRef } from "vue";

import { Button } from "@/ui/button";
import { DatePicker } from "@/ui/date-picker";
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
import { Field, FieldLabel } from "@/ui/field";

const open = ref(false);
const date = shallowRef<DateValue | undefined>(new CalendarDate(2026, 10, 8));
const saved = ref<string>();

const save = () => {
  saved.value = `Moved to ${date.value?.toString()}.`;
  open.value = false;
};
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <Dialog v-model:open="open">
      <DialogTrigger as-child>
        <Button variant="outline" color="neutral">Reschedule</Button>
      </DialogTrigger>
      <DialogContent class="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Reschedule the review</DialogTitle>
          <DialogDescription>Everyone invited gets the new date.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Field>
            <FieldLabel>New date</FieldLabel>
            <DatePicker v-model="date" locale="en-US" />
          </Field>
        </DialogBody>
        <DialogFooter>
          <DialogClose as-child>
            <Button variant="ghost" color="neutral">Cancel</Button>
          </DialogClose>
          <Button :disabled="!date" @click="save">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <p class="text-body-sm text-muted-foreground" aria-live="polite">{{ saved }}</p>
  </div>
</template>
