<script setup lang="ts">
import { HoverCardRoot } from "reka-ui";
import { computed, nextTick, onScopeDispose, reactive, ref, watch } from "vue";

import {
  type HoverCardReason,
  type HoverCardRootEmits,
  type HoverCardRootProps,
  hoverCardDefaults,
  provideHoverCardController,
} from "./context";

const props = withDefaults(defineProps<HoverCardRootProps>(), {
  open: undefined,
  defaultOpen: false,
  disabled: undefined,
});
const emit = defineEmits<HoverCardRootEmits>();

defineSlots<{ default?: (props: { open: boolean }) => unknown }>();

const settings = reactive({
  openDelay: computed(() => props.openDelay ?? hoverCardDefaults.openDelay),
  closeDelay: computed(() => props.closeDelay ?? hoverCardDefaults.closeDelay),
  restThreshold: computed(() => props.restThreshold ?? hoverCardDefaults.restThreshold),
  touch: computed(() => props.touch ?? hoverCardDefaults.touch),
  touchDelay: computed(() => props.touchDelay ?? hoverCardDefaults.touchDelay),
  disabled: computed(() => props.disabled ?? hoverCardDefaults.disabled),
});

const local = ref(props.defaultOpen);
const requested = computed(() => props.open ?? local.value);
const open = computed(() => requested.value && !settings.disabled);
const touch = ref(false);
const closedBy = ref<HoverCardReason>();

type Pending = { reason: HoverCardReason; event?: Event };
let pendingOpen: Pending | undefined;
let pendingClose: Pending | undefined;
let emitted: boolean | undefined;
let scrolling = false;

const change = (value: boolean, reason: HoverCardReason, event?: Event) => {
  local.value = value;
  emitted = value;
  emit("update:open", value, { reason, event });
  nextTick(() => {
    emitted = undefined;
  });
};

const accept = (reason: HoverCardReason, event: Event | undefined, byTouch: boolean) => {
  if (settings.disabled || requested.value || emitted === true) return;
  pendingClose = undefined;
  touch.value = byTouch;
  change(true, reason, event);
};

const request = (reason: HoverCardReason, event?: Event) => {
  pendingOpen = { reason, event };
};

const cancel = () => {
  pendingOpen = undefined;
};

const expectClose = (reason: HoverCardReason, event?: Event) => {
  pendingClose = { reason, event };
};

const show = (reason: HoverCardReason, event?: Event) => accept(reason, event, true);

const hide = (reason: HoverCardReason, event?: Event) => {
  if (!requested.value || emitted === false) return;
  closedBy.value = reason;
  change(false, reason, event);
};

const onRekaOpen = (value: boolean) => {
  if (value) {
    if (!pendingOpen) return;
    const { reason, event } = pendingOpen;
    pendingOpen = undefined;
    accept(reason, event, false);
    return;
  }
  if (touch.value) return;
  const expected = pendingClose;
  pendingClose = undefined;
  if (expected) hide(expected.reason, expected.event);
  else hide(scrolling ? "scroll" : "trigger-hover");
};

watch(
  () => props.open,
  (value) => {
    if (value && emitted !== true) touch.value = false;
  },
);

watch(
  () => settings.disabled,
  (disabled) => {
    if (disabled) hide("disabled");
  },
);

if (typeof window !== "undefined") {
  // Registered in setup so it runs before the capture listener Reka's content adds on mount.
  const onScroll = () => {
    scrolling = true;
    queueMicrotask(() => {
      scrolling = false;
    });
  };
  window.addEventListener("scroll", onScroll, { capture: true });
  onScopeDispose(() => window.removeEventListener("scroll", onScroll, { capture: true }));
}

provideHoverCardController({ open, touch, settings, closedBy, request, cancel, expectClose, show, hide });
</script>

<template>
  <HoverCardRoot
    :open="open"
    :open-delay="settings.openDelay"
    :close-delay="settings.closeDelay"
    :enable-touch="false"
    @update:open="onRekaOpen"
  >
    <slot :open="open" />
  </HoverCardRoot>
</template>
