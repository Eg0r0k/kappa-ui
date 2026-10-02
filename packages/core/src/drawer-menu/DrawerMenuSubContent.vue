<script setup lang="ts">
import { computed, ref, watch } from "vue";

import { injectDrawerMenuContext, injectDrawerMenuSubContext } from "./context";
import DrawerMenuPanel from "./DrawerMenuPanel.vue";

defineOptions({ inheritAttrs: false });

const menu = injectDrawerMenuContext();
const sub = injectDrawerMenuSubContext();

const rendered = ref(sub.open.value);
const active = computed(() => menu.stack.value.at(-1) === sub.entry);

watch(sub.open, (open) => {
  if (open) rendered.value = true;
  else if (!active.value) rendered.value = false;
});

const onHidden = () => {
  if (!sub.open.value) rendered.value = false;
};
</script>

<template>
  <Teleport v-if="menu.outlet.value" :to="menu.outlet.value">
    <DrawerMenuPanel
      v-if="rendered"
      v-bind="$attrs"
      :id="sub.entry.contentId"
      :aria-labelledby="sub.entry.triggerId"
      :active="active"
      @hidden="onHidden"
    >
      <slot />
    </DrawerMenuPanel>
  </Teleport>
</template>
