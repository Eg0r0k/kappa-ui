<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  type DialogRootProps,
  DialogTitle,
  DialogTrigger,
} from "@delta-ui/core/dialog";
import { injectOverlayPortalTarget } from "@delta-ui/core/overlay";
import { useForwardPropsEmits } from "@delta-ui/core/utils";
import { VisuallyHidden } from "@delta-ui/core/visually-hidden";
import { X } from "@lucide/vue";
import { type HTMLAttributes, type VNode, computed, defineComponent, h, useSlots } from "vue";

import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { ScrollArea } from "@/ui/scroll-area";
import DialogBody from "./DialogBody.vue";
import DialogFooter from "./DialogFooter.vue";
import DialogHeader from "./DialogHeader.vue";
import DialogTriggerPart from "./DialogTrigger.vue";

const props = withDefaults(
  defineProps<
    DialogRootProps & {
      title?: string;
      description?: string;
      close?: boolean;
      dismissible?: boolean;
      overlay?: boolean;
      fullscreen?: boolean;
      scrollable?: boolean;
      class?: HTMLAttributes["class"];
    }
  >(),
  { modal: true, close: true, dismissible: true, overlay: true },
);
const emits = defineEmits<{ "update:open": [value: boolean]; "close:prevent": [] }>();
const slots = useSlots();

const rootProps = computed(() => ({
  open: props.open,
  defaultOpen: props.defaultOpen,
  modal: props.modal,
  unmountOnHide: props.unmountOnHide,
}));
const forwarded = useForwardPropsEmits(rootProps, emits);

const portalTarget = injectOverlayPortalTarget(null);

const containsTrigger = (nodes: VNode[]): boolean =>
  nodes.some(
    (node) => node.type === DialogTriggerPart || (Array.isArray(node.children) && containsTrigger(node.children as VNode[])),
  );

const Trigger = defineComponent({
  props: { open: Boolean },
  setup: (triggerProps) => () => {
    const nodes = slots.default?.({ open: triggerProps.open }) ?? [];
    return containsTrigger(nodes) ? nodes : h(DialogTrigger, { asChild: true }, () => nodes);
  },
});

const hasTitle = computed(() => Boolean(props.title || slots.title));
const hasDescription = computed(() => Boolean(props.description || slots.description));
const hasHeader = computed(
  () => Boolean(slots.header || slots.actions) || hasTitle.value || hasDescription.value || props.close,
);

const preventClose = (event: Event) => {
  event.preventDefault();
  emits("close:prevent");
};

const onEscapeKeyDown = (event: KeyboardEvent) => {
  if (!props.dismissible) preventClose(event);
};

const onPointerDownOutside = (event: CustomEvent<{ originalEvent: PointerEvent }>) => {
  const target = event.detail.originalEvent.target;
  if (target instanceof Element && target.closest("[data-slot=scroll-area-bar]")) return event.preventDefault();
  if (!props.dismissible) preventClose(event);
};

const onFocusOutside = (event: Event) => {
  if (!props.dismissible) event.preventDefault();
};
</script>

<template>
  <DialogRoot v-slot="{ open, close }" v-bind="forwarded">
    <Trigger v-if="slots.default" :open="open" />

    <DialogPortal :to="portalTarget ?? undefined">
      <component
        :is="props.modal ? DialogOverlay : 'div'"
        data-slot="dialog-overlay"
        :data-transparent="!props.overlay || !props.modal || undefined"
        :class="
          cn(
            'fixed inset-0 z-50 bg-black/40 animate-overlay [--overlay-scale:1] data-transparent:bg-transparent',
            !props.modal && 'pointer-events-none',
            !props.scrollable && 'flex items-center justify-center',
            !props.scrollable && !props.fullscreen && 'p-4 sm:p-8',
          )
        "
      >
        <component
          :is="props.scrollable ? ScrollArea : 'div'"
          :class="
            props.scrollable
              ? 'size-full [&_[data-slot=scroll-area-content]]:flex [&_[data-slot=scroll-area-content]]:flex-col'
              : 'contents'
          "
        >
          <div
            :class="
              props.scrollable
                ? cn('flex flex-1 items-center justify-center', !props.fullscreen && 'p-4 sm:py-8')
                : 'contents'
            "
          >
            <DialogContent
              data-slot="dialog"
              :class="
                cn(
                  'pointer-events-auto relative flex w-full flex-col rounded-2xl border bg-popover text-popover-foreground shadow-xl outline-none animate-overlay',
                  props.fullscreen ? 'min-h-full max-w-none rounded-none border-0' : 'max-w-lg',
                  props.fullscreen && !props.scrollable && 'h-full',
                  !props.scrollable && 'max-h-full overflow-hidden',
                  props.class,
                )
              "
              @escape-key-down="onEscapeKeyDown"
              @pointer-down-outside="onPointerDownOutside"
              @focus-outside="onFocusOutside"
            >
              <VisuallyHidden v-if="!slots.content && (!hasTitle || !hasDescription)">
                <DialogTitle v-if="!hasTitle" />
                <DialogDescription v-if="!hasDescription" />
              </VisuallyHidden>

              <slot name="content" :close="close">
                <DialogHeader v-if="hasHeader">
                  <slot name="header" :close="close">
                    <div class="flex min-w-0 flex-1 flex-col gap-1.5">
                      <DialogTitle v-if="hasTitle" data-slot="dialog-title" class="text-title-lg">
                        <slot name="title">{{ props.title }}</slot>
                      </DialogTitle>
                      <DialogDescription
                        v-if="hasDescription"
                        data-slot="dialog-description"
                        class="text-body-md text-muted-foreground"
                      >
                        <slot name="description">{{ props.description }}</slot>
                      </DialogDescription>
                    </div>
                    <slot name="actions" />
                    <DialogClose v-if="props.close || slots.close" as-child>
                      <slot name="close">
                        <Button
                          variant="ghost"
                          color="neutral"
                          size="icon-sm"
                          aria-label="Close"
                          data-slot="dialog-close"
                          class="-me-2 -mt-1 shrink-0"
                        >
                          <X />
                        </Button>
                      </slot>
                    </DialogClose>
                  </slot>
                </DialogHeader>

                <DialogBody v-if="slots.body" :class="cn(!hasHeader && 'pt-6', !slots.footer && 'pb-6')">
                  <slot name="body" :close="close" />
                </DialogBody>

                <DialogFooter v-if="slots.footer">
                  <slot name="footer" :close="close" />
                </DialogFooter>
              </slot>
            </DialogContent>
          </div>
        </component>
      </component>
    </DialogPortal>
  </DialogRoot>
</template>
