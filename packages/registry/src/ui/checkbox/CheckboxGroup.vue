<script setup lang="ts">
import {
  CheckboxGroupRoot,
  type CheckboxGroupRootEmits,
  type CheckboxGroupRootProps,
  useForwardPropsEmits,
} from "reka-ui";
import { type HTMLAttributes, computed, useAttrs } from "vue";

import { cn } from "@/lib/utils";
import { type ChoiceGroupVariants, choiceGroupVariants } from ".";
import { useFieldControl } from "@/lib/field-context";

const props = withDefaults(
  defineProps<
    CheckboxGroupRootProps & {
      variant?: ChoiceGroupVariants["variant"];
      class?: HTMLAttributes["class"];
    }
  >(),
  { rovingFocus: false },
);
const emits = defineEmits<CheckboxGroupRootEmits>();

const delegated = computed(() => {
  const { class: _, variant: __, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);

const control = useFieldControl(props, useAttrs());
</script>

<template>
  <CheckboxGroupRoot
    v-bind="forwarded"
    data-slot="checkbox-group"
    :disabled="control.disabled.value"
    :aria-invalid="control.invalid.value"
    :aria-describedby="control.describedBy.value"
    :data-variant="props.variant ?? 'default'"
    :data-orientation="props.orientation ?? 'vertical'"
    :class="cn(choiceGroupVariants({ variant: props.variant, orientation: props.orientation }), props.class)"
  >
    <slot />
  </CheckboxGroupRoot>
</template>
