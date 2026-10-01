<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import { DialogRoot } from "reka-ui";
import { computed, ref } from "vue";

import { type DrawerRootEmits, type DrawerRootProps, provideDrawerRootContext } from "./context";

const props = withDefaults(defineProps<DrawerRootProps>(), {
  side: "bottom",
  dismissible: true,
  handleOnly: false,
  open: undefined,
  defaultOpen: undefined,
  modal: undefined,
  unmountOnHide: undefined,
});
const emits = defineEmits<DrawerRootEmits>();

const open = useVModel(props, "open", emits, {
  defaultValue: props.defaultOpen ?? false,
  passive: (props.open === undefined) as false,
});

const size = ref(0);
const movement = ref(0);

provideDrawerRootContext({
  side: computed(() => props.side),
  dismissible: computed(() => props.dismissible),
  handleOnly: computed(() => props.handleOnly),
  open: computed(() => open.value === true),
  size,
  movement,
  progress: computed(() => (size.value > 0 ? Math.min(1, Math.max(0, movement.value / size.value)) : 0)),
  swiping: ref(false),
  dragged: ref(false),
  keyboardInset: ref(0),
  snapOffset: ref(0),
  overlayOpacity: ref(1),
  setOpen: (value) => {
    open.value = value;
  },
});
</script>

<template>
  <DialogRoot
    v-slot="slotProps"
    :open="open === true"
    :modal="props.modal"
    :unmount-on-hide="props.unmountOnHide"
    @update:open="open = $event"
  >
    <slot v-bind="slotProps" />
  </DialogRoot>
</template>
