<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { Textarea } from "@/ui/textarea";
import { injectInputGroupContext } from ".";

defineOptions({ inheritAttrs: false });

const props = defineProps<{ class?: HTMLAttributes["class"] }>();

const model = defineModel<string>();
const group = injectInputGroupContext();
</script>

<template>
  <Textarea
    v-bind="$attrs"
    v-model="model"
    data-slot="input-group-control"
    variant="ghost"
    :size="group.size.value"
    :class="
      cn(
        'flex-1 resize-none rounded-none border-0 bg-transparent hover:bg-transparent focus-visible:bg-transparent focus-visible:inset-ring-0 aria-invalid:focus-visible:inset-ring-0 user-invalid:focus-visible:inset-ring-0',
        props.class,
      )
    "
  />
</template>
