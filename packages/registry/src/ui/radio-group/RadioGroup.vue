<script setup lang="ts">
import { RadioGroupRoot, type RadioGroupRootEmits, type RadioGroupRootProps } from "@kappa-ui/core/radio-group";
import { useForwardPropsEmits } from "@kappa-ui/core/utils";
import { type HTMLAttributes, computed, useAttrs } from "vue";

import { type ChoiceGroupVariants, choiceGroupVariants } from "@/ui/checkbox";
import { useFieldControl } from "@/lib/field-context";
import { cn } from "@/lib/utils";

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
  <RadioGroupRoot
    v-bind="forwarded"
    data-slot="radio-group"
    :disabled="control.disabled.value"
    :required="control.required.value"
    :aria-invalid="control.invalid.value"
    :aria-describedby="control.describedBy.value"
    :data-variant="props.variant ?? 'default'"
    :data-orientation="props.orientation ?? 'vertical'"
    :class="cn(choiceGroupVariants({ variant: props.variant, orientation: props.orientation }), props.class)"
  >
    <slot />
  </RadioGroupRoot>
</template>
