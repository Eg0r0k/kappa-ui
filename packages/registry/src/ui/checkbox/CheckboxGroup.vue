<script setup lang="ts">
import {
  CheckboxGroupRoot,
  type CheckboxGroupRootEmits,
  type CheckboxGroupRootProps,
  useForwardPropsEmits,
} from "reka-ui";
import { type HTMLAttributes, computed, useAttrs } from "vue";

import { useFieldControl } from "@/lib/field-context";
import { ChoiceGroup, type ChoiceGroupVariants } from "@/ui/choice-group";

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
  <ChoiceGroup as-child :variant="props.variant" :orientation="props.orientation" :class="props.class">
    <CheckboxGroupRoot
      v-bind="forwarded"
      data-slot="checkbox-group"
      :disabled="control.disabled.value"
      :aria-invalid="control.invalid.value"
      :aria-describedby="control.describedBy.value"
    >
      <slot />
    </CheckboxGroupRoot>
  </ChoiceGroup>
</template>
