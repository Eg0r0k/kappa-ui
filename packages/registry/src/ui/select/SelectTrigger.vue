<script setup lang="ts">
import { SelectIcon, SelectTrigger, type SelectTriggerProps } from "@delta-ui/core/select";
import { useForwardProps } from "@delta-ui/core/utils";
import { ChevronDown } from "@lucide/vue";
import { type HTMLAttributes, computed, useAttrs } from "vue";

import { useFieldControl } from "@/lib/field-context";
import { cn } from "@/lib/utils";
import { type SelectTriggerVariants, selectTriggerVariants } from ".";

const props = defineProps<
  SelectTriggerProps & {
    id?: string;
    variant?: SelectTriggerVariants["variant"];
    size?: SelectTriggerVariants["size"];
    class?: HTMLAttributes["class"];
  }
>();

const delegated = computed(() => {
  const { class: _, variant: __, size: ___, id: ____, ...rest } = props;
  return rest;
});
const forwarded = useForwardProps(delegated);

const control = useFieldControl(props, useAttrs());
</script>

<template>
  <SelectTrigger
    v-bind="forwarded"
    data-slot="select-trigger"
    :data-variant="props.variant ?? 'outline'"
    :id="control.id.value"
    :disabled="control.disabled.value"
    :aria-invalid="control.invalid.value"
    :aria-describedby="control.describedBy.value"
    :class="cn(selectTriggerVariants({ variant: props.variant, size: props.size }), props.class)"
  >
    <slot />
    <SelectIcon as-child>
      <ChevronDown class="text-muted-foreground transition-[rotate] duration-short-4 ease-standard group-data-[state=open]/select-trigger:rotate-180 group-disabled/select-trigger:text-foreground/(--disabled-opacity) motion-reduce:transition-none" />
    </SelectIcon>
  </SelectTrigger>
</template>
