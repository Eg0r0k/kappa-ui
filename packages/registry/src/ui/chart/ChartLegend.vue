<script setup lang="ts">
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { chartItemColor, useChart } from ".";

const props = defineProps<{ hideIcon?: boolean; toggle?: boolean; class?: HTMLAttributes["class"] }>();

const { config, isHidden, toggle: toggleSeries } = useChart();

const items = computed(() =>
  Object.entries(config.value).map(([key, item]) => ({
    key,
    item,
    label: item.label ?? key,
    color: chartItemColor(item),
    hidden: isHidden(key),
  })),
);
</script>

<template>
  <div
    data-slot="chart-legend"
    :class="cn('flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-3 text-body-sm', props.class)"
  >
    <component
      :is="props.toggle ? 'button' : 'div'"
      v-for="entry in items"
      :key="entry.key"
      data-slot="chart-legend-item"
      :data-state="entry.hidden ? 'hidden' : 'visible'"
      :type="props.toggle ? 'button' : undefined"
      :aria-pressed="props.toggle ? !entry.hidden : undefined"
      :class="
        cn(
          `
            group/legend-item flex items-center gap-1.5
            data-[state=hidden]:text-muted-foreground
            [&>svg]:size-3 [&>svg]:text-muted-foreground
          `,
          props.toggle && 'focus-ring cursor-pointer rounded-control-xs',
        )
      "
      @click="props.toggle && toggleSeries(entry.key)"
    >
      <component :is="entry.item.icon" v-if="entry.item.icon && !props.hideIcon" />
      <span
        v-else-if="!props.hideIcon"
        data-slot="chart-legend-swatch"
        class="size-2 shrink-0 rounded-xs bg-(--chart-swatch) ring-1 ring-(--chart-swatch) ring-inset group-data-[state=hidden]/legend-item:bg-transparent"
        :style="{ '--chart-swatch': entry.color }"
      />
      <span>
        <component :is="entry.label" v-if="typeof entry.label !== 'string'" />
        <template v-else>{{ entry.label }}</template>
      </span>
    </component>
  </div>
</template>
