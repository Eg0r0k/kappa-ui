<script setup lang="ts">
import { DialogRoot } from "reka-ui";
import { nextTick, onErrorCaptured } from "vue";

import DialogEntryScope from "./DialogEntryScope.vue";
import type { DialogEntry, DialogStore } from "./manager";

const props = defineProps<{ entry: DialogEntry; store: DialogStore }>();

const onUpdateOpen = (open: boolean) => {
  if (!open) props.store.requestClose(props.entry);
};

onErrorCaptured(() => {
  nextTick(() => props.store.fail(props.entry));
});
</script>

<template>
  <component
    :is="props.entry.root ?? DialogRoot"
    v-bind="props.entry.rootProps"
    :open="props.entry.isOpen"
    :unmount-on-hide="!props.entry.keepMounted"
    @update:open="onUpdateOpen"
  >
    <DialogEntryScope :entry="props.entry" :store="props.store">
      <component :is="props.entry.component" v-bind="props.entry.props" />
    </DialogEntryScope>
  </component>
</template>
