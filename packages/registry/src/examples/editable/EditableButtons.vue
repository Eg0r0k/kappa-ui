<script setup lang="ts">
import { Check, Pencil, X } from "@lucide/vue";

import { Button } from "@/ui/button";
import { Editable, EditableArea, EditableInput, EditablePreview } from "@/ui/editable";
</script>

<template>
  <Editable
    v-slot="{ isEditing, edit, submit, cancel }"
    default-value="Design review"
    activation-mode="none"
    submit-mode="enter"
    class="text-title-md"
  >
    <EditableArea>
      <EditablePreview />
      <EditableInput aria-label="Meeting name" />
    </EditableArea>
    <Button v-if="!isEditing" variant="ghost" color="neutral" size="icon-xs" aria-label="Rename" @click="edit">
      <Pencil />
    </Button>
    <template v-else>
      <Button variant="ghost" color="neutral" size="icon-xs" aria-label="Save" @click="submit">
        <Check />
      </Button>
      <Button variant="ghost" color="neutral" size="icon-xs" aria-label="Cancel" @click="cancel">
        <X />
      </Button>
    </template>
  </Editable>
</template>
