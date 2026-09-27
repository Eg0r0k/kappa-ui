<script setup lang="ts">
import { Separator, type SeparatorProps } from "@kappa-ui/core/separator";
import { type HTMLAttributes, computed, useSlots } from "vue";

import { cn } from "@/lib/utils";
import { type SeparatorVariants, separatorVariants } from ".";

const props = withDefaults(
  defineProps<
    SeparatorProps & {
      label?: string;
      size?: SeparatorVariants["size"];
      class?: HTMLAttributes["class"];
    }
  >(),
  { orientation: "horizontal", decorative: true },
);

const slots = useSlots();

const delegated = computed(() => {
  const { class: _, label: __, size: ___, ...rest } = props;
  return rest;
});

const labelled = () => Boolean(props.label || slots.default);

const line =
  "bg-border group-data-[orientation=horizontal]/separator:h-(--separator-size) group-data-[orientation=vertical]/separator:w-(--separator-size)";
</script>

<template>
  <Separator
    v-bind="delegated"
    data-slot="separator"
    :class="
      cn(
        separatorVariants({ size: props.size }),
        labelled()
          ? 'flex items-center gap-3 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:flex-col'
          : 'bg-border data-[orientation=horizontal]:h-(--separator-size) data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-(--separator-size)',
        props.class,
      )
    "
  >
    <template v-if="labelled()">
      <span data-slot="separator-line" :class="cn(line, 'flex-1')" />
      <span data-slot="separator-label" class="shrink-0 text-label-md text-muted-foreground">
        <slot>{{ props.label }}</slot>
      </span>
      <span data-slot="separator-line" :class="cn(line, 'flex-1')" />
    </template>
  </Separator>
</template>
