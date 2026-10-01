<script setup lang="ts" generic="T extends AcceptableInputValue = string">
import {
  type AcceptableInputValue,
  TagsInputRoot,
  type TagsInputRootEmits,
  type TagsInputRootProps,
  useForwardPropsEmits,
} from "reka-ui";
import { type HTMLAttributes, computed, useAttrs } from "vue";

import { useFieldControl } from "@/lib/field-context";
import { cn } from "@/lib/utils";
import type { TextControlSize, TextControlVariant } from "@/ui/input";
import { provideTagsInputContext, tagsInputVariants } from ".";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    TagsInputRootProps<T> & {
      variant?: TextControlVariant;
      size?: TextControlSize;
      class?: HTMLAttributes["class"];
    }
  >(),
  { variant: "outline", size: "md" },
);
const emits = defineEmits<TagsInputRootEmits<T>>();

const attrs = useAttrs();
const control = useFieldControl(props, attrs);

const delegated = computed(() => {
  const { class: _, variant: __, size: ___, id: ____, disabled: _____, required: ______, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);

const inputOwned = ["aria-invalid", "aria-describedby"];
const rootAttrs = computed(() =>
  Object.fromEntries(Object.entries(attrs).filter(([key]) => !inputOwned.includes(key))),
);

provideTagsInputContext(
  computed(() => ({
    variant: props.variant,
    size: props.size,
    invalid: control.invalid.value,
    required: control.required.value,
    describedBy: control.describedBy.value,
  })),
);
</script>

<template>
  <TagsInputRoot
    v-bind="{ ...rootAttrs, ...forwarded }"
    data-slot="tags-input"
    :data-variant="props.variant"
    :data-size="props.size"
    :id="control.id.value"
    :disabled="control.disabled.value"
    :required="control.required.value"
    :class="cn(tagsInputVariants({ variant: props.variant, size: props.size }), props.class)"
  >
    <template #default="{ modelValue }">
      <slot :model-value="modelValue" />
    </template>
  </TagsInputRoot>
</template>
