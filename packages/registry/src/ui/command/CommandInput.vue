<script setup lang="ts">
import { Search } from "@lucide/vue";
import { ListboxFilter, type ListboxFilterProps, useForwardProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { injectCommandContext } from ".";

defineOptions({ inheritAttrs: false });

const props = defineProps<ListboxFilterProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
const forwarded = useForwardProps(delegated);

const { filterState } = injectCommandContext();
</script>

<template>
  <div
    data-slot="command-input-wrapper"
    class="flex h-[calc(var(--menu-item-height)+var(--menu-pad)*2)] shrink-0 items-center gap-(--menu-item-gap) border-b border-border px-[calc(var(--menu-pad)+var(--menu-item-px))] text-muted-foreground icon-size-(--menu-icon)"
  >
    <Search class="shrink-0" />
    <ListboxFilter
      v-bind="{ ...forwarded, ...$attrs }"
      v-model="filterState.search"
      data-slot="command-input"
      :class="
        cn(
          `
            h-full w-full min-w-0 bg-transparent text-foreground outline-none
            placeholder:text-muted-foreground
            disabled:cursor-not-allowed disabled:text-foreground/(--disabled-opacity)
            max-md:text-body-lg
          `,
          props.class,
        )
      "
    />
  </div>
</template>
