<script setup lang="ts">
import { TooltipProvider, TooltipRoot } from "reka-ui";
import { computed, nextTick, reactive, ref, toRef, watch } from "vue";

import {
  type TooltipReason,
  type TooltipRootEmits,
  type TooltipRootProps,
  injectTooltipSettings,
  provideTooltipController,
  resolveTouch,
  tooltipDefaults,
} from "./context";

const props = withDefaults(defineProps<TooltipRootProps>(), {
  open: undefined,
  defaultOpen: false,
  role: "description",
  hoverable: undefined,
  closeOnClick: undefined,
  disabled: undefined,
});
const emit = defineEmits<TooltipRootEmits>();

defineSlots<{ default?: (props: { open: boolean }) => unknown }>();

const provider = injectTooltipSettings(null);
const group = provider ?? tooltipDefaults;

const settings = reactive({
  delay: computed(() => props.delay ?? group.delay),
  restThreshold: computed(() => props.restThreshold ?? group.restThreshold),
  touch: computed(() => resolveTouch(props.touch ?? group.touch)),
  touchDelay: computed(() => props.touchDelay ?? group.touchDelay),
  touchHideDelay: computed(() => props.touchHideDelay ?? group.touchHideDelay),
  hoverable: computed(() => props.hoverable ?? group.hoverable),
  closeOnClick: computed(() => props.closeOnClick ?? group.closeOnClick),
  disabled: computed(() => props.disabled ?? group.disabled),
});

const local = ref(props.defaultOpen);
const requested = computed(() => props.open ?? local.value);
const open = computed(() => requested.value && !settings.disabled);

const closedBy = ref<TooltipReason>();
const touch = ref(false);
const instant = ref(false);
const forced = ref(0);
let opening = false;
let emitted: boolean | undefined;
let pending: { reason: TooltipReason; event?: Event; touch: boolean } = { reason: "trigger-hover", touch: false };

const change = (value: boolean, reason: TooltipReason, event?: Event) => {
  local.value = value;
  emitted = value;
  emit("update:open", value, { reason, event });
  nextTick(() => {
    opening = false;
    emitted = undefined;
  });
};

const request = (reason: TooltipReason, event?: Event, byTouch = false) => {
  pending = { reason, event, touch: byTouch };
};

const show = () => {
  if (settings.disabled || requested.value || emitted === true) return;
  touch.value = pending.touch;
  instant.value = false;
  opening = true;
  change(true, pending.reason, pending.event);
};

const hide = (reason: TooltipReason, event?: Event) => {
  if (!requested.value || emitted === false) return;
  closedBy.value = reason;
  instant.value = reason === "sibling-open";
  change(false, reason, event);
};

const onRekaOpen = (value: boolean) => {
  if (value) show();
  else hide("trigger-hover");
};

watch(
  () => props.open,
  (value) => {
    if (!value || emitted === true) return;
    touch.value = false;
    instant.value = false;
    forced.value += 1;
  },
);

watch(
  () => settings.disabled,
  (disabled) => {
    if (disabled) hide("disabled");
  },
);

const rekaProps = computed(() => ({
  open: open.value,
  delayDuration: settings.delay,
  disableHoverableContent: !settings.hoverable,
  disableClosingTrigger: !settings.closeOnClick,
  // Only switches off Reka's trigger listeners: TooltipTrigger binds its own.
  disabled: true,
}));

provideTooltipController({
  open,
  settings,
  role: toRef(props, "role"),
  closedBy,
  touch,
  instant,
  forced,
  isOpening: () => opening,
  request,
  hide,
});
</script>

<template>
  <TooltipRoot v-if="provider" v-bind="rekaProps" @update:open="onRekaOpen">
    <slot :open="open" />
  </TooltipRoot>
  <TooltipProvider v-else :skip-delay-duration="tooltipDefaults.skipDelay">
    <TooltipRoot v-bind="rekaProps" @update:open="onRekaOpen">
      <slot :open="open" />
    </TooltipRoot>
  </TooltipProvider>
</template>
