<script setup lang="ts">
import { injectDialogRootContext } from "reka-ui";

import { provideDialogEntry } from "./entry";
import type { DialogEntry, DialogStore } from "./manager";

const props = defineProps<{ entry: DialogEntry; store: DialogStore }>();

provideDialogEntry({ entry: props.entry, store: props.store, root: injectDialogRootContext(null) });
</script>

<template>
  <slot />
</template>
