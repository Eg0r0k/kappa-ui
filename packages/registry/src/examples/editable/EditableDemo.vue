<script setup lang="ts">
import { Editable, EditableArea, EditableInput, EditablePreview } from "@/ui/editable";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <Editable default-value="Q4 roadmap" placeholder="Untitled" class="text-headline-sm font-semibold" v-bind="$attrs">
    <EditableArea>
      <EditablePreview />
      <EditableInput />
    </EditableArea>
  </Editable>
</template>
