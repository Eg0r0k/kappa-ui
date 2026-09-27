<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

import DialogEntryRoot from "./DialogEntryRoot.vue";
import { useDialogStore } from "./manager";

const store = useDialogStore();
const host = Symbol("DialogHost");

onMounted(() => store.register(host));
onUnmounted(() => store.unregister(host));
</script>

<template>
  <template v-if="store.renders(host)">
    <DialogEntryRoot v-for="entry in store.entries" :key="entry.id" :entry="entry" :store="store" />
  </template>
</template>
