<script setup lang="ts">
import {
  ListboxContent,
  ListboxRoot,
  type ListboxRootEmits,
  type ListboxRootProps,
  useForwardPropsEmits,
} from "reka-ui";
import { type HTMLAttributes, computed, useAttrs } from "vue";

import { useFieldControl } from "@/lib/field-context";
import { cn } from "@/lib/utils";
import { type ListboxSize, type ListboxVariants, listboxVariants } from ".";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    ListboxRootProps & {
      id?: string;
      variant?: ListboxVariants["variant"];
      size?: ListboxSize;
      class?: HTMLAttributes["class"];
    }
  >(),
  { size: "md" },
);
const emits = defineEmits<ListboxRootEmits>();

const delegated = computed(() => {
  const { class: _, variant: __, size: ___, id: ____, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);

const attrs = useAttrs();
const control = useFieldControl(props, attrs);
</script>

<template>
  <ListboxRoot
    v-bind="forwarded"
    data-slot="listbox-root"
    class="contents"
    :disabled="control.disabled.value"
    :required="control.required.value"
  >
    <ListboxContent
      v-bind="attrs"
      data-slot="listbox"
      :data-variant="props.variant ?? 'outline'"
      :data-size="props.size"
      :data-disabled="control.disabled.value || undefined"
      :id="control.id.value"
      :aria-labelledby="control.labelledBy.value"
      :aria-describedby="control.describedBy.value"
      :aria-invalid="control.invalid.value"
      :aria-required="control.required.value || undefined"
      :class="cn(listboxVariants({ variant: props.variant, size: props.size }), props.class)"
    >
      <slot />
    </ListboxContent>
  </ListboxRoot>
</template>
