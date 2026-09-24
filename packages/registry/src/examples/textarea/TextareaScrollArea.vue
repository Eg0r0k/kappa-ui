<script setup lang="ts">
import { ref } from "vue";

import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { ScrollArea } from "@/ui/scroll-area";
import { Textarea } from "@/ui/textarea";

const notes = ref(
  Array.from({ length: 14 }, (_, index) => `${index + 1}. Fixed a layout shift in the settings dialog.`).join("\n"),
);
</script>

<template>
  <Field class="w-full max-w-sm">
    <FieldLabel>Release notes</FieldLabel>
    <ScrollArea
      class="h-44 cursor-text rounded-lg border border-input transition-[border-color,box-shadow] duration-short-3 ease-standard has-focus-visible:border-primary has-focus-visible:inset-ring has-focus-visible:inset-ring-primary has-aria-invalid:border-destructive [&_[data-slot=scroll-area-content]]:flex [&_[data-slot=scroll-area-content]]:flex-col [&_[data-slot=scroll-area-viewport]]:scroll-py-2"
    >
      <Textarea v-model="notes" autoresize class="grow rounded-none border-0 focus-visible:inset-ring-0" />
    </ScrollArea>
    <FieldDescription>The textarea grows with its text and the scroll area scrolls it.</FieldDescription>
  </Field>
</template>
