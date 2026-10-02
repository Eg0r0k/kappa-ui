<script setup lang="ts">
import {
  Combobox,
  ComboboxAnchor,
  ComboboxCancel,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxViewport,
} from "@/ui/combobox";
import type { TextControlSize } from "@/ui/input";

const sizes: TextControlSize[] = ["xs", "sm", "md", "lg", "xl"];
const languages = ["English", "Deutsch", "Suomi"];
</script>

<template>
  <div class="flex w-full max-w-xs flex-col gap-3">
    <Combobox v-for="size in sizes" :key="size" default-value="English">
      <ComboboxAnchor :size="size">
        <ComboboxInput :aria-label="`Language, ${size}`" />
        <ComboboxCancel />
        <ComboboxTrigger />
      </ComboboxAnchor>
      <ComboboxList>
        <ComboboxViewport>
          <ComboboxItem v-for="language in languages" :key="language" :value="language">{{ language }}</ComboboxItem>
        </ComboboxViewport>
      </ComboboxList>
    </Combobox>
  </div>
</template>
