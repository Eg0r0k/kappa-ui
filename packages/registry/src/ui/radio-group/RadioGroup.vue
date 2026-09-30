<script setup lang="ts">
import { RadioGroupRoot, type RadioGroupRootEmits, type RadioGroupRootProps, useForwardPropsEmits } from "reka-ui";
import { type HTMLAttributes, computed, useAttrs } from "vue";

import { useFieldControl } from "@/lib/field-context";
import { ChoiceGroup, type ChoiceGroupVariants } from "@/ui/choice-group";

const props = defineProps<
  RadioGroupRootProps & {
    variant?: ChoiceGroupVariants["variant"];
    class?: HTMLAttributes["class"];
  }
>();
const emits = defineEmits<RadioGroupRootEmits>();

const delegated = computed(() => {
  const { class: _, variant: __, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);

const control = useFieldControl(props, useAttrs());
</script>

<template>
  <ChoiceGroup as-child :variant="props.variant" :orientation="props.orientation" :class="props.class">
    <RadioGroupRoot
      v-bind="forwarded"
      data-slot="radio-group"
      :disabled="control.disabled.value"
      :required="control.required.value"
      :aria-invalid="control.invalid.value"
      :aria-describedby="control.describedBy.value"
    >
      <slot />
    </RadioGroupRoot>
  </ChoiceGroup>
</template>
